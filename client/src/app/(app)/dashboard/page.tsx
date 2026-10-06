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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

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
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Overview of your job search progress</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-semibold tracking-tight">{totalJobs}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-100 dark:ring-purple-800">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Apps</p>
              <p className="text-3xl font-semibold tracking-tight">{activeApps}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interviews</p>
              <p className="text-3xl font-semibold tracking-tight">{upcomingInterviews}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Offer Rate</p>
              <p className="text-3xl font-semibold tracking-tight">{offerRate}%</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1 border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Pipeline Overview</CardTitle>
            <CardDescription className="text-sm">Number of applications in each stage</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={12} tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="flex-1 border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Recent Applications</CardTitle>
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

          <Card className="flex-1 border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Upcoming Interviews</CardTitle>
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
      </motion.div>
    </motion.div>
  );
}
