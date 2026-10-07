'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Job, JobStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Building2, Loader2, DollarSign } from 'lucide-react';
import { jobStatusColors, jobStatusLabels, formatRelativeDate, cn } from '@/lib/utils';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

const KANBAN_COLUMNS: JobStatus[] = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'];

export default function JobsPage() {
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
  const [search, setSearch] = useState('');
  
  // Local state for optimistic updates during drag
  const [localJobs, setLocalJobs] = useState<Job[]>([]);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get('/jobs');
      return data.jobs as Job[];
    },
  });

  useEffect(() => {
    if (jobsData) {
      setLocalJobs(jobsData);
    }
  }, [jobsData]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => api.put(`/jobs/${id}`, { status }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const [newJob, setNewJob] = useState({ company: '', position: '', url: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addJobMutation = useMutation({
    mutationFn: (data: any) => api.post('/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsDialogOpen(false);
      setNewJob({ company: '', position: '', url: '' });
      toast.success('Job added successfully!');
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as JobStatus;
    
    // Optimistic update
    setLocalJobs(prev => prev.map(job => 
      job.id === draggableId ? { ...job, status: newStatus } : job
    ));

    // API Call
    updateStatusMutation.mutate({ id: draggableId, status: newStatus });
  };

  const filteredJobs = search
    ? localJobs.filter(
        (j) =>
          j.company.toLowerCase().includes(search.toLowerCase()) ||
          j.position.toLowerCase().includes(search.toLowerCase())
      )
    : localJobs;

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div ref={container} className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 mb-6 gsap-animate">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Jobs Board</h1>
          <p className="text-muted-foreground text-lg">{localJobs.length} total applications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Add Job
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Track a new job you are applying for.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={newJob.position}
                  onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Job URL (Optional)</Label>
                <Input
                  id="url"
                  value={newJob.url}
                  onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!newJob.company || !newJob.position || addJobMutation.isPending} onClick={() => addJobMutation.mutate({ company: newJob.company, position: newJob.position, jobUrl: newJob.url, status: 'SAVED' })}>
                {addJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md shrink-0 mb-6 gsap-animate">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by company or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 border-border/50 bg-card/50 backdrop-blur-sm"
        />
      </div>

      <div className="flex-1 min-h-0 gsap-animate">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start h-full scrollbar-thin">
            {KANBAN_COLUMNS.map((status) => {
              const columnJobs = filteredJobs.filter((j) => j.status === status);
              
              return (
                <div key={status} className="w-[320px] flex-shrink-0 flex flex-col max-h-full bg-muted/20 backdrop-blur-md rounded-xl p-3 border border-border/40 shadow-sm">
                <div className="mb-3 flex items-center justify-between shrink-0 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("px-2.5 py-1", jobStatusColors[status])}>
                      {jobStatusLabels[status]}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">{columnJobs.length}</span>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 overflow-y-auto min-h-[150px] space-y-3 p-1 rounded-lg transition-colors",
                        snapshot.isDraggingOver && "bg-muted/50"
                      )}
                    >
                      {columnJobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{...provided.draggableProps.style}}
                            >
                              <Link href={`/jobs/${job.id}`} className="block">
                                <Card className={cn("cursor-grab active:cursor-grabbing transition-all hover:border-primary/40 hover:shadow-md border-border/40 bg-card/90 backdrop-blur-sm", snapshot.isDragging && "shadow-xl border-primary ring-1 ring-primary/30 rotate-2 scale-105")}>
                                  <CardContent className="p-4">
                                    <p className="font-semibold text-sm leading-tight text-foreground">{job.position}</p>
                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {job.company}
                                      </div>
                                      {job.location && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                          <MapPin className="h-3.5 w-3.5" />
                                          <span className="truncate">{job.location}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                      {job.salary ? (
                                        <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                          <DollarSign className="h-3 w-3 mr-0.5" /> {job.salary}
                                        </span>
                                      ) : (
                                        <span />
                                      )}
                                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                                        {formatRelativeDate(job.createdAt)}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
        </DragDropContext>
      </div>
    </div>
  );
}
