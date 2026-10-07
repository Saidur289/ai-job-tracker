'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { Resume } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export default function ResumesPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.gsap-animate', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'expo.out',
    });
  }, { scope: container });

  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: resumesData, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data } = await api.get('/resumes');
      return data.resumes as Resume[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setUploading(false);
    },
    onError: () => setUploading(false)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploading(true);
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const resumes = resumesData || [];

  return (
    <div ref={container} className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 gsap-animate">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Resumes</h1>
          <p className="text-muted-foreground text-lg">Manage your resumes and get AI reviews</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="gsap-animate">
        <Card className="border-border/50 shadow-sm bg-card/80 backdrop-blur-sm transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/60 hover:bg-muted/30 hover:border-primary/40'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4">
                <div className={`rounded-2xl bg-primary/10 p-5 transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
                  {uploading ? (
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {isDragActive ? 'Drop resume here' : 'Click or drag to upload'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume List */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 gsap-animate">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : resumes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No resumes uploaded yet</div>
        ) : (
          resumes.map((resume, idx) => (
            <div key={resume.id} className="h-full">
              <Card className="group border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur-sm hover:border-primary/30 h-full flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 ring-1 ring-blue-100 dark:ring-blue-800 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={resume.name}>{resume.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{formatDate(resume.createdAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                      onClick={() => deleteMutation.mutate(resume.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-border/50 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Linked Jobs</span>
                    <span className="font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md">{resume._count?.jobs || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
