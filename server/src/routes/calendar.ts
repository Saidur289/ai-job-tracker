import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const calendarRouter = Router();
calendarRouter.use(authenticate);

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  color: z.string().optional(),
  type: z.enum(['INTERVIEW', 'DEADLINE', 'FOLLOW_UP', 'CUSTOM']).optional(),
  referenceId: z.string().optional(),
});

// GET /api/calendar
calendarRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { start, end } = req.query;
    const where: any = { userId: req.user!.id };

    if (start && end) {
      where.startAt = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startAt: 'asc' },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/calendar
calendarRouter.post('/', validate(createEventSchema), async (req: AuthRequest, res) => {
  try {
    const event = await prisma.calendarEvent.create({
      data: {
        ...req.body,
        userId: req.user!.id,
        startAt: new Date(req.body.startAt),
        endAt: new Date(req.body.endAt),
      },
    });
    res.status(201).json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/calendar/:id
calendarRouter.put('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }

    const data: any = { ...req.body };
    if (data.startAt) data.startAt = new Date(data.startAt);
    if (data.endAt) data.endAt = new Date(data.endAt);

    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/calendar/:id
calendarRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }

    await prisma.calendarEvent.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});
