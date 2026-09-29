'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Job, Interview } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react';
import { formatDate, jobStatusColors, jobStatusLabels, cn } from '@/lib/utils';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage() {
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get('/jobs');
      return data.jobs as Job[];
    },
  });

  const { data: interviewsData } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await api.get('/interviews');
      return data.interviews as Interview[];
    },
  });

  const jobs = jobsData || [];
  const interviews = interviewsData || [];

  const totalJobs = jobs.length;
  const activeApps = jobs.filter((j) => ['APPLIED', 'SCREENING', 'INTERVIEWING'].includes(j.status)).length;
  const upcomingInterviews = interviews.filter((i) => i.status === 'SCHEDULED' && new Date(i.scheduledAt) > new Date()).length;
  const offerRate = totalJobs > 0 ? Math.round((jobs.filter((j) => ['OFFER', 'ACCEPTED'].includes(j.status)).length / totalJobs) * 100) : 0;

  const recentJobs = jobs.slice(0, 5);
  const upcomingInterviewsList = interviews
    .filter((i) => i.status === 'SCHEDULED' && new Date(i.scheduledAt) > new Date())
    .slice(0, 5);

  // Chart Data
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'Saved', value: statusCounts['SAVED'] || 0, color: '#94a3b8' },
    { name: 'Applied', value: statusCounts['APPLIED'] || 0, color: '#3b82f6' },
    { name: 'Screening', value: statusCounts['SCREENING'] || 0, color: '#a855f7' },
    { name: 'Interviewing', value: statusCounts['INTERVIEWING'] || 0, color: '#f59e0b' },
    { name: 'Offer', value: statusCounts['OFFER'] || 0, color: '#10b981' },
    { name: 'Rejected', value: statusCounts['REJECTED'] || 0, color: '#ef4444' },
  ];

  if (jobsLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job search progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{totalJobs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Apps</p>
              <p className="text-2xl font-bold">{activeApps}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
              <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold">{upcomingInterviews}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900">
              <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offer Rate</p>
              <p className="text-2xl font-bold">{offerRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-muted bg-muted/10">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>Number of applications in each stage</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <Link href={`/jobs/${job.id}`} key={job.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="overflow-hidden pr-4">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{job.company}</p>
                        <p className="text-sm text-muted-foreground truncate">{job.position}</p>
                      </div>
                      <Badge variant="secondary" className={cn("shrink-0", jobStatusColors[job.status])}>
                        {jobStatusLabels[job.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingInterviewsList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming interviews.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviewsList.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between border-l-2 border-primary pl-3">
                      <div>
                        <p className="font-medium text-sm">{interview.job?.company}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(interview.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Badge variant="outline">{interview.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
