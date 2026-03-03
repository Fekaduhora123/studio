"use client";

import * as React from 'react';
import { useUser, useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UserCircle, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [photoURL, setPhotoURL] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL,
      });
      toast({
        title: "Profile Updated",
        description: "Your administrator details have been successfully changed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || userLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground font-medium text-sm">Update your public identity within SanctuaryLink.</p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-headline font-bold text-primary">
                {displayName || 'Administrator'}
              </CardTitle>
              <CardDescription className="font-medium">
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
              <Input 
                id="displayName"
                placeholder="e.g. Pastor James"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 bg-white border-primary/10 focus:border-primary/30"
              />
              <p className="text-[10px] text-muted-foreground">This name will be visible on announcements and reports.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoURL" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile Photo URL</Label>
              <Input 
                id="photoURL"
                placeholder="https://example.com/photo.jpg"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="h-12 bg-white border-primary/10 focus:border-primary/30"
              />
              <p className="text-[10px] text-muted-foreground">Enter a direct link to a hosted image file.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary h-12 font-bold uppercase tracking-widest text-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isSubmitting ? "Saving Changes..." : "Update Administrator Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-muted/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Account Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            To change your email address or password, please contact the system owner or visit the security portal.
          </p>
          <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest h-9" disabled>
            Request Security Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}