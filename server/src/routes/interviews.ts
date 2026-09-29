import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const interviewsRouter = Router();
interviewsRouter.use(authenticate);

const createInterviewSchema = z.object({
  jobId: z.string(),
  type: z.enum(['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL', 'PANEL']),
  scheduledAt: z.string().datetime(),
  duration: z.number().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
});

const updateInterviewSchema = createInterviewSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  feedback: z.string().optional(),
});

// GET /api/interviews
interviewsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { userId: req.user!.id },
      orderBy: { scheduledAt: 'asc' },
      include: {
        job: { select: { id: true, company: true, position: true } },
        _count: { select: { questions: true } },
      },
    });
    res.json({ interviews });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// POST /api/interviews
interviewsRouter.post('/', validate(createInterviewSchema), async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.body.jobId, userId: req.user!.id },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const interview = await prisma.interview.create({
      data: {
        ...req.body,
        userId: req.user!.id,
        scheduledAt: new Date(req.body.scheduledAt),
      },
      include: { job: { select: { company: true, position: true } } },
    });

    res.status(201).json({ interview });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// PUT /api/interviews/:id
interviewsRouter.put('/:id', validate(updateInterviewSchema), async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.interview.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    const data: any = { ...req.body };
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);

    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data,
      include: { job: { select: { company: true, position: true } } },
    });

    res.json({ interview });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// DELETE /api/interviews/:id
interviewsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.interview.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    await prisma.interview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});
