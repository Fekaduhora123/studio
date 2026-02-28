'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Church, ShieldCheck, PieChart, Users, Heart, Calendar as CalendarIcon, MapPin, Clock, ArrowRight, Loader2, X, LogIn } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const firestore = useFirestore();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-church');
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const eventsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'events'), 
      orderBy('createdAt', 'desc'),
      limit(6)
    );
  }, [firestore]);

  const { data: events, loading } = useCollection(eventsQuery);

  return (
    <div className="flex flex-col min-h-screen font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight">SanctuaryLink</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <Link className="hidden md:inline-flex text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="hidden md:inline-flex text-sm font-medium hover:text-primary transition-colors" href="#events">
            Events
          </Link>
          <Link className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors" href="/donate">
            Donate
          </Link>
          <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            </Button>
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 hidden sm:flex">
              <Link href="/dashboard">Admin Dashboard</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background overflow-hidden border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Management Built for Faith Communities
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    SanctuaryLink empowers your church with secure donation tracking, member management, and AI-driven financial insights. Modern ministry, simplified.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="px-8 bg-primary">
                    <Link href="/donate">Submit a Donation</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 border-primary text-primary hover:bg-primary/10">
                    <Link href="#events">View Upcoming Events</Link>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <Badge className="bg-accent text-accent-foreground mb-2">What's Happening</Badge>
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl text-primary">Upcoming Events</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join us in fellowship and community service.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-primary border-primary/20">
                          {event.category || 'Worship'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-headline font-bold line-clamp-2">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-accent" /> {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-accent" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" /> {event.location}
                        </div>
                      </div>
                      <p className="text-sm line-clamp-3 text-slate-600 leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full group gap-2 text-primary hover:bg-primary/5 p-0 justify-start"
                            onClick={() => setSelectedEvent(event)}
                          >
                            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <Badge className="w-fit mb-2 bg-accent text-accent-foreground">
                              {event.category || 'Worship'}
                            </Badge>
                            <DialogTitle className="text-2xl font-headline font-bold text-primary">
                              {event.title}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                              Full details for {event.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                <CalendarIcon className="h-5 w-5 text-accent" />
                                <div className="text-sm">
                                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                                  <p className="font-medium">{event.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                <Clock className="h-5 w-5 text-accent" />
                                <div className="text-sm">
                                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Time</p>
                                  <p className="font-medium">{event.time}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                <MapPin className="h-5 w-5 text-accent" />
                                <div className="text-sm">
                                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Location</p>
                                  <p className="font-medium">{event.location}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">About this Event</p>
                              <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 bg-white p-4 rounded-lg border">
                                {event.description}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground italic">
                  No upcoming events scheduled at this time.
                </div>
              )}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" className="border-primary text-primary">
                <Link href="/login">View All Events</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl text-primary">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your church efficiently and transparently.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                <Users className="h-10 w-10 text-accent" />
                <h3 className="text-xl font-bold font-headline">Member Management</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Register and track members, ministry groups, and community involvement with ease.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                <Heart className="h-10 w-10 text-accent" />
                <h3 className="text-xl font-bold font-headline">Donation Control</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Securely track Tithes, Offerings, and GoFund campaigns with detailed history.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                <PieChart className="h-10 w-10 text-accent" />
                <h3 className="text-xl font-bold font-headline">AI Reporting</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Get automated financial summaries and anomaly alerts powered by advanced AI.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center space-y-4 text-center">
            <ShieldCheck className="h-16 w-16 text-accent mb-4" />
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Secure and Transparent</h2>
            <p className="max-w-[700px] text-primary-foreground/80 md:text-xl/relaxed">
              Role-based access ensures that financial data is only seen by those who need it, fostering trust within your congregation.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/donate">Contribute Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-muted-foreground">© 2024 SanctuaryLink. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
