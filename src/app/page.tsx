
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
    <div className="flex flex-col min-h-screen font-body text-slate-900 overflow-x-hidden bg-background">
      <header className="px-4 lg:px-6 h-16 md:h-20 flex items-center border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <Church className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="font-headline font-bold text-sm md:text-xl tracking-tight uppercase text-primary">MUGHER FULL GOSPEL</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-6 items-center">
          <Link className="hidden lg:inline-flex text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="hidden sm:inline-flex text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#events">
            Events
          </Link>
          <Link className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/donate">
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
        {/* Cinema-Style Hero Section with Content at the Bottom */}
        <section className="relative w-full h-[100svh] overflow-hidden flex items-end justify-center pb-10 md:pb-16">
          {exteriorImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={exteriorImage.imageUrl}
                alt="Mugher Full Gospel Church Exterior"
                fill
                className="object-cover object-left animate-dropDownLeft"
                priority
                data-ai-hint="church exterior"
              />
            </div>
          )}
          {/* Light Airy Overlay */}
          <div className="absolute inset-0 bg-white/10 z-10" />
          
          <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center">
            {/* Minimized padding and rounding for a sleeker look */}
            <div className="animate-dropDownLeft bg-white/90 backdrop-blur-lg p-6 md:p-8 text-center rounded-[2rem] border border-primary/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] max-w-4xl w-full">
              <Badge className="mb-3 bg-accent text-accent-foreground font-bold tracking-[0.2em] uppercase text-[8px] md:text-[10px] px-3 py-0.5 animate-fadeInText-title shadow-sm">
                Growing Together in Faith
              </Badge>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-headline font-bold tracking-tighter text-primary uppercase animate-fadeInText-title leading-[1.1] md:leading-[1.2]">
                MUGHER <br className="hidden md:block" /> <span className="text-accent">FULL GOSPEL</span> CHURCH
              </h1>
              <p className="mt-4 text-slate-600 text-[10px] md:text-sm lg:text-base leading-relaxed max-w-[600px] mx-auto animate-fadeInText-subtitle px-2 font-medium opacity-90">
                A community where faith meets action. SanctuaryLink ensures transparency and secure contribution tracking for every member of our church family.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center animate-fadeInText-subtitle">
                <Button asChild size="lg" className="w-full sm:w-auto px-6 bg-primary font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all h-10 md:h-12 text-[9px] md:text-[10px] text-white">
                  <Link href="/donate">Secure Donation</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-6 border-primary text-primary hover:bg-primary/5 font-bold uppercase tracking-widest hover:scale-105 transition-all h-10 md:h-12 text-[9px] md:text-[10px]">
                  <Link href="#events">Upcoming Fellowship</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Designed Sanctuary Section (Bible Image) */}
        <section id="sanctuary" className="w-full py-16 md:py-24 bg-white border-b overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-muted/20 w-full transform -rotate-1 lg:-rotate-2">
                {sanctuaryImage && (
                  <Image
                    src={sanctuaryImage.imageUrl}
                    alt={sanctuaryImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={sanctuaryImage.imageHint}
                  />
                )}
                {/* AMEEN animated overlay - scripture removed as requested */}
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center p-6 md:p-12 text-center backdrop-blur-[1px]">
                  <div className="animate-dropDown">
                    <p className="text-white text-2xl md:text-5xl font-black uppercase tracking-[0.6em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)] animate-pulse-slow">AMEEN</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <Badge variant="outline" className="w-fit mx-auto lg:mx-0 border-primary text-primary font-bold uppercase tracking-widest text-[9px]">The House of God</Badge>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tighter text-primary uppercase leading-tight">Our Sanctuary</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed italic text-xs md:text-sm font-medium border-l-4 border-accent pl-4 bg-muted/20 py-2">
                    "For where two or three are gathered together in my name, there am I in the midst of them." - Matthew 18:20
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-[11px] md:text-sm font-medium">
                    Located in Muger Mokada at residential houses, our sanctuary serves as a beacon of hope and a center for vibrant worship. We provide a welcoming atmosphere for all to seek spiritual growth and fellowship.
                  </p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="rounded-full border-primary text-primary font-bold uppercase tracking-widest text-[9px] px-6">Location Details</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Events Grid */}
        <section id="events" className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <div className="space-y-4">
                <Badge className="bg-primary text-white mb-2 font-bold uppercase tracking-widest text-[9px] px-4 py-1">Community & Fellowship</Badge>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-primary uppercase">Upcoming Events</h2>
                <div className="h-1 w-12 bg-accent mx-auto rounded-full" />
                <p className="max-w-[700px] text-muted-foreground text-[11px] md:text-base leading-relaxed mx-auto px-4 font-medium opacity-80">
                  Experience the life of our church. Join us for transformative worship and community events.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <Card key={event.id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group bg-white rounded-3xl overflow-hidden hover:-translate-y-2">
                    <div className="h-1.5 bg-primary group-hover:bg-accent transition-colors" />
                    <CardHeader className="pb-3 px-6 pt-6">
                      <Badge variant="outline" className="w-fit text-[8px] md:text-[9px] font-bold uppercase tracking-tighter border-primary/20 text-primary bg-primary/5 mb-3">
                        {event.category || 'Worship'}
                      </Badge>
                      <CardTitle className="text-base md:text-lg lg:text-xl font-headline font-bold line-clamp-2 text-primary group-hover:text-accent transition-colors">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 px-6">
                      <div className="space-y-2.5 text-[9px] md:text-[11px] text-muted-foreground mb-5 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2.5">
                          <CalendarIcon className="h-3 w-3 text-accent" /> {event.date}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-3 w-3 text-accent" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-3 w-3 text-accent" /> {event.location}
                        </div>
                      </div>
                      <p className="text-[10px] md:text-[12px] line-clamp-3 text-slate-600 leading-relaxed font-medium">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 pb-6 px-6">
                      {mounted && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full group/btn gap-2 text-primary hover:bg-primary/5 p-0 justify-start font-bold uppercase text-[8px] md:text-[9px] tracking-[0.2em] border-t pt-4 mt-1"
                            >
                              Explore Event <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover/btn:translate-x-2" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-3xl border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                            <div className="bg-primary p-6 md:p-10 text-white relative">
                              <Badge className="mb-4 bg-accent text-accent-foreground font-bold tracking-widest text-[9px]">
                                {event.category || 'Worship'}
                              </Badge>
                              <DialogTitle className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight leading-tight">
                                {event.title}
                              </DialogTitle>
                            </div>
                            <div className="p-8 md:p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                                  <p className="font-bold text-primary flex items-center gap-2 text-sm"><CalendarIcon className="h-3 w-3" /> {event.date}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Time</p>
                                  <p className="font-bold text-primary flex items-center gap-2 text-sm"><Clock className="h-3 w-3" /> {event.time}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                                  <p className="font-bold text-primary flex items-center gap-2 truncate text-sm"><MapPin className="h-3 w-3" /> {event.location}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b pb-2">Description</h4>
                                <div className="text-[11px] md:text-base leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
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
                <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] shadow-inner border-2 border-dashed border-muted mx-4">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-4 opacity-10 text-primary" />
                  <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Stay tuned for upcoming fellowships.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Management Integrity Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-primary uppercase">Management Integrity</h2>
              <p className="max-w-[700px] text-muted-foreground text-[10px] md:text-lg font-medium px-4 opacity-70">
                Powered by SANCTUARYLINK. Modern tools for a timeless mission.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3 px-4">
              <div className="group flex flex-col items-center space-y-5 p-7 rounded-[2rem] border border-muted bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors">
                  <Users className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold font-headline uppercase tracking-tight text-primary">Congregation</h3>
                <p className="text-[9px] md:text-[11px] text-muted-foreground text-center leading-relaxed font-medium">
                  Centralized data management for our growing family, ministries, and outreach programs.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-5 p-7 rounded-[2rem] border border-accent/10 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-accent/5 p-4 rounded-2xl group-hover:bg-accent transition-colors">
                  <Heart className="h-8 w-8 text-accent group-hover:text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold font-headline uppercase tracking-tight text-primary">Contributions</h3>
                <p className="text-[9px] md:text-[11px] text-muted-foreground text-center leading-relaxed font-medium">
                  Transparent tracking for Tithes and Offerings with secure AI-powered verification.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-5 p-7 rounded-[2rem] border border-muted bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors">
                  <PieChart className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold font-headline uppercase tracking-tight text-primary">Analytics</h3>
                <p className="text-[9px] md:text-[11px] text-muted-foreground text-center leading-relaxed font-medium">
                  Data-driven insights that help church leadership make prayerful, informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-white overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center space-y-8 text-center relative z-10">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-lg border border-white/10 animate-pulse-slow shadow-2xl">
              <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-accent" />
            </div>
            <h2 className="text-2xl md:text-5xl font-headline font-bold tracking-tighter uppercase leading-[0.9] md:leading-[1]">Trust Through <br /> <span className="text-accent">Transparency</span></h2>
            <p className="max-w-[650px] text-primary-foreground/80 text-[10px] md:text-base leading-relaxed px-4 font-medium italic opacity-90">
              "Every contribution at MUGHER FULL GOSPEL CHURCH is verified and handled with the highest integrity."
            </p>
            <div className="pt-2 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-white px-8 md:px-10 h-10 md:h-12 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all rounded-full">
                <Link href="/donate">Support Our Mission</Link>
              </Button>
            </div>
          </div>
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-0 w-64 md:w-[600px] h-64 md:h-[600px] bg-accent/10 rounded-full blur-[120px] md:blur-[180px] -translate-x-1/3 -translate-y-1/3 opacity-30" />
          <div className="absolute bottom-0 right-0 w-96 md:w-[800px] h-96 md:h-[800px] bg-accent/10 rounded-full blur-[140px] md:blur-[220px] translate-x-1/4 translate-y-1/4 opacity-30" />
        </section>
      </main>
      <footer className="flex flex-col gap-8 py-10 md:py-14 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white sm:flex-row">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-primary/5 p-2 rounded-lg">
            <Church className="h-5 w-5 md:h-7 md:w-7 text-primary" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-primary mb-0.5">MUGHER FULL GOSPEL CHURCH</p>
            <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">© 2024 SANCTUARYLINK • FAITH IN ACTION</p>
          </div>
        </div>
        <nav className="flex gap-6 sm:ml-auto">
          <Link className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5" href="#">
            Privacy
          </Link>
          <Link className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5" href="#">
            Terms
          </Link>
          <Link className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
