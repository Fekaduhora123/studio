'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Church, ShieldCheck, PieChart, Users, Heart, 
  Calendar as CalendarIcon, MapPin, Clock, ArrowRight, 
  Loader2, Play, BookOpen, Sunrise, Sunset, 
  Menu, X, Sparkles, Megaphone, Video, ChevronDown,
  Facebook, Instagram, Youtube, Twitter, UserCircle
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

  const heroImg = PlaceHolderImages.find(img => img.id === 'church-exterior');
  const interiorImg = PlaceHolderImages.find(img => img.id === 'hero-church');
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
    <div className="flex flex-col min-h-screen bg-background font-body antialiased selection:bg-primary/20">
      
      {/* 1. ANIMATED NAVBAR WITH TOP LOGIN BAR */}
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 flex flex-col",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-primary/5" : "bg-transparent"
      )}>
        {/* TOP UTILITY BAR */}
        <div className={cn(
          "w-full py-2 px-6 md:px-12 flex justify-end transition-all border-b",
          isScrolled ? "border-primary/5 bg-primary/5" : "border-white/5 bg-black/10"
        )}>
          <Link href="/login" className={cn(
            "text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2",
            isScrolled ? "text-secondary hover:text-secondary/80" : "text-secondary hover:text-secondary/80"
          )}>
            <div className="h-1 w-1 rounded-full bg-secondary animate-pulse" />
            <UserCircle className="h-3 w-3" />
            {user ? 'Admin Dashboard' : 'Administrator Login'}
          </Link>
        </div>

        <div className="h-20 flex items-center px-6 md:px-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg">
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
                  "text-[11px] font-bold uppercase tracking-widest transition-colors text-secondary hover:text-secondary/70",
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-2">
              <Button asChild variant="default" size="sm" className="bg-secondary hover:bg-secondary/90 rounded-full px-6 font-bold uppercase text-[9px] tracking-widest h-10 shadow-lg">
                <Link href="/donate">Join Us Now</Link>
              </Button>
            </div>
          </nav>

          <button 
            className="ml-auto lg:hidden text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-8 w-8 text-white" /> : <Menu className={cn("h-8 w-8", isScrolled ? "text-primary" : "text-white")} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-primary/95 flex flex-col items-center justify-center gap-8 z-[110] lg:hidden"
            >
              <button 
                className="absolute top-6 right-6 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-10 w-10" />
              </button>
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-headline font-bold text-secondary uppercase tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-8 w-full px-12">
                <Button asChild className="bg-secondary text-primary font-black h-14 w-full rounded-full uppercase tracking-widest text-sm shadow-xl">
                  <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>Join Us Now</Link>
                </Button>
                <Button asChild variant="outline" className="border-secondary text-secondary h-14 w-full rounded-full uppercase tracking-widest text-sm">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{user ? 'Dashboard' : 'Login'}</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION (IMMERSIVE EXPERIENCE) */}
      <section className="relative h-screen flex items-end justify-center overflow-hidden">
        {heroImg && (
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <Image 
              src={heroImg.imageUrl} 
              alt="Mugher Full Gospel Sanctuary" 
              fill 
              className="object-cover object-left md:object-center brightness-[0.4]"
              priority
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        
        <div className="container relative z-20 pb-20 md:pb-32 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="inline-block p-1 md:p-2 bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/20 mb-6">
              <div className="bg-primary/40 px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-secondary">A Sanctuary of Transformation</span>
              </div>
            </div>
            
            <h1 className="text-[48px] font-roboto font-thin text-white leading-tight uppercase tracking-tight mb-8 max-w-5xl mx-auto drop-shadow-2xl">
              Welcome to <br /> Mugher Full Gospel
            </h1>
            
            <p className="text-white/80 text-sm md:text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed font-body">
              A community where faith meets action. Located in Muger Mokada at residential houses, we are dedicated to worshipping God and serving our neighbors with excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary text-white font-black uppercase tracking-widest px-10 h-16 rounded-full shadow-2xl hover:scale-105 transition-transform group">
                <Link href="#events">
                  Join Sunday Service <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest px-10 h-16 rounded-full backdrop-blur-md transition-all">
                <Link href="#events">View Announcements</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Explore More</span>
          <ChevronDown className="h-6 w-6 text-secondary" />
        </motion.div>
      </section>

      {/* 3. QUICK INFO SECTION */}
      <section className="relative z-30 -mt-16 container px-4 mx-auto grid md:grid-cols-3 gap-6">
        {[
          { icon: Sunrise, title: "Sunday Worship", desc: "Experience powerful worship every Sunday at 9:00 AM in our sanctuary.", color: "bg-primary", border: "border-primary/20" },
          { icon: BookOpen, title: "Prayer Fellowship", desc: "Mid-week gathering for deep study and communal prayer. Join the engine room.", color: "bg-secondary", border: "border-secondary/20" },
          { icon: MapPin, title: "Our Sanctuary", desc: "Muger Mokada, Ethiopia. Located at residential houses in the heart of our community.", color: "bg-accent", border: "border-accent/20" }
        ].map((info, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={cn("border bg-white p-8 rounded-[2rem] shadow-xl transition-all group relative overflow-hidden", info.border)}
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg", info.color)}>
              <info.icon className="text-white h-7 w-7" />
            </div>
            <h3 className="text-primary font-headline font-bold text-xl uppercase tracking-tighter mb-2">{info.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{info.desc}</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </motion.div>
        ))}
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 md:py-40 container px-4 mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative group">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10">
              {interiorImg && (
                <Image 
                  src={interiorImg.imageUrl} 
                  alt="Church Sanctuary" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              )}
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl z-0" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl z-20 border border-primary/5 hidden md:block">
              <p className="text-primary font-black text-4xl mb-1">15+</p>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Years of Ministry</p>
            </div>
          </div>
          
          <div className="space-y-8 text-center lg:text-left">
            <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[10px] px-6 py-1.5 rounded-full">
              Foundations of Faith
            </Badge>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-primary uppercase leading-[1.1] tracking-tighter">
              A Legacy of <br /> <span className="text-secondary italic">Spirit & Truth</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
              Mugher Full Gospel Church began with a simple vision: to bring the transformative power of the Gospel to our local community. Today, we are a thriving family of believers committed to excellence in worship and integrity in life.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-primary uppercase text-sm tracking-tight">Our Vision</h4>
                <p className="text-xs text-muted-foreground">To raise a generation that reflects the glory of God in all aspects of life.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-primary uppercase text-sm tracking-tight">Our Mission</h4>
                <p className="text-xs text-muted-foreground">Sharing the Gospel, building disciples, and serving Muger Mokada.</p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-primary text-white font-black h-16 px-12 rounded-full uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
              <Link href="#ministries">Our Full Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DAILY MANNA - Afaan Oromoo Bible Quotes */}
      {dailyQuote && (
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="container px-4 mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8 flex justify-center"
            >
              {dailyQuote.time === 'morning' ? <Sunrise className="h-16 w-16 text-secondary animate-pulse-slow" /> : <Sunset className="h-16 w-16 text-secondary animate-pulse-slow" />}
            </motion.div>
            <Badge variant="outline" className="mb-8 border-white/30 text-white font-black tracking-[0.3em] uppercase px-8 py-2">
              {dailyQuote.time === 'morning' ? 'Manna Ganamaa' : 'Nagaa Galgalaa'}
            </Badge>
            <blockquote className="max-w-4xl mx-auto px-4">
              <p className="text-2xl md:text-5xl font-headline font-semibold italic mb-10 leading-tight tracking-tight">
                "{dailyQuote.text}"
              </p>
              <footer className="flex flex-col items-center gap-4">
                <div className="h-px w-20 bg-secondary/50" />
                <cite className="text-secondary font-black uppercase tracking-[0.5em] not-italic text-sm md:text-base">
                  — {dailyQuote.ref}
                </cite>
              </footer>
            </blockquote>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px]" />
        </section>
      )}

      {/* 5. MINISTRIES GRID */}
      <section id="ministries" className="py-24 md:py-40 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <Badge className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-6 py-1.5 rounded-full border border-primary/10">Specialized Fellowships</Badge>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Our Ministries</h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">Discover a place where you belong, grow, and serve with others.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Youth Ministry", desc: "Empowering young leaders to influence their generation for the Kingdom." },
              { icon: Heart, title: "Women Fellowship", desc: "A vibrant community of sisters building their homes on prayer and faith." },
              { icon: Sparkles, title: "Prayer Ministry", desc: "The strategic engine room where we stand in the gap for our church." },
              { icon: Megaphone, title: "Outreach", desc: "Taking God's love beyond the sanctuary walls into the streets of Muger." }
            ].map((m, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15, boxShadow: "0 25px 50px -12px rgba(139, 0, 0, 0.15)" }}
                className="group p-10 bg-white rounded-[2.5rem] border border-primary/5 shadow-lg flex flex-col items-center text-center transition-all"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 shadow-inner">
                  <m.icon className="text-primary h-10 w-10 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-headline font-bold text-2xl text-primary uppercase tracking-tighter mb-4">{m.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{m.desc}</p>
                <Button variant="link" className="mt-6 text-primary font-black uppercase tracking-widest text-[10px] gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      <section id="events" className="py-24 md:py-40 bg-muted/20 border-y border-primary/5">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-secondary text-primary font-black uppercase tracking-widest text-[9px]">Church Calendar</Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-black text-primary uppercase tracking-tighter leading-none">
                Upcoming <br /> <span className="text-secondary italic">Gatherings</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary font-bold uppercase tracking-widest rounded-full px-10 h-14 border-2 hover:bg-primary/5">
              <Link href="#events">Explore Full Calendar</Link>
            </Button>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {eventsLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing Calendar...</p>
              </div>
            ) : events && events.length > 0 ? (
              events.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[3rem] p-10 shadow-xl border border-primary/5 group hover:-translate-y-2 transition-all"
                >
                  <div className="flex items-center justify-between mb-8">
                    <Badge className="bg-secondary/20 text-primary font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full">{event.category || 'Worship'}</Badge>
                    <div className="text-primary font-headline font-black text-3xl opacity-10 group-hover:opacity-20 transition-opacity">0{idx + 1}</div>
                  </div>
                  <h3 className="text-2xl font-headline font-black text-primary uppercase leading-tight mb-6 group-hover:text-secondary transition-colors">{event.title}</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary"><CalendarIcon className="h-4 w-4" /></div> {event.date}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary"><Clock className="h-4 w-4" /></div> {event.time}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-8">{event.description}</p>
                  <Button variant="ghost" className="p-0 text-primary font-black uppercase tracking-[0.2em] text-[10px] gap-2 hover:bg-transparent group-hover:text-secondary">
                    View Details <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-muted-foreground font-medium italic">No events scheduled. Check back soon for our next gathering.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. SERMONS SECTION */}
      <section id="sermons" className="py-24 md:py-40 container px-4 mx-auto">
        <div className="text-center space-y-4 mb-20">
          <Badge className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-6 py-1.5">Spiritual Nourishment</Badge>
          <h2 className="text-4xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Sermon Gallery</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">Revisit powerful messages from our pulpit anytime, anywhere.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: "The Power of Unwavering Faith", speaker: "Pastor James M.", date: "May 24, 2024", id: 1 },
            { title: "Living with Integrity in 2024", speaker: "Elder Samson K.", date: "June 2, 2024", id: 2 },
            { title: "The Joy of Abundant Service", speaker: "Pastor James M.", date: "June 9, 2024", id: 3 }
          ].map((s) => (
            <motion.div 
              key={s.id} 
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5"
            >
              <div className="relative aspect-video overflow-hidden">
                {sermonImg && (
                  <Image 
                    src={sermonImg.imageUrl} 
                    alt={s.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="text-white fill-white h-8 w-8 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-xl font-headline font-black text-primary uppercase tracking-tight mb-6 leading-tight group-hover:text-secondary transition-colors">{s.title}</h3>
                <div className="flex items-center justify-between border-t border-primary/5 pt-6">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.speaker}</span>
                  <span className="text-[10px] font-black uppercase text-secondary tracking-widest">{s.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. DONATION SECTION */}
      <section className="py-24 md:py-40 bg-accent text-white relative overflow-hidden">
        <div className="container px-4 mx-auto text-center relative z-10 space-y-10">
          <Badge className="bg-secondary text-primary font-black uppercase tracking-[0.5em] px-10 py-2.5 rounded-full mb-4">Honoring God with Wealth</Badge>
          <h2 className="text-4xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-[0.85] max-w-5xl mx-auto">
            Your Support Fuels <br /> <span className="text-secondary italic">Our Mission</span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Every tithe and offering helps us expand our reach in Muger Mokada, maintain our sanctuary, and support our community outreach initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
            <Button asChild size="lg" className="bg-white text-primary font-black uppercase tracking-widest px-14 h-20 rounded-full shadow-2xl hover:scale-105 transition-transform text-lg">
              <Link href="/donate">Log Contribution</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 font-black uppercase tracking-widest px-14 h-20 rounded-full backdrop-blur-sm text-lg">
              <Link href="/donate">Upload QR Receipt</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[200px]" />
        </div>
      </section>

      {/* 9. TESTIMONIES SECTION */}
      <section className="py-24 md:py-40 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-24">
            <Badge className="bg-secondary/20 text-primary font-black uppercase tracking-widest text-[10px] px-6 py-1.5">Transformed Lives</Badge>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Testimonies</h2>
            <p className="text-muted-foreground font-medium text-lg">Voices from our church family sharing the goodness of God.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {[
              { name: "Sintayehu B.", text: "Walking through these doors was the start of a new chapter for my family. The support we found here is unparalleled.", initial: "S" },
              { name: "Abebe K.", text: "The Wednesday prayer fellowships have been my source of strength. God has restored my hope through this ministry.", initial: "A" },
              { name: "Tizita M.", text: "I love the transparency of the leadership. The AI-verified donations give me peace of mind in my giving.", initial: "T" }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-muted/30 p-12 rounded-[4rem] relative shadow-lg group hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute -top-6 left-12 w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <Sparkles className="text-primary h-7 w-7" />
                </div>
                <div className="space-y-8">
                  <p className="text-primary font-medium italic text-xl leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4 border-t border-primary/10 pt-8">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black uppercase shadow-lg">
                      {t.initial}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-primary uppercase tracking-widest text-xs">{t.name}</span>
                      <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Church Member</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PHOTO GALLERY */}
      <section className="py-24 md:py-40 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-4xl md:text-7xl font-headline font-black text-primary uppercase tracking-tighter">Sacred Moments</h2>
            <p className="text-muted-foreground font-medium text-lg">Capturing our journey of faith in the heart of Muger Mokada.</p>
          </div>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {[worshipImg, baptismImg, interiorImg, heroImg, worshipImg, baptismImg].map((img, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.03 }}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl group break-inside-avoid mb-8"
              >
                {img && (
                  <Image 
                    src={img.imageUrl} 
                    alt={`Gallery Image ${i+1}`} 
                    width={600}
                    height={800}
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                )}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="outline" className="text-white border-white rounded-full bg-black/20 backdrop-blur-md uppercase font-black text-[10px] tracking-widest px-8">Explore Photo</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. INVITATION SECTION */}
      <section className="py-40 md:py-60 bg-black text-white relative overflow-hidden text-center">
        <div className="container relative z-10 px-4 space-y-10">
          <Badge className="bg-primary text-white font-black uppercase tracking-[0.5em] px-14 py-3.5 rounded-full mb-6">Your Seat is Reserved</Badge>
          <h2 className="text-5xl md:text-[9rem] font-headline font-black uppercase tracking-tighter leading-[0.75] max-w-6xl mx-auto drop-shadow-2xl">
            Experience <br /> <span className="text-secondary italic">Worship Together</span>
          </h2>
          <p className="text-white/60 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            We are waiting to welcome you this Sunday. Come experience the life-changing power of Christ with us.
          </p>
          <Button asChild size="lg" className="bg-primary text-white font-black uppercase tracking-widest px-20 h-24 rounded-full shadow-[0_25px_60px_-10px_rgba(139,0,0,0.5)] hover:scale-110 transition-transform text-2xl">
            <Link href="#events">Plan Your Visit</Link>
          </Button>
        </div>
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-black z-10" />
          {interiorImg && <Image src={interiorImg.imageUrl} alt="Sanctuary background" fill className="object-cover blur-sm" />}
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-white border-t border-primary/5 pt-32 pb-16">
        <div className="container px-4 mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                <Church className="h-7 w-7 text-white" />
              </div>
              <span className="font-headline font-black text-2xl tracking-tighter uppercase text-primary">MUGHER <span className="text-secondary">FULL GOSPEL</span></span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed font-medium">
              Muger Mokada, Ethiopia.<br />
              A sanctuary of faith dedicated to the restoration of hearts and community.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Quick Navigation</h4>
            <nav className="flex flex-col gap-5">
              {['Home', 'About Us', 'Ministries', 'Latest Events', 'Giving'].map((l) => (
                <Link key={l} href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">{l}</Link>
              ))}
            </nav>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Service Schedule</h4>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Sunday Worship</span>
                <p className="text-sm font-bold text-primary uppercase">Main Service • 9:00 AM</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Mid-Week Prayer</span>
                <p className="text-sm font-bold text-primary uppercase">Fellowship • Wed 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Ministry Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                <MapPin className="h-5 w-5 text-secondary" /> Muger Mokada, Residential Area
              </div>
              <div className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                <Clock className="h-5 w-5 text-secondary" /> Office: Mon-Fri 9AM-5PM
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 mx-auto pt-16 border-t border-primary/5 text-center space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary opacity-80">© 2024 Mugher Full Gospel Church • SanctuaryLink System</p>
          <div className="flex justify-center gap-6">
            <Link href="#" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
