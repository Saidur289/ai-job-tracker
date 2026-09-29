import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const jobsRouter = Router();
jobsRouter.use(authenticate);

const createJobSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  location: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  status: z.enum(['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN', 'ACCEPTED']).optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  resumeId: z.string().optional(),
});

const updateJobSchema = createJobSchema.partial();

// GET /api/jobs
jobsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    const where: any = { userId: req.user!.id };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { [sortBy as string]: order },
      include: {
        _count: { select: { notes: true, interviews: true } },
      },
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
jobsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
          include: { questions: true },
        },
        resume: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs
jobsRouter.post('/', validate(createJobSchema), async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.create({
      data: {
        ...req.body,
        userId: req.user!.id,
        appliedAt: req.body.status === 'APPLIED' ? new Date() : undefined,
      },
    });

    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id
jobsRouter.put('/:id', validate(updateJobSchema), async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.job.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const updateData: any = { ...req.body };
    if (req.body.status === 'APPLIED' && existing.status === 'SAVED') {
      updateData.appliedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id
jobsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.job.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});
