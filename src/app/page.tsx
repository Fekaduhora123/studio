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
        {/* Premium Full Viewport Hero Section with Diagonal Drop-Down */}
        <section className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center">
          {exteriorImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={exteriorImage.imageUrl}
                alt="Mugher Full Gospel Church Exterior"
                fill
                className="object-cover animate-dropDownLeft"
                priority
                data-ai-hint="church exterior"
              />
            </div>
          )}
          {/* Dark Overlay for depth */}
          <div className="absolute inset-0 bg-black/65 z-10" />
          
          <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center justify-center">
            <div className="animate-dropDownLeft bg-black/40 backdrop-blur-md p-8 md:p-16 text-center rounded-3xl border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] max-w-4xl w-full">
              <Badge className="mb-6 bg-accent text-accent-foreground font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs px-4 py-1 animate-fadeInText-title">
                Growing Together in Faith
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-white uppercase animate-fadeInText-title leading-[1] md:leading-[1.1]">
                MUGHER <br className="hidden md:block" /> <span className="text-accent">FULL GOSPEL</span> CHURCH
              </h1>
              <p className="mt-8 text-slate-200 text-sm md:text-lg leading-relaxed max-w-[700px] mx-auto animate-fadeInText-subtitle px-4 font-medium opacity-90">
                A community where faith meets action. SanctuaryLink ensures transparency and secure contribution tracking for every member of our church family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-10 justify-center animate-fadeInText-subtitle">
                <Button asChild size="lg" className="w-full sm:w-auto px-10 bg-primary font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all h-14 md:h-16 text-xs md:text-sm">
                  <Link href="/donate">Secure Donation</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-10 border-white text-white hover:bg-white/10 font-bold uppercase tracking-widest hover:scale-105 transition-all h-14 md:h-16 text-xs md:text-sm">
                  <Link href="#events">Upcoming Fellowship</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Designed Sanctuary Section with dropping scripture overlay */}
        <section id="sanctuary" className="w-full py-16 md:py-32 bg-white border-b overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-muted/20 w-full transform -rotate-1 lg:-rotate-2">
                {sanctuaryImage && (
                  <Image
                    src={sanctuaryImage.imageUrl}
                    alt={sanctuaryImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={sanctuaryImage.imageHint}
                  />
                )}
                {/* Oromo Scripture Drop Down Animation Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 md:p-12 text-center backdrop-blur-[2px]">
                  <div className="animate-dropDown space-y-4">
                    <p className="text-white font-headline font-bold text-sm md:text-xl lg:text-2xl italic leading-relaxed drop-shadow-2xl">
                      "isaan dhugaa waa'ee waaqayyoo diddiiraniiru waqayyoon isa hundumaa uume dhisanii uumamaaf sagadanii ,hojjetaniif .waaqayyoo garuu bara baraan galateeffamaa dha"
                    </p>
                    <p className="text-accent text-lg md:text-2xl font-black uppercase tracking-widest mt-4">AMEEN</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <Badge variant="outline" className="w-fit mx-auto lg:mx-0 border-primary text-primary font-bold uppercase tracking-widest text-[10px]">The House of God</Badge>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-primary uppercase leading-tight">Our Sanctuary</h2>
                <p className="text-muted-foreground leading-relaxed italic text-base md:text-lg font-medium border-l-4 border-accent pl-4 bg-muted/20 py-2">
                  "For where two or three are gathered together in my name, there am I in the midst of them." - Matthew 18:20
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  Located in the heart of Mugher, our sanctuary serves as a beacon of hope and a center for vibrant worship. We provide a welcoming atmosphere for all to seek spiritual growth and fellowship.
                </p>
                <div className="pt-4">
                  <Button variant="outline" className="rounded-full border-primary text-primary font-bold uppercase tracking-widest text-[10px] px-8">Location Details</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Events Grid with responsive scaling */}
        <section id="events" className="w-full py-16 md:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-24">
              <div className="space-y-4">
                <Badge className="bg-primary text-white mb-2 font-bold uppercase tracking-widest text-[10px] px-4 py-1">Community & Fellowship</Badge>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter text-primary uppercase">Upcoming Events</h2>
                <div className="h-2 w-24 bg-accent mx-auto rounded-full" />
                <p className="max-w-[800px] text-muted-foreground text-sm md:text-xl leading-relaxed mx-auto px-4 font-medium">
                  Experience the life of our church. Join us for transformative worship and community events.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <Card key={event.id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group bg-white rounded-3xl overflow-hidden hover:-translate-y-2">
                    <div className="h-2 bg-primary group-hover:bg-accent transition-colors" />
                    <CardHeader className="pb-4">
                      <Badge variant="outline" className="w-fit text-[10px] font-bold uppercase tracking-tighter border-primary/20 text-primary bg-primary/5 mb-4">
                        {event.category || 'Worship'}
                      </Badge>
                      <CardTitle className="text-xl md:text-2xl font-headline font-bold line-clamp-2 text-primary group-hover:text-accent transition-colors">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3 text-xs md:text-sm text-muted-foreground mb-6 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-4 w-4 text-accent" /> {event.date}
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-accent" /> {event.time}
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-accent" /> {event.location}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm line-clamp-3 text-slate-600 leading-relaxed font-medium">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 pb-8 px-6">
                      {mounted && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full group/btn gap-2 text-primary hover:bg-primary/5 p-0 justify-start font-bold uppercase text-[10px] tracking-[0.2em] border-t pt-4 mt-2"
                            >
                              Explore Event <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-2" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-3xl border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                            <div className="bg-primary p-6 md:p-10 text-white relative">
                              <Badge className="mb-4 bg-accent text-accent-foreground font-bold tracking-widest text-[10px]">
                                {event.category || 'Worship'}
                              </Badge>
                              <DialogTitle className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tight leading-tight">
                                {event.title}
                              </DialogTitle>
                            </div>
                            <div className="p-8 md:p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                                  <p className="font-bold text-primary flex items-center gap-2"><CalendarIcon className="h-3 w-3" /> {event.date}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Time</p>
                                  <p className="font-bold text-primary flex items-center gap-2"><Clock className="h-3 w-3" /> {event.time}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-muted shadow-inner">
                                  <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                                  <p className="font-bold text-primary flex items-center gap-2 truncate"><MapPin className="h-3 w-3" /> {event.location}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-muted-foreground border-b pb-2">Description</h4>
                                <div className="text-sm md:text-lg leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
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
                <div className="col-span-full text-center py-24 bg-white rounded-[3rem] shadow-inner border-4 border-dashed border-muted mx-4">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-6 opacity-10 text-primary" />
                  <p className="text-sm md:text-lg font-bold uppercase tracking-widest text-muted-foreground">Stay tuned for upcoming fellowships.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* High-Contrast Management Integrity Section */}
        <section id="features" className="w-full py-16 md:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter text-primary uppercase">Management Integrity</h2>
              <p className="max-w-[800px] text-muted-foreground text-sm md:text-xl font-medium px-4">
                Powered by SANCTUARYLINK. Modern tools for a timeless mission.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3 px-4">
              <div className="group flex flex-col items-center space-y-6 p-10 rounded-[2.5rem] border-2 border-muted bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-primary/10 p-5 rounded-3xl group-hover:bg-primary transition-colors">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline uppercase tracking-tight text-primary">Congregation</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed font-medium">
                  Centralized data management for our growing family, ministries, and outreach programs.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-6 p-10 rounded-[2.5rem] border-2 border-accent/20 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-accent/10 p-5 rounded-3xl group-hover:bg-accent transition-colors">
                  <Heart className="h-10 w-10 md:h-12 md:w-12 text-accent group-hover:text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline uppercase tracking-tight text-primary">Contributions</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed font-medium">
                  Transparent tracking for Tithes and Offerings with secure AI-powered verification.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-6 p-10 rounded-[2.5rem] border-2 border-muted bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="bg-primary/10 p-5 rounded-3xl group-hover:bg-primary transition-colors">
                  <PieChart className="h-10 w-10 md:h-12 md:w-12 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline uppercase tracking-tight text-primary">Analytics</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed font-medium">
                  Data-driven insights that help church leadership make prayerful, informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* High-Impact Final CTA */}
        <section className="w-full py-24 md:py-48 bg-primary text-white overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center space-y-10 text-center relative z-10">
            <div className="bg-white/15 p-6 md:p-10 rounded-full backdrop-blur-xl border border-white/20 animate-pulse-slow shadow-2xl">
              <ShieldCheck className="h-16 w-16 md:h-24 md:w-24 text-accent" />
            </div>
            <h2 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter uppercase leading-[0.85] md:leading-[1]">Trust Through <br /> <span className="text-accent">Transparency</span></h2>
            <p className="max-w-[800px] text-primary-foreground/90 text-sm md:text-2xl leading-relaxed px-4 font-medium italic">
              "Every contribution at MUGHER FULL GOSPEL CHURCH is verified and handled with the highest integrity."
            </p>
            <div className="pt-8 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-white px-12 md:px-20 h-16 md:h-20 font-bold uppercase tracking-[0.3em] text-base md:text-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-105 transition-all rounded-full">
                <Link href="/donate">Support Our Mission</Link>
              </Button>
            </div>
          </div>
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-0 w-64 md:w-[600px] h-64 md:h-[600px] bg-accent/20 rounded-full blur-[120px] md:blur-[180px] -translate-x-1/3 -translate-y-1/3 opacity-40" />
          <div className="absolute bottom-0 right-0 w-96 md:w-[800px] h-96 md:h-[800px] bg-accent/15 rounded-full blur-[140px] md:blur-[220px] translate-x-1/4 translate-y-1/4 opacity-40" />
        </section>
      </main>
      <footer className="flex flex-col gap-8 py-12 md:py-20 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white sm:flex-row">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-primary/5 p-3 rounded-xl">
            <Church className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-1">MUGHER FULL GOSPEL CHURCH</p>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">© 2024 SANCTUARYLINK • FAITH IN ACTION</p>
          </div>
        </div>
        <nav className="flex gap-8 sm:ml-auto">
          <Link className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1" href="#">
            Privacy
          </Link>
          <Link className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1" href="#">
            Terms
          </Link>
          <Link className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
