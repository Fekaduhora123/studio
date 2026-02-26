import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Church, ShieldCheck, PieChart, Users, Heart } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-church');

  return (
    <div className="flex flex-col min-h-screen font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight">SanctuaryLink</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background overflow-hidden">
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
                    <Link href="/dashboard">Access Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 border-primary text-primary hover:bg-primary/10">
                    <Link href="#features">Learn More</Link>
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
              <Link href="/login">Join the SanctuaryLink Family</Link>
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