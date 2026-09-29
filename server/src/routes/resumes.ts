import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const resumesRouter = Router();
resumesRouter.use(authenticate);

// GET /api/resumes
resumesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { jobs: true } } },
    });
    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// POST /api/resumes
resumesRouter.post('/', upload.single('file') as any, async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.id,
        name: req.body.name || req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
      },
    });

    res.status(201).json({ resume });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// GET /api/resumes/:id
resumesRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { jobs: { select: { id: true, company: true, position: true } } },
    });

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// DELETE /api/resumes/:id
resumesRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    await prisma.resume.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});
