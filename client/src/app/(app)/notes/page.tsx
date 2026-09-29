'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Note } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, StickyNote, Trash2, Pin, Building2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data } = await api.get('/notes');
      return data.notes as Note[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setForm({ title: '', content: '' });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => api.put(`/notes/${id}`, { pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    createMutation.mutate(form);
  };

  const notes = notesData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Keep track of important details</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger >
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Input
                placeholder="Note Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10 font-medium"
                required
              />
              <Textarea
                placeholder="Write your note here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Note
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : notes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
             <div className="rounded-full bg-muted p-4 mb-4"><StickyNote className="h-8 w-8" /></div>
             <p className="text-lg font-medium">No notes yet</p>
             <p className="text-sm">Create your first note above</p>
          </div>
        ) : (
          notes.map(note => (
            <Card key={note.id} className={cn("group flex flex-col transition-shadow hover:shadow-md", note.pinned && "border-primary/50 bg-primary/5")}>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">{note.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6 -mr-2 -mt-1 shrink-0", note.pinned ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground")}
                    onClick={() => togglePinMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6 flex-1">
                  {note.content}
                </p>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {note.job ? (
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {note.job.company}</span>
                    ) : (
                      formatDate(note.createdAt)
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
