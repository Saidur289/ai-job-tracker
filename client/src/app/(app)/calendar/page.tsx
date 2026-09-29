'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CalendarEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    type: 'CUSTOM'
  });

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['calendar', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      // In a real app, you'd pass start and end dates to filter the month
      const { data } = await api.get('/calendar');
      return data.events as CalendarEvent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/calendar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      setOpen(false);
      setForm({ title: '', description: '', startAt: '', endAt: '', type: 'CUSTOM' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/calendar/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startAt || !form.endAt) return;
    createMutation.mutate({
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
    });
  };

  const events = eventsData || [];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const getEventColor = (type: string) => {
    switch(type) {
      case 'INTERVIEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'DEADLINE': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'FOLLOW_UP': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="font-semibold min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="ml-2 h-8" onClick={today}>Today</Button>
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Calendar Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input placeholder="e.g. Follow up with Google" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v || 'CUSTOM'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="DEADLINE">Deadline</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({...form, startAt: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({...form, endAt: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input placeholder="Details..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex-1 min-h-[600px] flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {/* Pad start of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="border-r border-b border-border bg-muted/10 last:border-r-0" />
            ))}
            
            {days.map((day) => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.startAt), day));
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={day.toISOString()} className={cn("min-h-[100px] border-r border-b border-border p-2 hover:bg-muted/30 transition-colors", !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/10")}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-sm", isToday && "bg-primary text-primary-foreground font-bold")}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                    {dayEvents.map(event => (
                      <div key={event.id} className={cn("group text-xs p-1 px-1.5 rounded border truncate flex justify-between items-center cursor-pointer", getEventColor(event.type))}>
                        <span className="truncate" title={event.title}>{event.title}</span>
                        <Trash2 
                          className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-red-500 shrink-0" 
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(event.id); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
