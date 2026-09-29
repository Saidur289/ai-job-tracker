'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Resume } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileSearch, Target, FileText, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function AIToolsPage() {
  const [resumeId, setResumeId] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [company, setCompany] = useState('');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  
  // States to hold results
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [coverLetterResult, setCoverLetterResult] = useState<any>(null);
  const [questionsResult, setQuestionsResult] = useState<any>(null);

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data } = await api.get('/resumes');
      return data.resumes as Resume[];
    },
  });

  const resumes = resumesData || [];
  
  // Dummy text for resume parsing (in a real app, backend would parse the PDF or we send the stored text)
  const getResumeText = () => {
    return "Dummy Resume Text: Senior Software Engineer with 5 years experience in React and Node.js...";
  };

  const reviewMutation = useMutation({
    mutationFn: (text: string) => api.post('/ai/resume-review', { resumeText: text }),
    onSuccess: (data) => setReviewResult(data.data),
  });

  const atsMutation = useMutation({
    mutationFn: (data: any) => api.post('/ai/ats-score', data),
    onSuccess: (data) => setAtsResult(data.data),
  });

  const coverLetterMutation = useMutation({
    mutationFn: (data: any) => api.post('/ai/cover-letter', data),
    onSuccess: (data) => setCoverLetterResult(data.data),
  });

  const questionsMutation = useMutation({
    mutationFn: (data: any) => api.post('/ai/interview-questions', data),
    onSuccess: (data) => setQuestionsResult(data.data),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> AI Assistant
        </h1>
        <p className="text-muted-foreground">Supercharge your job search with AI-powered tools</p>
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="review" className="flex items-center gap-2"><FileSearch className="h-4 w-4" /> Resume Review</TabsTrigger>
          <TabsTrigger value="ats" className="flex items-center gap-2"><Target className="h-4 w-4" /> ATS Scorer</TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Cover Letter</TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Prep Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Resume Review</CardTitle>
              <CardDescription>Get instant, actionable feedback on your resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Resume</label>
                <Select value={resumeId} onValueChange={(v) => setResumeId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Choose a uploaded resume" /></SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => reviewMutation.mutate(getResumeText())} 
                disabled={!resumeId || reviewMutation.isPending}
                className="w-full"
              >
                {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Analyze Resume
              </Button>

              {reviewResult && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Score & Sections */}
                  <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-6 w-full text-left">Resume Score Overview</h3>
                    
                    {/* Glowing Circular Progress Mockup */}
                    <div className="relative flex items-center justify-center w-48 h-48 mb-8">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="stroke-muted fill-none" strokeWidth="8" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          className="stroke-blue-500 fill-none drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" 
                          strokeWidth="8" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * (reviewResult.overallScore / 100))}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-sm text-muted-foreground">Overall Score</span>
                        <span className="text-4xl font-extrabold text-blue-500 drop-shadow-sm">{reviewResult.overallScore}<span className="text-xl text-muted-foreground">/100</span></span>
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      {reviewResult.sections?.map((sec: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              </div>
                              <span className="font-semibold text-sm">{sec.name}: <span className="font-normal text-muted-foreground">{sec.score}/100</span></span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">{sec.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: AI Suggestions */}
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">AI Suggestions (Actionable Tips)</h3>
                    <div className="space-y-4">
                      {reviewResult.suggestions?.map((tip: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start bg-muted/30 p-3 rounded-lg border border-border/50">
                          <div className="mt-0.5 bg-blue-500/10 p-1.5 rounded text-blue-500">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <p className="text-sm leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ats">
          <Card>
            <CardHeader>
              <CardTitle>ATS Match Scorer</CardTitle>
              <CardDescription>Compare your resume against a specific job description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Resume</label>
                <Select value={resumeId} onValueChange={(v) => setResumeId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Choose a uploaded resume" /></SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea rows={6} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the job description here..." />
              </div>
              <Button 
                onClick={() => atsMutation.mutate({ resumeText: getResumeText(), jobDescription: jobDesc })} 
                disabled={!resumeId || !jobDesc || atsMutation.isPending}
                className="w-full"
              >
                {atsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Calculate Match Score
              </Button>
              
              {atsResult && (
                <div className="mt-8 border rounded-xl shadow-sm bg-card overflow-hidden">
                  <div className="bg-muted/30 p-8 border-b text-center">
                    <h3 className="text-5xl font-extrabold text-blue-500 drop-shadow-sm mb-2">Match Score: {atsResult.score}%</h3>
                    <p className="text-muted-foreground">Based on analysis of your resume vs the job description.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t">
                    <div className="p-6">
                      <h4 className="font-bold text-emerald-500 mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Matched Keywords
                      </h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {atsResult.matchedKeywords?.map((k: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-3 w-3 text-emerald-500" />
                            {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-destructive mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        Missing Keywords
                      </h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {atsResult.missingKeywords?.map((k: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Target className="h-3 w-3 text-destructive" />
                            {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letter">
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Generator</CardTitle>
              <CardDescription>Generate a tailored cover letter instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Resume</label>
                  <Select value={resumeId} onValueChange={(v) => setResumeId(v || '')}>
                    <SelectTrigger><SelectValue placeholder="Choose a uploaded resume" /></SelectTrigger>
                    <SelectContent>
                      {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea rows={4} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the job description here..." />
              </div>
              <Button 
                onClick={() => coverLetterMutation.mutate({ resumeText: getResumeText(), jobDescription: jobDesc, companyName: company })} 
                disabled={!resumeId || !jobDesc || !company || coverLetterMutation.isPending}
                className="w-full"
              >
                {coverLetterMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate Cover Letter
              </Button>

              {coverLetterResult && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                  <h4 className="font-semibold mb-2">Generated Cover Letter</h4>
                  <p className="text-sm whitespace-pre-wrap font-serif bg-background p-4 rounded border">
                    {coverLetterResult.coverLetter}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interview Prep</CardTitle>
              <CardDescription>Generate mock interview questions based on the job.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Type</label>
                <Select value={interviewType} onValueChange={(v) => setInterviewType(v || '')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                    <SelectItem value="PHONE">Phone Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea rows={5} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the job description..." />
              </div>
              <Button 
                onClick={() => questionsMutation.mutate({ jobDescription: jobDesc, interviewType })} 
                disabled={!jobDesc || questionsMutation.isPending}
                className="w-full"
              >
                {questionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate Questions
              </Button>

              {questionsResult && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold">Practice Questions</h4>
                  {questionsResult.questions?.map((q: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-primary">Q{i + 1}: {q.question}</p>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{q.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Tip:</span> {q.tip}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
