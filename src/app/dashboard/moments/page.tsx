
"use client";

import * as React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Camera,
  Image as ImageIcon,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const momentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  imageUrl: z.string().min(1, "Image is required"),
  description: z.string().optional(),
});

type MomentFormValues = z.infer<typeof momentSchema>;

export default function SacredMomentsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const momentsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sacred_moments'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: moments, loading } = useCollection(momentsQuery);

  const form = useForm<MomentFormValues>({
    resolver: zodResolver(momentSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Basic compression via canvas if needed, but for MVP we use base64
      form.setValue('imageUrl', result, { shouldValidate: true });
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error processing image" });
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: MomentFormValues) => {
    if (!firestore) return;

    const data = {
      ...values,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'sacred_moments'), data).then(() => {
      toast({ title: "Moment added to gallery" });
      form.reset();
      setIsDialogOpen(false);
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: 'sacred_moments',
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('Permanently delete this photo?')) return;
    const momentRef = doc(firestore, 'sacred_moments', id);
    deleteDoc(momentRef).then(() => {
      toast({ title: "Photo removed from gallery" });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: momentRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const filteredMoments = moments?.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Sacred Moments Gallery</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage the visual history of our congregation.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg">
              <Plus className="h-4 w-4" /> Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Post Sacred Moment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Moment Title</FormLabel>
                      <FormControl><Input placeholder="Baptism Ceremony 2024" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Image File</label>
                  <div className="relative">
                    <div className={cn(
                      "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all",
                      form.getValues('imageUrl') ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-muted-foreground/20"
                    )}>
                      {isProcessingFile ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : form.getValues('imageUrl') ? (
                        <>
                          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          <p className="text-[10px] font-bold uppercase text-emerald-700">Image Selected</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[9px] uppercase font-bold"
                            onClick={() => form.setValue('imageUrl', '')}
                          >Change Image</Button>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Click to upload from computer</p>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileChange}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-primary font-bold uppercase text-xs h-12" disabled={isProcessingFile}>Post to Gallery</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Gallery Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{moments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-white/50 border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title..." 
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider py-4 pl-6">Preview</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Title</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 italic text-muted-foreground text-sm">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/20" />
                    Loading gallery...
                  </TableCell>
                </TableRow>
              ) : filteredMoments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic text-sm">
                    Gallery is empty.
                  </TableCell>
                </TableRow>
              ) : filteredMoments?.map((m) => (
                <TableRow key={m.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                  <TableCell className="pl-6 py-4">
                    <div className="relative h-12 w-20 bg-muted rounded overflow-hidden">
                      <Image src={m.imageUrl} alt={m.title} fill className="object-cover" sizes="80px" />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-sm text-primary">{m.title}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
