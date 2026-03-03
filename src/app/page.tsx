'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Church, ShieldCheck, PieChart, Users, Heart, Calendar as CalendarIcon, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
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
  const { user } = useUser();
  const exteriorImage = PlaceHolderImages.find(img => img.id === 'church-sanctuary');
  const sanctuaryImage = PlaceHolderImages.find(img => img.id === 'hero-church');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="flex flex-col min-h-screen font-body text-slate-900 overflow-x-hidden">
      <header className="px-4 lg:px-6 h-16 md:h-20 flex items-center border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <Church className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="font-headline font-bold text-sm md:text-xl tracking-tight uppercase">MUGHER FULL GOSPEL</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-6 items-center">
          <Link className="hidden lg:inline-flex text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors" href="#events">
            Events
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/donate">
            Donate
          </Link>
          <div className="border-l pl-2 sm:pl-4 ml-1 sm:ml-2">
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 h-8 md:h-9 px-3 md:px-4 uppercase font-bold text-[9px] md:text-[10px] tracking-widest">
              <Link href="/login">{user ? 'Dashboard' : 'Login'}</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        {/* Full Viewport Hero Section */}
        <section className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center">
          {exteriorImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={exteriorImage.imageUrl}
                alt="Mugher Full Gospel Church Exterior"
                fill
                className="object-cover"
                priority
                data-ai-hint="church exterior"
              />
            </div>
          )}
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          
          <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center justify-center">
            <div className="animate-fadeInOverlay bg-black/40 backdrop-blur-md p-6 md:p-12 text-center rounded-2xl border border-white/10 shadow-2xl max-w-3xl w-full">
              <Badge className="mb-4 bg-accent text-accent-foreground font-bold tracking-widest uppercase text-[10px] animate-fadeInText-title">
                Welcome to our community
              </Badge>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter text-white uppercase animate-fadeInText-title leading-tight">
                MUGHER FULL GOSPEL CHURCH
              </h1>
              <p className="mt-4 text-slate-200 text-sm md:text-xl leading-relaxed max-w-[600px] mx-auto animate-fadeInText-subtitle px-4">
                Faith-driven management for our growing congregation. SanctuaryLink ensures transparency and secure contribution tracking for every member.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-8 justify-center animate-fadeInText-subtitle">
                <Button asChild size="lg" className="w-full sm:w-auto px-8 bg-primary font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform h-12 md:h-14">
                  <Link href="/donate">Contribute Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 border-white text-white hover:bg-white/10 font-bold uppercase tracking-widest hover:scale-105 transition-transform h-12 md:h-14">
                  <Link href="#events">Fellowship</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="sanctuary" className="w-full py-12 md:py-24 bg-white border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border w-full">
                {sanctuaryImage && (
                  <Image
                    src={sanctuaryImage.imageUrl}
                    alt={sanctuaryImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={sanctuaryImage.imageHint}
                  />
                )}
                {/* Oromo Scripture Drop Down Animation */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 md:p-8 text-center">
                  <p className="text-white font-headline font-bold text-xs md:text-base lg:text-lg italic leading-relaxed animate-dropDown drop-shadow-xl">
                    "isaan dhugaa waa'ee waaqayyoo diddiiraniiru waqayyoon isa hundumaa uume dhisanii uumamaaf sagadanii ,hojjetaniif .waaqayyoo garuu bara baraan galateeffamaa dha '' <span className="text-accent uppercase not-italic">AMEEN</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-primary uppercase">Our Sanctuary</h2>
                <p className="text-muted-foreground leading-relaxed italic text-sm md:text-base">
                  "For where two or three are gathered together in my name, there am I in the midst of them." - Matthew 18:20
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  Located in the heart of Mugher, our sanctuary is a place of peace, reflection, and vibrant worship. We welcome everyone to experience the love of Christ in a community that cares.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 md:mb-16">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary mb-2 font-bold uppercase tracking-widest text-[10px]">Fellowship</Badge>
                <h2 className="text-2xl md:text-5xl font-headline font-bold tracking-tighter text-primary uppercase">Upcoming Events</h2>
                <p className="max-w-[800px] text-muted-foreground text-sm md:text-xl leading-relaxed mx-auto px-4">
                  Be a part of our ministry. Join us in worship, community service, and spiritual growth at MUGHER FULL GOSPEL CHURCH.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <Card key={event.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group bg-white hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                          {event.category || 'Worship'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg md:text-xl font-headline font-bold line-clamp-2 text-primary group-hover:text-accent transition-colors">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-xs md:text-sm text-muted-foreground mb-4 font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-accent" /> {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-accent" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 text-accent" /> {event.location}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm line-clamp-2 md:line-clamp-3 text-slate-600 leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      {mounted && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full group/btn gap-2 text-primary hover:bg-primary/5 p-0 justify-start font-bold uppercase text-[10px] tracking-widest"
                            >
                              Explore Details <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl border-none shadow-2xl rounded-xl">
                            <DialogHeader>
                              <Badge className="w-fit mb-2 bg-accent text-accent-foreground font-bold uppercase tracking-widest text-[10px]">
                                {event.category || 'Worship'}
                              </Badge>
                              <DialogTitle className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-tight">
                                {event.title}
                              </DialogTitle>
                              <DialogDescription className="sr-only">
                                Event details for {event.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/30 border border-primary/5">
                                  <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                                  <div className="text-xs md:text-sm">
                                    <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Date</p>
                                    <p className="font-bold">{event.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/30 border border-primary/5">
                                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                                  <div className="text-xs md:text-sm">
                                    <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Time</p>
                                    <p className="font-bold">{event.time}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/30 border border-primary/5">
                                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                                  <div className="text-xs md:text-sm">
                                    <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Location</p>
                                    <p className="font-bold">{event.location}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Event Overview</p>
                                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-slate-700 bg-white p-4 md:p-6 rounded-xl border shadow-inner">
                                  {event.description}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 md:py-24 text-muted-foreground italic bg-white rounded-2xl shadow-sm border mx-4">
                  <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm md:text-base">No upcoming fellowships currently listed.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-5xl font-headline font-bold tracking-tighter text-primary uppercase">Secure Management</h2>
                <p className="max-w-[800px] text-muted-foreground text-sm md:text-xl leading-relaxed px-4">
                  SANCTUARYLINK provides the tools necessary for efficient and transparent church operations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 md:gap-8 py-6 lg:grid-cols-3 px-4">
              <div className="flex flex-col items-center space-y-4 p-6 md:p-8 rounded-2xl border bg-background shadow-sm hover:shadow-xl transition-all">
                <div className="bg-primary/5 p-3 md:p-4 rounded-2xl">
                  <Users className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-tight">Congregation</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                  A centralized database for members, ministry groups, and community outreach efforts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 md:p-8 rounded-2xl border bg-background shadow-sm hover:shadow-xl transition-all">
                <div className="bg-accent/10 p-3 md:p-4 rounded-2xl">
                  <Heart className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                </div>
                <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-tight">Contributions</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                  Automated AI verification for Tithes and Offerings ensure every seed is accounted for.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 md:p-8 rounded-2xl border bg-background shadow-sm hover:shadow-xl transition-all">
                <div className="bg-primary/5 p-3 md:p-4 rounded-2xl">
                  <PieChart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-tight">Insights</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                  Advanced AI reporting provides financial summaries and health metrics for the leadership.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-32 bg-primary text-white overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center space-y-6 text-center relative z-10">
            <div className="bg-white/10 p-4 md:p-6 rounded-full backdrop-blur-sm mb-2">
              <ShieldCheck className="h-12 w-12 md:h-16 md:w-16 text-accent" />
            </div>
            <h2 className="text-3xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">Trust and Integrity</h2>
            <p className="max-w-[700px] text-primary-foreground/80 text-sm md:text-xl leading-relaxed px-4">
              We leverage cutting-edge AI to ensure every financial contribution to **MUGHER FULL GOSPEL CHURCH** is verified and handled with the highest level of security.
            </p>
            <div className="pt-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-8 md:px-12 h-12 md:h-14 font-bold uppercase tracking-widest text-base md:text-lg shadow-xl hover:scale-105 transition-transform">
                <Link href="/donate">Support Our Ministry</Link>
              </Button>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-accent/20 rounded-full blur-[80px] md:blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-accent/10 rounded-full blur-[100px] md:blur-[120px] translate-x-1/3 translate-y-1/3" />
        </section>
      </main>
      <footer className="flex flex-col gap-4 py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white sm:flex-row">
        <div className="flex items-center gap-2">
          <Church className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">© 2024 MUGHER FULL GOSPEL CHURCH</p>
        </div>
        <nav className="flex gap-6 sm:ml-auto">
          <Link className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">
            Policy
          </Link>
          <Link className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
