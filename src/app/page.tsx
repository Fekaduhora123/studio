'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Church, ShieldCheck, PieChart, Users, Heart, 
  Calendar as CalendarIcon, MapPin, Clock, ArrowRight, 
  Loader2, Play, BookOpen, Sunrise, Sunset, 
  Menu, X, Sparkles, Megaphone, Video
} from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [dailyQuote, setDailyQuote] = React.useState<{ text: string, ref: string, time: 'morning' | 'evening' } | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 17) {
      setDailyQuote({
        text: "Ganama ganama gaarummaa keetiin nu quubsi, nuyis bara jireenya keenya hundumaa gammachuudhaan sitti haa ilillinu!",
        ref: "Faarfannaa 90:14",
        time: 'morning'
      });
    } else {
      setDailyQuote({
        text: "Ani nagaadhaan nan ciisa, nan rafas, si qofatu yaaddoo malee na jiraachisa yaa Waaqayyo!",
        ref: "Faarfannaa 4:8",
        time: 'evening'
      });
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const eventsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore]);

  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);

  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-church');
  const exteriorImg = PlaceHolderImages.find(img => img.id === 'church-exterior');
  const worshipImg = PlaceHolderImages.find(img => img.id === 'worship-hands');
  const sermonImg = PlaceHolderImages.find(img => img.id === 'sermon-video');
  const baptismImg = PlaceHolderImages.find(img => img.id === 'baptism');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Ministries', href: '#ministries' },
    { name: 'Events', href: '#events' },
    { name: 'Sermons', href: '#sermons' },
    { name: 'Donate', href: '/donate' },
  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body selection:bg-primary/20">
      
      {/* 1. ANIMATED NAVBAR */}
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 h-20 flex items-center px-6 md:px-12",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-primary/5" : "bg-transparent"
      )}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Church className="h-6 w-6 text-white" />
          </div>
          <span className={cn(
            "font-headline font-black text-xl tracking-tighter uppercase",
            isScrolled ? "text-primary" : "text-white"
          )}>MUGHER <span className="text-secondary">FULL GOSPEL</span></span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-8 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-secondary",
                isScrolled ? "text-foreground" : "text-white/80"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-2">
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 rounded-full px-6 font-bold uppercase text-[9px] tracking-widest h-10">
              <Link href="/donate">Join Us</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className={cn(
              "rounded-full px-6 font-bold uppercase text-[9px] tracking-widest h-10 border-2",
              isScrolled ? "border-primary text-primary" : "border-white text-white hover:bg-white/10"
            )}>
              <Link href="/login">{user ? 'Dashboard' : 'Login'}</Link>
            </Button>
          </div>
        </nav>

        <button 
          className="ml-auto lg:hidden text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className={cn("h-8 w-8", isScrolled ? "text-primary" : "text-white")} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div className={cn(
          "fixed inset-0 bg-primary/95 flex flex-col items-center justify-center gap-8 transition-transform duration-500 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-headline font-bold text-white uppercase tracking-tighter"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="bg-secondary text-primary font-bold h-12 px-12 rounded-full">
            <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>Donate Now</Link>
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImg && (
          <Image 
            src={heroImg.imageUrl} 
            alt="Mugher Full Gospel Sanctuary" 
            fill 
            className="object-cover scale-110 animate-pulse-slow opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background z-10" />
        
        <div className="container relative z-20 text-center px-4">
          <Badge className="mb-6 bg-secondary text-primary font-black uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
            A Place of Transformation
          </Badge>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-[0.9] uppercase tracking-tighter mb-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Welcome to <br /> <span className="text-secondary drop-shadow-2xl">Mugher Full Gospel</span>
          </h1>
          <p className="text-white/70 text-sm md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            A community dedicated to worshipping God, growing in faith, and serving the residents of Muger Mokada with love and integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Button asChild size="lg" className="bg-primary text-white font-black uppercase tracking-widest px-10 h-14 rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Link href="#events">Join Sunday Service</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-black uppercase tracking-widest px-10 h-14 rounded-full backdrop-blur-md">
              <Link href="#events">View Announcements</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 z-20">
          <div className="h-10 w-6 border-2 border-white rounded-full flex justify-center pt-2">
            <div className="h-2 w-1 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* 3. QUICK INFO SECTION */}
      <section className="relative z-30 -mt-20 container px-4 mx-auto grid md:grid-cols-3 gap-6">
        {[
          { icon: Sunrise, title: "Sunday Worship", desc: "Join us every Sunday at 9:00 AM", color: "bg-primary" },
          { icon: BookOpen, title: "Prayer Fellowship", desc: "Weekly gathering for spiritual growth", color: "bg-secondary" },
          { icon: MapPin, title: "Church Location", desc: "Muger Mokada, Ethiopia (Residential Area)", color: "bg-black" }
        ].map((info, i) => (
          <Card key={i} className="border-none glass-dark hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <CardHeader className="p-8">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg", info.color)}>
                <info.icon className="text-white h-6 w-6" />
              </div>
              <CardTitle className="text-white font-headline font-bold text-xl uppercase tracking-tighter">{info.title}</CardTitle>
              <p className="text-white/60 text-sm mt-2">{info.desc}</p>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 md:py-32 container px-4 mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group">
            {exteriorImg && (
              <Image 
                src={exteriorImg.imageUrl} 
                alt="Church Exterior" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
          </div>
          <div className="space-y-8 text-center lg:text-left">
            <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[10px] px-6 py-1 rounded-full">
              Mana Waaqayyoo
            </Badge>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-primary uppercase leading-none tracking-tighter">
              About Our <br /> <span className="text-secondary">Beloved Church</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
              Mugher Full Gospel Church is a community of believers dedicated to worship, discipleship, and service. Our mission is to share the Gospel of Jesus Christ and build a strong faith community in Muger Mokada.
            </p>
            <div className="p-6 bg-primary/5 rounded-3xl border-l-8 border-secondary italic text-primary/80 font-medium">
              "Bakka namoonni lama yookiin sadii maqa kootiin walitti qabamanitti, ani achuma gidduu isaaniittin argama." - Maatewos 18:20
            </div>
            <Button asChild size="lg" className="bg-primary text-white font-bold h-14 px-12 rounded-full uppercase tracking-widest shadow-xl">
              <Link href="#ministries">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DAILY MANNA - Bible Quote Integration */}
      {dailyQuote && (
        <section className="py-20 bg-primary text-white relative overflow-hidden">
          <div className="container px-4 mx-auto text-center relative z-10">
            <div className="mb-6 flex justify-center">
              {dailyQuote.time === 'morning' ? <Sunrise className="h-12 w-12 text-secondary animate-pulse" /> : <Sunset className="h-12 w-12 text-secondary animate-pulse" />}
            </div>
            <Badge variant="outline" className="mb-6 border-white/20 text-white font-black tracking-widest uppercase">
              {dailyQuote.time === 'morning' ? 'Manna Ganamaa' : 'Nagaa Galgalaa'}
            </Badge>
            <blockquote className="max-w-3xl mx-auto">
              <p className="text-2xl md:text-4xl font-headline font-medium italic mb-6 leading-tight">
                "{dailyQuote.text}"
              </p>
              <cite className="text-secondary font-black uppercase tracking-[0.3em] not-italic text-sm">
                — {dailyQuote.ref}
              </cite>
            </blockquote>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[150px]" />
        </section>
      )}

      {/* 5. MINISTRIES GRID */}
      <section id="ministries" className="py-24 md:py-32 container px-4 mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Our Ministries</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">Engage, grow, and serve within our specialized fellowships.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: "Youth Ministry", desc: "Empowering the next generation for Christ." },
            { icon: Heart, title: "Women Fellowship", desc: "Sisterhood built on faith and prayer." },
            { icon: Sparkles, title: "Prayer Ministry", desc: "The engine room of our spiritual life." },
            { icon: Megaphone, title: "Outreach", desc: "Sharing God's love with the community." }
          ].map((m, i) => (
            <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 group bg-white rounded-3xl overflow-hidden hover:-translate-y-2">
              <div className="h-2 bg-secondary" />
              <CardHeader className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-500">
                  <m.icon className="text-primary h-8 w-8 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="font-headline font-bold text-xl text-primary uppercase tracking-tighter mb-4">{m.title}</CardTitle>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{m.desc}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      <section id="events" className="py-24 md:py-32 bg-muted/30 border-y">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter leading-none">
                Upcoming <br /> <span className="text-secondary">Fellowship</span>
              </h2>
              <p className="text-muted-foreground font-medium">Join our vibrant gatherings and worship services.</p>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary font-bold uppercase tracking-widest rounded-full px-8 h-12">
              <Link href="#events">View All Events</Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {eventsLoading ? (
              <div className="col-span-full flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <Card key={event.id} className="border-none shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-all">
                  <CardHeader className="p-8 pb-4">
                    <Badge className="w-fit mb-4 bg-secondary text-primary font-black uppercase tracking-widest text-[9px]">{event.category || 'General'}</Badge>
                    <CardTitle className="text-2xl font-headline font-bold text-primary group-hover:text-secondary transition-colors uppercase leading-tight">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      <CalendarIcon className="h-4 w-4 text-secondary" /> {event.date}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="h-4 w-4 text-secondary" /> {event.time}
                    </div>
                    <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">{event.description}</p>
                  </CardContent>
                  <CardFooter className="p-8 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="p-0 text-primary font-black uppercase tracking-[0.2em] text-[10px] gap-2 hover:bg-transparent hover:text-secondary">
                          Explore More <ArrowRight className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-3xl font-headline font-black text-primary uppercase">{event.title}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-2xl">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</p>
                              <p className="font-bold text-primary">{event.date}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-2xl">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Time</p>
                              <p className="font-bold text-primary">{event.time}</p>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-muted-foreground">No upcoming events scheduled.</div>
            )}
          </div>
        </div>
      </section>

      {/* 7. SERMONS SECTION */}
      <section id="sermons" className="py-24 md:py-32 container px-4 mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Sermon Gallery</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">Watch and listen to the Word of God anytime, anywhere.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="border-none shadow-xl rounded-3xl overflow-hidden group cursor-pointer">
              <div className="relative aspect-video overflow-hidden">
                {sermonImg && (
                  <Image 
                    src={sermonImg.imageUrl} 
                    alt="Sermon thumbnail" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-500 border border-white/30 shadow-2xl">
                    <Play className="text-white fill-white h-6 w-6" />
                  </div>
                </div>
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-headline font-bold text-primary group-hover:text-secondary transition-colors uppercase tracking-tight">The Power of Unwavering Faith</CardTitle>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pastor James M.</span>
                  <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">May 24, 2024</span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. DONATION SECTION */}
      <section className="py-24 md:py-32 bg-primary text-white relative overflow-hidden">
        <div className="container px-4 mx-auto text-center relative z-10 space-y-8">
          <Badge className="bg-secondary text-primary font-black uppercase tracking-[0.4em] px-8 py-2 rounded-full">Support the Ministry</Badge>
          <h2 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none max-w-4xl mx-auto">
            Your Giving Helps Us <br /> <span className="text-secondary">Spread the Gospel</span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Every contribution directly supports our mission in Muger Mokada and beyond. Join us in building a legacy of faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="bg-white text-primary font-black uppercase tracking-widest px-12 h-16 rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Link href="/donate">Give Donation Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 font-black uppercase tracking-widest px-12 h-16 rounded-full">
              <Link href="/donate">Upload Receipt</Link>
            </Button>
          </div>
        </div>
        {/* Abstract light particles/shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-4 h-4 bg-secondary rounded-full animate-pulse-slow" />
          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-secondary rounded-full animate-pulse-slow delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-secondary rounded-full animate-pulse-slow delay-2000" />
        </div>
      </section>

      {/* 9. TESTIMONIES SECTION */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Life Stories</h2>
            <p className="text-muted-foreground font-medium">Hear how God is moving in the lives of our members.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Sintayehu B.", text: "Finding this community was the greatest blessing for my family. The love here is real and infectious." },
              { name: "Abebe K.", text: "My faith has grown tremendously through the Wednesday prayer meetings. I feel empowered." },
              { name: "Tizita M.", text: "A church that truly cares about transparency. SanctuaryLink makes me feel secure in my giving." }
            ].map((t, i) => (
              <Card key={i} className="border-none shadow-xl p-10 rounded-[3rem] bg-white relative">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-primary h-6 w-6" />
                </div>
                <CardContent className="pt-6 space-y-6">
                  <p className="text-slate-700 font-medium italic text-lg leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-black text-primary uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <span className="font-headline font-bold text-primary uppercase tracking-widest text-xs">{t.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PHOTO GALLERY */}
      <section className="py-24 md:py-32 container px-4 mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Sacred Moments</h2>
          <p className="text-muted-foreground font-medium">Capturing our journey of faith and fellowship.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[worshipImg, baptismImg, exteriorImg, heroImg, worshipImg, baptismImg].map((img, i) => (
            <div key={i} className={cn(
              "relative rounded-2xl overflow-hidden shadow-lg group",
              i % 3 === 0 ? "row-span-2 h-[400px] md:h-[600px]" : "h-[200px] md:h-[292px]"
            )}>
              {img && (
                <Image 
                  src={img.imageUrl} 
                  alt="Gallery image" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              )}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="outline" className="text-white border-white rounded-full bg-black/20 backdrop-blur-sm">View Photo</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. INVITATION SECTION */}
      <section className="py-24 md:py-40 bg-black text-white relative overflow-hidden text-center">
        <div className="container relative z-10 px-4 space-y-8">
          <Badge className="bg-secondary text-primary font-black uppercase tracking-[0.5em] px-12 py-3 rounded-full mb-4">Plan Your Visit</Badge>
          <h2 className="text-4xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-[0.8]">
            Experience <br /> <span className="text-secondary">Worship Together</span>
          </h2>
          <p className="text-white/60 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            Everyone is welcome to experience the transformative power of worship, prayer, and fellowship this Sunday.
          </p>
          <Button asChild size="lg" className="bg-primary text-white font-black uppercase tracking-widest px-16 h-20 rounded-full shadow-[0_20px_60px_-10px_rgba(255,255,255,0.2)] hover:scale-110 transition-transform text-xl">
            <Link href="#events">Plan Your Visit</Link>
          </Button>
        </div>
        {/* Background gradient shadow */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-white border-t pt-24 pb-12">
        <div className="container px-4 mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Church className="h-6 w-6 text-white" />
              </div>
              <span className="font-headline font-black text-xl tracking-tighter uppercase text-primary">MUGHER <span className="text-secondary">FULL GOSPEL</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Muger Mokada, Ethiopia.<br />
              A sanctuary of faith and community restoration.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Quick Links</h4>
            <nav className="flex flex-col gap-4">
              {['About', 'Events', 'Sermons', 'Donate', 'Contact'].map((l) => (
                <Link key={l} href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tighter">{l}</Link>
              ))}
            </nav>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Service Times</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-bold text-slate-700 uppercase">Sunday Worship</span>
                <span className="text-xs font-black text-secondary uppercase">9:00 AM</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-bold text-slate-700 uppercase">Prayer Meeting</span>
                <span className="text-xs font-black text-secondary uppercase">Wed 6 PM</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Connect With Us</h4>
            <div className="flex gap-4">
              {['FB', 'IG', 'YT', 'TW'].map((s) => (
                <Link key={s} href="#" className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm">{s}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="container px-4 mx-auto pt-12 border-t text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">© 2024 Mugher Full Gospel Church • SanctuaryLink</p>
          <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-muted-foreground opacity-50">Faith • Transparency • Community</p>
        </div>
      </footer>
    </div>
  );
}
