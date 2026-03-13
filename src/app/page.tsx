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
  Facebook, Instagram, Youtube, Twitter, UserCircle,
  MessageSquare, Send, Camera
} from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [dailyQuote, setDailyQuote] = React.useState<{ text: string, ref: string, time: 'morning' | 'evening' } | null>(null);
  const [showFullHistory, setShowFullHistory] = React.useState(false);
  
  const [testimonyName, setTestimonyName] = React.useState('');
  const [testimonyContent, setTestimonyContent] = React.useState('');
  const [isSubmittingTestimony, setIsSubmittingTestimony] = React.useState(false);
  const [isTestimonyOpen, setIsTestimonyOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 17) {
      setDailyQuote({
        text: " Bara keenya guutuu gammadnee akka ililchinutti,ati ganama gaarummaa keetiin nu quufsi!",
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

  const testimoniesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonies'), where('status', '==', 'approved'), orderBy('timestamp', 'desc'), limit(3));
  }, [firestore]);

  const sermonsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sermons'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore]);

  const momentsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sacred_moments'), orderBy('createdAt', 'desc'), limit(4));
  }, [firestore]);

  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);
  const { data: dbTestimonies } = useCollection(testimoniesQuery);
  const { data: dbSermons } = useCollection(sermonsQuery);
  const { data: dbMoments } = useCollection(momentsQuery);

  const heroImg = PlaceHolderImages.find(img => img.id === 'church-exterior');
  const interiorImg = PlaceHolderImages.find(img => img.id === 'hero-church');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Ministries', href: '#ministries' },
    { name: 'Events', href: '#events' },
    { name: 'Sermons', href: '#sermons' },
    { name: 'Donate', href: '/donate' },
  ];

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !testimonyName || !testimonyContent) return;
    
    setIsSubmittingTestimony(true);
    try {
      await addDoc(collection(firestore, 'testimonies'), {
        name: testimonyName,
        content: testimonyContent,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      toast({
        title: "Testimony Received",
        description: "Your story has been submitted for review. Thank you for sharing!",
      });
      setTestimonyName('');
      setTestimonyContent('');
      setIsTestimonyOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmittingTestimony(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body antialiased selection:bg-primary/20">
      
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 flex flex-col",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-primary/5" : "bg-transparent"
      )}>
        <div className={cn(
          "w-full py-2 px-4 md:px-12 flex justify-end transition-all border-b",
          isScrolled ? "border-primary/5 bg-primary/5" : "border-white/5 bg-black/10"
        )}>
          <Link href="/login" className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-secondary hover:text-secondary/80">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <UserCircle className="h-4 w-4" />
            {user ? 'Admin Dashboard' : 'Administrator Login'}
          </Link>
        </div>

        <div className="h-16 md:h-20 flex items-center px-4 md:px-12">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative h-8 w-8 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg group-hover:scale-110 transition-transform bg-white">
              <Image 
                src="https://i.ibb.co/vxZd8ZzQ/photo-2026-03-06-15-19-1222.jpg" 
                alt="Mugher Full Gospel Logo" 
                fill 
                sizes="48px"
                className="object-cover"
              />
            </div>
            <span className={cn(
              "font-headline font-black text-sm md:text-xl tracking-tighter uppercase",
              isScrolled ? "text-primary" : "text-white"
            )}>MUGHER <span className="text-secondary">FULL GOSPEL</span></span>
          </Link>

          <nav className="hidden lg:flex ml-auto gap-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[14px] font-bold uppercase tracking-widest transition-colors text-secondary hover:text-secondary/70"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-2">
              <Button asChild variant="default" size="sm" className="bg-secondary hover:bg-secondary/90 rounded-full px-6 font-bold uppercase text-[11px] tracking-widest h-10 shadow-lg">
                <Link href="/donate">Join Us Now</Link>
              </Button>
            </div>
          </nav>

          <button 
            className="ml-auto lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className={cn("h-6 w-6", isScrolled ? "text-primary" : "text-white")} />}
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
                className="absolute top-6 right-6 text-white p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-8 w-8" />
              </button>
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl md:text-3xl font-headline font-bold text-secondary uppercase tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-8 w-full px-12">
                <Button asChild className="bg-secondary text-primary font-black h-12 md:h-14 w-full rounded-full uppercase tracking-widest text-xs md:text-sm shadow-xl">
                  <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>Join Us Now</Link>
                </Button>
                <Button asChild variant="outline" className="border-secondary text-secondary h-12 md:h-14 w-full rounded-full uppercase tracking-widest text-xs md:text-sm">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{user ? 'Dashboard' : 'Login'}</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative h-[100svh] flex items-end justify-center overflow-hidden">
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
              sizes="100vw"
              className="object-cover object-left md:object-center brightness-[0.4]"
              priority
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        
        <div className="container relative z-20 pb-16 md:pb-32 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="inline-block p-1 md:p-2 bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/20 mb-6">
              <div className="bg-primary/40 px-3 md:px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-secondary">A Sanctuary of Transformation</span>
              </div>
            </div>
            
            <h1 className="font-roboto font-bold text-secondary text-4xl md:text-6xl lg:text-7xl leading-tight uppercase tracking-tight mb-6 md:mb-8 max-w-5xl mx-auto drop-shadow-2xl">
              Welcome to <br /> Mugher Full Gospel
            </h1>
            
            <div className="space-y-4 max-w-3xl mx-auto mb-8 md:mb-10">
              <p className="text-white/80 font-robotoSlab font-normal text-base md:text-[20px] leading-relaxed">
                A place to worship God, grow in faith, and serve our community. Located in Mugher Mokada, we are dedicated to excellence in ministry.
              </p>
              <p className="text-white/70 font-bitter font-light italic text-base md:text-[20px] leading-relaxed">
                Iddoo Waaqayyo itti waaqeffatamu, amantiin itti guddatu, fi hawaasa keenya itti tajaajilludha. Muger Mokada keessatti kan argamnu yoo ta’u, tajaajila qulqullina qabuuf of laanneerra.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-white font-black uppercase tracking-widest px-8 md:px-10 h-14 md:h-16 rounded-full shadow-2xl hover:scale-105 transition-transform group">
                <Link href="#events">
                  Join Sunday <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest px-8 md:px-10 h-14 md:h-16 rounded-full backdrop-blur-md transition-all">
                <Link href="#events">Announcements</Link>
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

      <section className="relative z-30 -mt-10 md:-mt-16 container px-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { 
            icon: Sunrise, 
            title: "Sunday Service", 
            desc: "Sagantaan keenya idlee dilbataa akkummaa itti fufetti jirachuu isaa isinn beksiisna.sagantaan keenya kadhanaa,farfanaa,fi tajaajila barumsaa sunday 3:30-6:30", 
            color: "bg-primary", 
            border: "border-primary/20"
          },
          { 
            icon: BookOpen, 
            title: "Thursday Service", 
            desc: "gaafa guyyaa kamisaa sagantaan keenya akkummaa jirutti itti fufaa Thursday 11:00 AM", 
            color: "bg-secondary", 
            border: "border-secondary/20"
          },
          { 
            icon: MapPin, 
            title: "Our Sanctuary", 
            desc: "Muger Mokada, Ethiopia. Residential area fellowship.", 
            color: "bg-accent", 
            border: "border-accent/20" 
          }
        ].map((info, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={cn("border bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-all group relative overflow-hidden", info.border)}
          >
            <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:rotate-12 transition-transform shadow-lg", info.color)}>
              <info.icon className="text-white h-5 w-5 md:h-7 md:w-7" />
            </div>
            <h3 className="font-bitter font-light italic text-xl md:text-[24px] text-primary uppercase tracking-tighter mb-2">{info.title}</h3>
            <p className="text-muted-foreground text-xs md:sm leading-relaxed font-medium">{info.desc}</p>
          </motion.div>
        ))}
      </section>

      <section id="about" className="py-16 md:py-40 container px-4 mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative group">
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl z-10">
              {interiorImg && (
                <Image 
                  src={interiorImg.imageUrl} 
                  alt="Church Sanctuary" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              )}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ 
                  borderColor: ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.6)', 'rgba(59,130,246,0.2)'],
                  boxShadow: ['0 0 20px rgba(59,130,246,0.1)', '0 0 40px rgba(59,130,246,0.3)', '0 0 20px rgba(59,130,246,0.1)']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-6 right-6 md:left-10 md:right-10 -translate-y-1/2 z-20 border-2 border-blue-400/40 rounded-[2rem] md:rounded-[2.5rem] bg-blue-900/30 backdrop-blur-xl p-6 md:p-8 shadow-2xl ring-1 ring-white/10"
              >
                <p className="text-blue-400 font-robotoSlab font-bold text-sm md:text-[20px] leading-relaxed text-center drop-shadow-sm">
                  kiristos lubbuu isaa nuuf kennuu isaatiin jaalalli maal akka ta'e hubanneerraa,egaa nus immoo lubbuu keenya obbolootaaf kennuun nuuf ta'a.yohaniis3:16
                </p>
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] px-4 md:px-6 py-1.5 rounded-full">
              Foundations of Faith
            </Badge>
            <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-primary uppercase leading-[1.1] tracking-tighter">
              A Legacy of <br /> <span className="text-secondary">Spirit & Truth</span>
            </h2>
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-muted-foreground font-robotoSlab font-normal text-base md:text-[20px] leading-relaxed border-2 border-primary/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-primary/5 shadow-inner text-left"
              >
                Mugher Full Gospel Church is a community of believers dedicated to worship, discipleship, and service. Our mission is to share the Gospel and build a strong faith community in Mugher Mokada.
              </motion.div>
              
              <div className="space-y-4 text-left">
                <h4 className="font-playfair font-medium italic text-xl md:text-2xl text-primary">Seenaa Boonsaa fi Milkaa’ina Mana Amantaa Guutuu Wangellaa Mugher</h4>
                <div className="text-muted-foreground font-bitter font-light italic text-base md:text-[20px] leading-relaxed">
                  Mana Amantaa Guutuu Wangellaa Itoophiyaa (MAGWI) buufata Mugher, seenaa amantii cimaa, obsaa fi loltummaa hafuuraa waggoota dheeraa of keessaa qabdi. Manni amantaa kun naannoo sanaatti mul’ata wangeelaa jalqabaa qabattee kan kaate madda nagaa fi jireenya hafuuraa ta’uun tajaajilaa jirti.
                  
                  <AnimatePresence>
                    {showFullHistory && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden whitespace-pre-wrap mt-4"
                      >
1. Hundeeffama fi Jalqaba Mul’ataa
Manni amantaa kun yeroo naannoon Mugher qophaatti ijaaramaa turtetti, obboloota muraasa murtoo qabaniin manatti tajaajila jalqabde. Akkuma kolfi fageenyatti mul’atu, isheenis "Ishee Jalqabaa" (pioneer) ta’uun namoota naannoo sanaa wangeelaan qaqqabuuf dhagaa bu’uuraa keesse.
- Mul'ata Jalqabaa: Namoota muraasa kaayyoo tokkoof walitti dhufaniin, manaa manatti kadhannaa fi sagalee Waaqayyoo qoqqoodachuun jalqabame.
- Madda Jireenyaa: Mugher keessatti akka tajaajila hafuuraa qofaatti osoo hin taane, akka madda tasgabbii fi abdii ta’uun tajaajiluu jalqabde.

2. Qorumsa fi Rakkoo Dandamachuu
Manni amantaa kun jireenya har’a mul’atu bira gahuuf karaa dukkanaa fi dhiphuu baay’ee keessa dabarteetti. Seenaa ishee keessatti yeroo hedduu rakkoolee akkasii dandamattee jirti:
- Ari’atama Hafuuraa: Yeroo sanatti akka amantaa haaraatti ilaalamuu isheetiin, mormii fi ari’atama dhuunfaa fi hawaasummaa garaa garaa keessa dabarteetti.
- Bakka Tajaajilaa Dhabuu: Waggoota hedduuf bakka dhaabbataa itti waaqeffatan dhabuun, bakka tajaajilaa jijjiiruun (godaanuun) qorumsa guddaa ture.
- Cinqii Dinagdee: Miseensota muraasa qabaachuu isheetiin, ijaarsa fi tajaajila babal’isuuf rakkoon maallaqaa fi meeshaa ishee quunnamee ture.
Haa ta’u malee, akkuma Kitaabni Qulqulluun jedhu, "Manni dhagaa irratti ijaarame bubbee fi bishaan hin jignu," isheenis amanamummaa miseensota isheetiin jabaattee dhaabbatte.

3. Guddina fi Firii Har’aa
Har’a, Mana Amantaa Guutuu Wangellaa Mugher "tulluu guddachaa dhufe" ta’eetti. Rakkoon kaleessaa har’a gara seenaa fi galataatti jijjiirameera.
- Miseensota Kumaan Lakkaa’aman: Miseensota muraasa irraa kaatee, har’a kumaan kan lakkaa’aman (Dhaabbataa fi Miseensota tajaajilaa) horachuu dandeessetti.
- Tajaajila Babal'ate: Dubartoota, dargaggoota, fi ijoolleef tajaajila adda addaa diriirsuun jireenya hawaasichaa jijjiiraa jirti.
- Ijaarsa Mana Qulqullummaa: Bakka amantoonni itti walitti dhufanii Waaqayyoon galateeffatan, ijaarsa guddaa fi bareedaa qabaachuun ishee ragaa guddina isheeti.

4. Kaayyoo fi Mul’ata Gara Fuulduraa
Manni amantaa kun seenaa boonsaa kana qabattee gara fuulduraatti:
- Wangeela naannoo Mugher fi naannoo ishee jiranitti bal’inaan qaqqabsiisuu.
- Amantoota hafuuraan bilchaatan fi biyyaaf bu’aa buusan horachuu.
- Hawaasummaa keessatti gahee ishee bahuun hiyyeeyyii fi warra gargaarsa barbaadan gargaaruu irratti xiyyeeffatti.

Xumura irratti: Mana Amantaa Guutuu Wangellaa Mugher ragaa jiraataa "Obsi fi amanamummaan bu'aa qaba" jedhuuti. Kaleessa dhiphuu keessa turte, har’a garuu tajaajila bal’aa fi miseensota kumaan lakkaa’aman qabattee ifa ta’ee mul’achaa jirti.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-primary/5 text-left">
                <h4 className="font-playfair font-medium italic text-xl md:text-2xl text-primary">የሙገር ሙሉ ወንጌል አማኞች ቤተክርስቲያን ኩራትና የድል ታሪክ</h4>
                <div className="text-muted-foreground font-bitter font-light italic text-base md:text-[20px] leading-relaxed">
                  ቤተክርስቲያኗ በአካባቢው የወንጌል ብርሃን ቀዳሚ በመሆን፣ በብዙ ትግልና ጸሎት የተመሰረተች ሲሆን፤ ዛሬ ላይ የብዙ ሺህ አማኞች መገኛ ለመሆን በቅታለች።
                  
                  <AnimatePresence>
                    {showFullHistory && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden whitespace-pre-wrap mt-4"
                      >
1. መነሻና የቀዳሚነት ሚና
ቤተክርስቲያኗ በአካባቢው "የመጀመሪያዋ" (Pioneer) ተብላ የምትታወቅ ሲሆን፣ ጥቂት አማኞች በቤታቸው ጸሎትና አምልኮ በመጀመር የጣሉት የወንጌል ዘር ነው። ሙገር እንደ ኢንዱስትሪ መንደር መመስረት ሲጀምር፣ ይህች ቤተክርስቲያን ለመንፈሳዊ ዕረፍትና ለተስፋ ምንጭነት መሰረት ሆናለች።
- የመጀመሪያው ራዕይ: ጥቂት ወንድሞችና እህቶች ለወንጌል ባላቸው ፍቅር ተነሳስተው፣ በታማኝነትና በትጋት አገልግሎቱን ጀመሩ።
- ተደራሽነት: የወንጌል ብርሃን ባልደረሰባቸው ስፍራዎች ሁሉ መዳረሻ በመሆን ለብዙዎች ድነት ምክንያት ሆናለች።

2. ፈተናዎችን በጽናት ማለፍ
ቤተክርስቲያኗ ዛሬ ለደረሰችበት ክብር የበቃችው በቀላሉ አልነበረም። በሂደቱ ውስጥ እጅግ አስቸጋሪ የሆኑ መከራዎችን አልፋለች፦
- መንፈሳዊ ስደት: በወቅቱ የነበሩ የሃይማኖትና የማህበራዊ ተጽዕኖዎች አገልግሎቱን ለማደናቀፍ ሞክረው ነበር።
- የአምልኮ ስፍራ ማጣት: ለረጅም ዓመታት ቋሚ የሆነ የመሰብሰቢያ ቦታ ባለመኖሩ፣ ከአንድ ቦታ ወደ ሌላ ቦታ በመዘዋወር (በመሰደድ) ብዙ ዋጋ ተከፍሏል።
- የቁሳቁስና የገንዘብ እጥረት: የአባላቱ ቁጥር አነስተኛ በነበረበት ወቅት፣ ህንጻ ለመገንባትና አገልግሎቱን ለማስፋፋት ከፍተኛ የኢኮኖሚ ፈተናዎች ነበሩ።
ቢሆንም ግን፣ "በዓለት ላይ የተመሰረተች ቤት አትናወጥም" እንደሚለው ቃል፣ በምዕመናን ጽናትና በጌታ ጸጋ ቆማ ቀርታለች።

3. የአሁኑ ስኬትና እድገት
የሙገር ሙሉ ወንጌል አማኞች ቤተክርስቲያን ትናንት በለቅሶ የዘራችውን ዛሬ በደስታ እያጨደች ትገኛለች።
- በሺዎች የሚቆጠሩ አባላት: በጥቂት ሰዎች የተጀመረው አገልግሎት ዛሬ በሺዎች የሚቆጠሩ ምዕመናንን (ቋሚ አባላትና የተለያዩ የአገልግሎት ዘርፎችን) አፍርቷል።
- የተሟላ አገልግሎት: ለህጻናት፣ ለወጣቶችና ለሴቶች የሚሰጡ አገልግሎቶችን በማስፋፋት የማህበረሰቡን መንፈሳዊና ስነ-ልቦናዊ ፍላጎት እያሟላች ትገኛለች።
- ታላቅ የጸሎት ቤት: አማኞች በነጻነት የሚሰበሰቡበት፣ ዘመናዊና ሰፊ የሆነ የቤተክርስቲያን ህንጻ ባለቤት መሆን መቻሏ የእድገቷ ትልቅ ማሳያ ነው።

4. የወደፊት ራዕይና ተልዕኮ
ቤተክርስቲያኗ ካለፈችበት ታላቅ ታሪክ በመነሳት ወደፊት የሚከተሉትን ግቦች ሰንቃለች፦
- ወንጌልን በሙገርና በአካባቢው ባሉ ስፍራዎች ይበልጥ በስፋት ማዳረስ።
- በመንፈሳዊ ህይወታቸው የበሰሉና ለሀገር የሚጠቅሙ ዜጎችን ማፍራት።
- ማህበራዊ ኃላፊነትን በመወጣት ረገድ ችግረኞችንና ድጋፍ የሚሹ ወገኖችን መርዳት።

ለማጠቃለል፦ የሙገር ሙሉ ወንጌል አማኞች ቤተክርስቲያን "ጽናትና እምነት ፍሬ አለው" ለሚለው እውነት ህያው ምስክር ናት። ትናንት በፈተና ውስጥ የነበረችው ቤተክርስቲያን፣ ዛሬ በብዙ ሺህ አባላት ተከባ በክብር ትገኛለች።
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowFullHistory(!showFullHistory)}
              size="lg" 
              className="w-full sm:w-auto bg-primary text-white font-black h-14 md:h-16 px-10 md:px-12 rounded-full uppercase tracking-widest shadow-xl"
            >
              {showFullHistory ? 'Show Less' : 'Learn Our Story'}
            </Button>
          </div>
        </div>
      </section>

      {dailyQuote && (
        <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden">
          <div className="container px-4 mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-8 flex justify-center"
            >
              {dailyQuote.time === 'morning' ? <Sunrise className="h-12 w-12 md:h-16 md:w-16 text-secondary animate-pulse-slow" /> : <Sunset className="h-12 w-12 md:h-16 md:w-16 text-secondary animate-pulse-slow" />}
            </motion.div>
            <Badge variant="outline" className="mb-6 md:mb-8 border-white/30 text-white font-black tracking-[0.2em] md:tracking-[0.3em] uppercase px-6 md:px-8 py-2 text-[10px] md:text-xs">
              {dailyQuote.time === 'morning' ? 'Manna Ganamaa' : 'Nagaa Galgalaa'}
            </Badge>
            <blockquote className="max-w-4xl mx-auto px-2">
              <p className="font-bitter font-light italic text-lg md:text-[20px] mb-8 md:mb-10 leading-relaxed tracking-wide">
                "{dailyQuote.text}"
              </p>
              <cite className="text-secondary font-black uppercase tracking-[0.3em] md:tracking-[0.5em] not-italic text-xs md:text-base">
                — {dailyQuote.ref}
              </cite>
            </blockquote>
          </div>
        </section>
      )}

      <section id="ministries" className="py-16 md:py-40 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20 space-y-4">
            <Badge className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] px-6 py-1.5 rounded-full border border-primary/10">Specialized Fellowships</Badge>
            <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-primary uppercase tracking-tighter">Our Ministries</h2>
            <p className="text-muted-foreground font-medium text-base md:text-lg leading-relaxed px-4">Discover a place where you belong, grow, and serve with others.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Users, title: "Youth Ministry", desc: "Empowering young leaders to influence their generation for the Kingdom." },
              { icon: Heart, title: "Women Fellowship", desc: "A vibrant community of sisters building their homes on prayer and faith." },
              { icon: Sparkles, title: "Prayer Ministry", desc: "The strategic engine room where we stand in the gap for our church." },
              { icon: Megaphone, title: "Outreach", desc: "Taking God's love beyond the sanctuary walls into the community." }
            ].map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-lg flex flex-col items-center text-center transition-all"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-primary transition-all duration-500">
                  <m.icon className="text-primary h-8 w-8 md:h-10 md:w-10 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-headline font-bold text-xl md:text-2xl text-primary uppercase tracking-tighter mb-4">{m.title}</h4>
                <p className="text-muted-foreground text-xs md:sm leading-relaxed font-medium">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-16 md:py-40 bg-muted/20 border-y border-primary/5">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 mb-12 md:mb-20">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-secondary text-primary font-black uppercase tracking-widest text-[8px] md:text-[9px]">Church Calendar</Badge>
              <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-primary uppercase tracking-tighter leading-none">
                Upcoming <br /> <span className="text-secondary">Gatherings</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="w-full md:w-auto border-primary text-primary font-bold uppercase tracking-widest rounded-full px-10 h-12 md:h-14 border-2 hover:bg-primary/5">
              <Link href="#events">View All Events</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {eventsLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
              </div>
            ) : events && events.length > 0 ? (
              events.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 shadow-xl border border-primary/5 group hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <Badge className="bg-secondary/20 text-primary font-black uppercase tracking-widest text-[8px] md:text-[9px] px-4 py-1.5 rounded-full">{event.category || 'Worship'}</Badge>
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-black text-primary uppercase leading-tight mb-4 md:mb-6 group-hover:text-secondary transition-colors">{event.title}</h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-muted-foreground"><CalendarIcon className="h-4 w-4" /> {event.date}</div>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-muted-foreground"><Clock className="h-4 w-4" /> {event.time}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-muted-foreground font-medium italic text-base md:text-lg">Stay tuned for new gatherings!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="sermons" className="py-16 md:py-40 container px-4 mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-20">
          <Badge className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] px-6 py-1.5">Spiritual Nourishment</Badge>
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter">Sermon Gallery</h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-xl mx-auto font-bitter font-light italic text-base md:text-[20px] px-4"
          >
            Watch latest messages and deep teachings from our pulpit.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {dbSermons && dbSermons.length > 0 ? (
            dbSermons.map((s: any) => (
              <motion.div 
                key={s.id} 
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5"
              >
                <Link href={s.videoUrl} target="_blank">
                  <div className="relative aspect-video overflow-hidden">
                    {s.thumbnailUrl ? (
                      <Image 
                        src={s.thumbnailUrl} 
                        alt={s.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Video className="h-10 w-10 md:h-12 md:w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="text-white fill-white h-10 w-10 md:h-12 md:w-12" />
                    </div>
                  </div>
                </Link>
                <div className="p-6 md:p-10">
                  <h3 className="text-lg md:text-xl font-headline font-black text-primary uppercase tracking-tight mb-4 md:mb-6 group-hover:text-secondary transition-colors">{s.title}</h3>
                  <div className="flex items-center justify-between border-t border-primary/5 pt-4 md:pt-6 text-[8px] md:text-[10px] font-black uppercase text-muted-foreground">
                    <span className="truncate max-w-[120px]">{s.speaker}</span>
                    <span className="text-secondary whitespace-nowrap">{s.date}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-muted-foreground italic">
              New sermons coming soon!
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-40 bg-accent text-white relative overflow-hidden text-center">
        <div className="container px-4 mx-auto relative z-10 space-y-8 md:space-y-10">
          <Badge className="bg-secondary text-primary font-black uppercase tracking-[0.3em] md:tracking-[0.5em] px-6 md:px-10 py-2.5 rounded-full mb-2 md:mb-4 text-[9px] md:text-xs">Honoring God with Wealth</Badge>
          <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-white uppercase leading-tight max-w-5xl mx-auto">
            Your Support Fuels <br className="hidden md:block" /> <span className="text-secondary">Our Mission</span>
          </h2>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/80 max-w-3xl mx-auto font-bitter font-light italic text-base md:text-[20px] leading-relaxed px-4 space-y-4"
          >
            <p>Your giving helps us spread the Gospel and serve the community excellence. Join us in building God's Kingdom.</p>
            <p>Kennaan keessan Wangeela babal’isuu fi hawaasa keenyaf tajaajila qulqullina qabuun tajaajiluuf nu gargaara. Mootummaa Waaqayyoo ijaaruu irratti nuun waliin hiriiraa.</p>
            <p>የእርስዎ ስጦታ ወንጌልን ለማስፋፋት እና ማህበረሰቡን በላቀ ሁኔታ ለማገልገል ይረዳናል። የእግዚአብሔርን መንግሥት ለመገንባት ከእኛ ጋር ይተባበሩ</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-6 md:pt-10">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-white font-black uppercase tracking-widest px-10 h-16 md:h-20 rounded-full shadow-2xl hover:scale-105 transition-transform text-base md:text-lg">
              <Link href="/donate">Give Donation</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-black uppercase tracking-widest px-10 h-16 md:h-20 rounded-full backdrop-blur-sm text-base md:text-lg">
              <Link href="/donate">Upload Receipt</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="moments" className="py-16 md:py-40 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-12 md:mb-20">
             <Badge className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] px-6 py-1.5 rounded-full">Visual Testimony</Badge>
             <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-primary uppercase tracking-tighter">Sacred Moments</h2>
             <p className="text-muted-foreground font-medium text-base md:text-lg leading-relaxed px-4">Captured snapshots of God's presence in our congregation.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {dbMoments && dbMoments.length > 0 ? (
              dbMoments.map((moment: any, i: number) => (
                <motion.div 
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg group"
                >
                  <Image 
                    src={moment.imageUrl} 
                    alt={moment.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <span className="text-white font-headline font-bold uppercase tracking-widest text-xs">{moment.title}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground italic text-sm">
                No moments captured yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="testimonies" className="py-16 md:py-40 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-12 md:mb-24">
            <Badge className="bg-secondary/20 text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] px-6 py-1.5">Transformed Lives</Badge>
            <h2 className="font-playfair font-medium italic text-3xl md:text-[48px] text-primary uppercase tracking-tighter">Testimonies</h2>
            <p className="text-muted-foreground font-medium text-base md:text-lg mb-6 md:mb-8 px-4">Voices from our congregation sharing the goodness of God.</p>
            
            <Dialog open={isTestimonyOpen} onOpenChange={setIsTestimonyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-primary text-primary font-black uppercase tracking-widest rounded-full px-8 md:px-10 h-12 md:h-14 border-2 hover:bg-primary/5 transition-all text-xs">
                  <MessageSquare className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Share Your Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md rounded-[1.5rem] md:rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline font-black text-primary uppercase text-lg md:text-xl">Submit Your Testimony</DialogTitle>
                  <DialogDescription className="text-xs">Share your experience or ideas with the community.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTestimonySubmit} className="space-y-4 md:space-y-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Your Name</label>
                    <Input 
                      placeholder="Enter your name" 
                      className="h-10 md:h-12 rounded-xl text-sm"
                      value={testimonyName}
                      onChange={(e) => setTestimonyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Your Story or Idea</label>
                    <Textarea 
                      placeholder="What has God done in your life?..." 
                      className="min-h-[120px] md:min-h-[150px] rounded-[1rem] md:rounded-[1.5rem] text-sm"
                      value={testimonyContent}
                      onChange={(e) => setTestimonyContent(e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="w-full h-12 md:h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg text-xs"
                      disabled={isSubmittingTestimony}
                    >
                      {isSubmittingTestimony ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {isSubmittingTestimony ? "Submitting..." : "Send Testimony"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto">
            {dbTestimonies && dbTestimonies.length > 0 ? (
              dbTestimonies.map((t: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] relative shadow-lg group hover:shadow-2xl transition-all duration-500"
                >
                  <div className="space-y-6 md:space-y-8">
                    <p className="text-primary font-medium italic text-lg md:text-xl leading-relaxed">"{t.content}"</p>
                    <div className="flex items-center gap-3 md:gap-4 border-t border-primary/10 pt-6 md:pt-8">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-full flex items-center justify-center font-black uppercase text-sm">
                        {(t.name || 'C').charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-primary uppercase tracking-widest text-[10px] md:text-xs">{t.name}</span>
                        <span className="text-[8px] md:text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Member</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground italic text-sm">
                Our church family's stories are being reviewed.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-40 bg-white border-t border-primary/5 text-center">
        <div className="container px-4 mx-auto flex justify-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl group max-w-2xl"
          >
            {interiorImg && (
              <Image 
                src={interiorImg.imageUrl} 
                alt="Bible and Faith" 
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            )}
          </motion.div>
        </div>
      </section>

      <footer className="bg-white border-t border-primary/5 pt-16 md:pt-32 pb-12 md:pb-16">
        <div className="container px-4 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
          <div className="space-y-6 md:space-y-8 text-center sm:text-left flex flex-col items-center sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-primary/20 shadow-md bg-white">
                <Image 
                  src="https://i.ibb.co/vxZd8ZzQ/photo-2026-03-06-15-19-1222.jpg" 
                  alt="Mugher Full Gospel Logo" 
                  fill 
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="font-headline font-black text-lg md:text-2xl tracking-tighter uppercase text-primary">MUGHER <span className="text-secondary">FULL GOSPEL</span></span>
            </Link>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
              Muger Mokada, Ethiopia.<br />
              A sanctuary of faith dedicated to the restoration of hearts.
            </p>
            <div className="flex gap-3 md:gap-4">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 md:w-12 md:h-12 bg-primary/5 rounded-xl md:rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8 text-center sm:text-left">
            <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary">Service Schedule</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] md:text-[10px] font-black text-secondary uppercase tracking-widest">Sunday Worship</span>
                <p className="text-xs md:text-sm font-bold text-primary uppercase">Main Service • 9:00 AM</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] md:text-[10px] font-black text-secondary uppercase tracking-widest">Prayer Meeting</span>
                <p className="text-xs md:text-sm font-bold text-primary uppercase">Wednesday • 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8 text-center sm:text-left">
            <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary">Quick Links</h4>
            <nav className="flex flex-col gap-3 md:gap-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">{link.name}</Link>
              ))}
            </nav>
          </div>
          
          <div className="space-y-6 md:space-y-8 text-center sm:text-left">
            <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary">Ministry Location</h4>
            <div className="space-y-4 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-3 text-muted-foreground font-medium text-xs md:text-sm">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-secondary" /> Muger Mokada, Ethiopia
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-medium text-xs md:text-sm">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-secondary" /> Mon-Fri 9AM-5PM
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 mx-auto pt-8 md:pt-16 border-t border-primary/5 text-center">
          <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-primary opacity-80">© 2024 Mugher Full Gospel Church • SanctuaryLink System</p>
        </div>
      </footer>
    </div>
  );
}
