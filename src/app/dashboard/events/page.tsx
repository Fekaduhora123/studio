"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Megaphone, 
  Calendar, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';
import { draftAnnouncement, type DraftAnnouncementOutput } from '@/ai/flows/announcement-drafting-flow';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockEvents = [
  { id: 1, title: 'Sunday Morning Worship', date: 'May 21, 2024', time: '10:00 AM', location: 'Main Sanctuary', description: 'Join us for a powerful morning of praise and the word.' },
  { id: 2, title: 'Youth Night: Radical Faith', date: 'May 24, 2024', time: '6:30 PM', location: 'Community Hall', description: 'A night dedicated to empowering the next generation.' },
  { id: 3, title: 'Mid-week Prayer Meeting', date: 'May 22, 2024', time: '7:00 PM', location: 'Chapel', description: 'Coming together to seek the face of God for our community.' },
];

export default function EventsPage() {
  const [draftInput, setDraftInput] = React.useState('');
  const [draftResult, setDraftResult] = React.useState('');
  const [isDrafting, setIsDrafting] = React.useState(false);

  const handleAIDraft = async () => {
    if (!draftInput) return;
    setIsDrafting(true);
    try {
      const result = await draftAnnouncement({
        contentType: 'event',
        keyPoints: draftInput
      });
      setDraftResult(result.draftedContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Announcements & Events</h1>
          <p className="text-muted-foreground">Keep the congregation informed and engaged.</p>
        </div>
        <Button className="gap-2 bg-primary">
          <Plus className="h-4 w-4" /> Create New
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="bg-white/50 border mb-4">
              <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">Upcoming Events</TabsTrigger>
              <TabsTrigger value="announcements" className="data-[state=active]:bg-primary data-[state=active]:text-white">Announcements</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="space-y-4 m-0">
              {mockEvents.map((event) => (
                <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-accent/10 text-accent-foreground border-accent/20">Worship</Badge>
                      <Button variant="ghost" size="icon" className="group-hover:text-primary">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl font-headline font-bold mt-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary/60" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" /> {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary/60" /> {event.location}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed">{event.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button variant="secondary" size="sm" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/10">RSVP</Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">Share <ExternalLink className="h-3 w-3" /></Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="announcements" className="space-y-4 m-0">
              <Card className="border-none shadow-sm p-8 text-center text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No new general announcements today.</p>
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
                {isDrafting ? "Drafting..." : "Draft Announcement"}
              </Button>

              {draftResult && (
                <div className="space-y-2 pt-4 animate-in fade-in duration-500">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Draft</label>
                  <div className="p-4 bg-white rounded-lg border border-primary/20 text-sm leading-relaxed whitespace-pre-wrap">
                    {draftResult}
                  </div>
                  <Button variant="outline" className="w-full gap-2 text-xs border-primary text-primary hover:bg-primary/5">
                    <Send className="h-3 w-3" /> Post Announcement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Pastor's Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Sermon Notes: Faith Like a Seed', type: 'PDF' },
                { title: 'Worship Playlist - May', type: 'Link' },
                { title: 'Leadership Handbook v2', type: 'DOCX' },
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary">{res.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{res.type}</Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-primary hover:bg-primary/5">View all resources</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}