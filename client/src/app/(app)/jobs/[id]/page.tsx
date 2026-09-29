'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, MapPin, Globe, ExternalLink } from 'lucide-react';
import { jobStatusColors, jobStatusLabels, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data.job as Job;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-muted-foreground py-12">Job not found</p>;
  }

  const job = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job.position}</h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            )}
          </div>
        </div>
        <Badge className={jobStatusColors[job.status]}>{jobStatusLabels[job.status]}</Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes ({job.notes?.length || 0})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({job.interviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Job Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="ml-2">{job.jobType.replace('_', ' ')}</span></div>
                {job.salary && <div><span className="text-muted-foreground">Salary:</span> <span className="ml-2">{job.salary}</span></div>}
                {job.industry && <div><span className="text-muted-foreground">Industry:</span> <span className="ml-2">{job.industry}</span></div>}
                <div><span className="text-muted-foreground">Added:</span> <span className="ml-2">{formatDate(job.createdAt)}</span></div>
                {job.appliedAt && <div><span className="text-muted-foreground">Applied:</span> <span className="ml-2">{formatDate(job.appliedAt)}</span></div>}
              </div>
              {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> View Job Posting
                </a>
              )}
              {job.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-4">Notes feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-4">Interview tracker coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-4">AI tools coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
