import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Church } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-2">
        <Church className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-primary">SanctuaryLink</h1>
      </div>
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold font-headline">Welcome back</CardTitle>
          <CardDescription>Enter your email and password to access the church management system</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@church.org" />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full bg-primary" asChild>
            <Link href="/dashboard">Login</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="#" className="text-primary font-medium hover:underline">
              Contact Admin
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}