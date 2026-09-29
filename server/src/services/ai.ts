import { GoogleGenAI, Type } from '@google/genai';

// Initialize with a dummy key if env var is missing so the server doesn't crash on boot
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy-key-replace-in-env',
});

const MODEL = 'gemini-3.5-flash';

export async function reviewResume(resumeText: string): Promise<{
  overallScore: number;
  sections: { name: string; score: number; feedback: string }[];
  suggestions: string[];
}> {
  const prompt = `You are an expert resume reviewer. Analyze the resume and provide structured feedback.
Return JSON with: overallScore (0-100), sections (array of {name, score, feedback}), and suggestions (array of strings).

Review this resume:
${resumeText}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}

export async function calculateATSScore(
  resumeText: string,
  jobDescription: string
): Promise<{
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}> {
  const prompt = `You are an ATS (Applicant Tracking System) simulator. Compare the resume against the job description and score it. 
Return JSON with: score (0-100), matchedKeywords (array of strings), missingKeywords (array of strings), suggestions (array of strings).

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName: string
): Promise<{ coverLetter: string }> {
  const prompt = `You are an expert cover letter writer. Write a professional, tailored cover letter. 
Return JSON with: coverLetter (string, the full cover letter text).

Write a cover letter for ${companyName}.

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}

export async function generateInterviewQuestions(
  jobDescription: string,
  interviewType: string
): Promise<{
  questions: { question: string; category: string; tip: string }[];
}> {
  const prompt = `You are an expert interview coach. Generate relevant interview questions for a ${interviewType} interview. 
Return JSON with: questions (array of {question, category, tip}).

Generate 10 interview questions for this role based on the following job description:

${jobDescription}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}
