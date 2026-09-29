'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Interview, Job } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Building2, Calendar as CalendarIcon, Video, Phone, Users, CheckCircle2, XCircle, Trash2, Loader2, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    jobId: '',
    type: 'VIDEO',
    scheduledAt: '',
    location: '',
    meetingUrl: ''
  });

  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await api.get('/interviews');
      return data.interviews as Interview[];
    },
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get('/jobs');
      return data.jobs as Job[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/interviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setOpen(false);
      setForm({ jobId: '', type: 'VIDEO', scheduledAt: '', location: '', meetingUrl: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/interviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/interviews/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jobId || !form.scheduledAt) return;
    createMutation.mutate({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString()
    });
  };

  const interviews = interviewsData || [];
  const jobs = jobsData || [];

  const getIcon = (type: string) => {
    switch(type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'PHONE': return <Phone className="h-4 w-4" />;
      case 'ONSITE': return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-muted-foreground">Track and prepare for your interviews</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger >
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" /> Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job</label>
                <Select value={form.jobId} onValueChange={(v) => setForm({...form, jobId: v || ''})}>
                  <SelectTrigger><SelectValue placeholder="Select a job" /></SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.company} - {j.position}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v || ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="ONSITE">On-site</SelectItem>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                      <SelectItem value="PANEL">Panel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting URL</label>
                <Input placeholder="https://zoom.us/..." value={form.meetingUrl} onChange={(e) => setForm({...form, meetingUrl: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location (Optional)</label>
                <Input placeholder="Office address" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || !form.jobId}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : interviews.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
             <div className="rounded-full bg-muted p-4 mb-4"><CalendarIcon className="h-8 w-8" /></div>
             <p className="text-lg font-medium">No interviews scheduled</p>
          </div>
        ) : (
          interviews.map(interview => {
            const isPast = new Date(interview.scheduledAt) < new Date();
            const statusMap: Record<string, { label: string, color: string }> = {
              SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
              COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
              CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
              NO_SHOW: { label: 'No Show', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
            };

            return (
              <Card key={interview.id} className={cn("group transition-shadow hover:shadow-md", isPast && interview.status === 'SCHEDULED' && "border-amber-500/50")}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        {getIcon(interview.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base leading-tight">{interview.job?.company}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{interview.job?.position}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusMap[interview.status].color}>
                      {statusMap[interview.status].label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span className={cn(isPast && interview.status === 'SCHEDULED' && "text-amber-600 dark:text-amber-400 font-medium")}>
                        {new Date(interview.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    
                    {interview.meetingUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Video className="h-4 w-4 shrink-0" />
                        <a href={interview.meetingUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    
                    {interview.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{interview.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex gap-1">
                      {interview.status === 'SCHEDULED' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatusMutation.mutate({ id: interview.id, status: 'COMPLETED' })}>
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Done
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatusMutation.mutate({ id: interview.id, status: 'CANCELLED' })}>
                            <XCircle className="h-4 w-4 mr-1.5" /> Cancel
                          </Button>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteMutation.mutate(interview.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
