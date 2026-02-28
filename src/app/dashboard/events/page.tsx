
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Megaphone, 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Send,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { draftAnnouncement } from '@/ai/flows/announcement-drafting-flow';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const eventSchema = z.object({
  title: z.string().min(2, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(5, "Description is required"),
  category: z.string().default("Worship"),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventsPage() {
  const firestore = useFirestore();
  const [draftInput, setDraftInput] = React.useState('');
  const [draftResult, setDraftResult] = React.useState('');
  const [isDrafting, setIsDrafting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any>(null);

  const eventsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: events, loading } = useCollection(eventsQuery);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      category: "Worship",
    },
  });

  React.useEffect(() => {
    if (editingEvent) {
      form.reset({
        title: editingEvent.title,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
        description: editingEvent.description,
        category: editingEvent.category || "Worship",
      });
    } else {
      form.reset({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Worship",
      });
    }
  }, [editingEvent, form]);

  const handleAIDraft = async () => {
    if (!draftInput) return;
    setIsDrafting(true);
    try {
      const result = await draftAnnouncement({
        contentType: 'event',
        keyPoints: draftInput
      });
      setDraftResult(result.draftedContent);
      form.setValue('description', result.draftedContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    if (!firestore) return;

    const eventData = {
      ...values,
      createdAt: serverTimestamp(),
    };

    if (editingEvent) {
      const eventRef = doc(firestore, 'events', editingEvent.id);
      updateDoc(eventRef, eventData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: eventRef.path,
          operation: 'update',
          requestResourceData: eventData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      addDoc(collection(firestore, 'events'), eventData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'events',
          operation: 'create',
          requestResourceData: eventData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const eventRef = doc(firestore, 'events', id);
    deleteDoc(eventRef).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: eventRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Announcements & Events</h1>
          <p className="text-muted-foreground">Keep the congregation informed and engaged.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingEvent(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary">
              <Plus className="h-4 w-4" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="Sunday Service" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl><Input placeholder="Worship" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl><Input type="text" placeholder="May 21, 2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl><Input type="text" placeholder="10:00 AM" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input placeholder="Main Sanctuary" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-primary">
                    {editingEvent ? 'Update Event' : 'Post Event'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="bg-white/50 border mb-4">
              <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">Live Events</TabsTrigger>
              <TabsTrigger value="announcements" className="data-[state=active]:bg-primary data-[state=active]:text-white">Announcements</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="space-y-4 m-0">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : events?.length === 0 ? (
                <Card className="border-none shadow-sm p-12 text-center text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No events scheduled. Create one to get started!</p>
                </Card>
              ) : events?.map((event) => (
                <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-accent/10 text-accent-foreground border-accent/20">
                        {event.category || 'Worship'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-headline font-bold mt-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary/60" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" /> {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary/60" /> {event.location}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button variant="secondary" size="sm" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/10">RSVP List</Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">Public Link <ExternalLink className="h-3 w-3" /></Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="announcements" className="space-y-4 m-0">
              <Card className="border-none shadow-sm p-8 text-center text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Use the AI drafter to create announcements for this section.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5 border-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg font-headline font-bold text-primary">AI Content Drafter</CardTitle>
              </div>
              <CardDescription>Quickly draft engaging descriptions for your events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Details</label>
                <Textarea 
                  placeholder="e.g. Choir practice this Friday, 7pm, new songs for June..." 
                  className="bg-white border-primary/20"
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-primary gap-2" 
                onClick={handleAIDraft}
                disabled={isDrafting || !draftInput}
              >
                {isDrafting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Draft Description"}
              </Button>

              {draftResult && (
                <div className="space-y-2 pt-4 animate-in fade-in duration-500">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Draft</label>
                  <div className="p-4 bg-white rounded-lg border border-primary/20 text-sm leading-relaxed whitespace-pre-wrap">
                    {draftResult}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-xs border-primary text-primary hover:bg-primary/5"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                  >
                    <Send className="h-3 w-3" /> Apply to Form
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Admin Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Update Sunday Bulletin', status: 'Pending' },
                { title: 'Verify Friday Attendance', status: 'Completed' },
                { title: 'Draft Month Summary', status: 'Upcoming' },
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${res.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-sm font-medium group-hover:text-primary">{res.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{res.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
