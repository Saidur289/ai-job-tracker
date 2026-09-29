import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const notesRouter = Router();
notesRouter.use(authenticate);

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  jobId: z.string().optional(),
  pinned: z.boolean().optional(),
});

// GET /api/notes
notesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.query;
    const where: any = { userId: req.user!.id };
    if (jobId && typeof jobId === 'string') where.jobId = jobId;

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { job: { select: { id: true, company: true, position: true } } },
    });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes
notesRouter.post('/', validate(createNoteSchema), async (req: AuthRequest, res) => {
  try {
    const note = await prisma.note.create({
      data: { ...req.body, userId: req.user!.id },
      include: { job: { select: { id: true, company: true, position: true } } },
    });
    res.status(201).json({ note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id
notesRouter.put('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) { res.status(404).json({ error: 'Note not found' }); return; }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: req.body,
      include: { job: { select: { id: true, company: true, position: true } } },
    });
    res.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id
notesRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) { res.status(404).json({ error: 'Note not found' }); return; }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});
