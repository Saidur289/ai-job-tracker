import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewResume, calculateATSScore, generateCoverLetter, generateInterviewQuestions } from '../services/ai';

export const aiRouter = Router();
aiRouter.use(authenticate);

const atsScoreSchema = z.object({
  resumeText: z.string().min(1),
  jobDescription: z.string().min(1),
});

const coverLetterSchema = z.object({
  resumeText: z.string().min(1),
  jobDescription: z.string().min(1),
  companyName: z.string().min(1),
});

const interviewQuestionsSchema = z.object({
  jobDescription: z.string().min(1),
  interviewType: z.string().min(1),
});

const resumeReviewSchema = z.object({
  resumeText: z.string().min(1),
});

// POST /api/ai/resume-review
aiRouter.post('/resume-review', validate(resumeReviewSchema), async (req, res) => {
  try {
    const result = await reviewResume(req.body.resumeText);
    res.json(result);
  } catch (error) {
    console.error('Resume review error:', error);
    res.status(500).json({ error: 'Failed to review resume' });
  }
});

// POST /api/ai/ats-score
aiRouter.post('/ats-score', validate(atsScoreSchema), async (req, res) => {
  try {
    const result = await calculateATSScore(req.body.resumeText, req.body.jobDescription);
    res.json(result);
  } catch (error) {
    console.error('ATS score error:', error);
    res.status(500).json({ error: 'Failed to calculate ATS score' });
  }
});

// POST /api/ai/cover-letter
aiRouter.post('/cover-letter', validate(coverLetterSchema), async (req, res) => {
  try {
    const result = await generateCoverLetter(req.body.resumeText, req.body.jobDescription, req.body.companyName);
    res.json(result);
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

// POST /api/ai/interview-questions
aiRouter.post('/interview-questions', validate(interviewQuestionsSchema), async (req, res) => {
  try {
    const result = await generateInterviewQuestions(req.body.jobDescription, req.body.interviewType);
    res.json(result);
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});
