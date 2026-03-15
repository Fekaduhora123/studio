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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Loader2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  Clock,
  Plus,
  Edit,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const testimonySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  content: z.string().min(10, "Story content is too short"),
  imageUrl: z.string().optional().or(z.literal('')),
  status: z.enum(["approved", "pending"]).default("pending"),
});

type TestimonyFormValues = z.infer<typeof testimonySchema>;

export default function TestimoniesManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTestimony, setEditingTestimony] = React.useState<any>(null);
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const [uploadMethod, setUploadMethod] = React.useState<'file' | 'link'>('file');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const testimoniesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonies'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: testimonies, loading } = useCollection(testimoniesQuery);

  const form = useForm<TestimonyFormValues>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
      imageUrl: "",
      status: "pending",
    },
  });

  const imageUrl = form.watch('imageUrl');

  React.useEffect(() => {
    if (editingTestimony) {
      form.reset({
        name: editingTestimony.name,
        email: editingTestimony.email || "",
        content: editingTestimony.content,
        imageUrl: editingTestimony.imageUrl || "",
        status: editingTestimony.status || "pending",
      });
      setUploadMethod(editingTestimony.imageUrl?.startsWith('data:') ? 'file' : 'link');
    } else {
      form.reset({
        name: "",
        email: "",
        content: "",
        imageUrl: "",
        status: "pending",
      });
      setUploadMethod('file');
    }
  }, [editingTestimony, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      form.setValue('imageUrl', result, { shouldValidate: true });
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error processing image" });
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'pending') => {
    if (!firestore) return;
    const testimonyRef = doc(firestore, 'testimonies', id);
    updateDoc(testimonyRef, { status }).then(() => {
      toast({ title: `Status updated to ${status}` });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: testimonyRef.path,
        operation: 'update',
        requestResourceData: { status },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const onSubmit = async (values: TestimonyFormValues) => {
    if (!firestore) return;

    const data = {
      ...values,
      timestamp: editingTestimony ? editingTestimony.timestamp : serverTimestamp(),
    };

    if (editingTestimony) {
      const testimonyRef = doc(firestore, 'testimonies', editingTestimony.id);
      updateDoc(testimonyRef, data).then(() => {
        toast({ title: "Story updated successfully" });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: testimonyRef.path,
          operation: 'update',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      addDoc(collection(firestore, 'testimonies'), data).then(() => {
        toast({ title: "Story registered successfully" });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'testimonies',
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    setIsDialogOpen(false);
    setEditingTestimony(null);
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('Permanently delete this story? This cannot be undone.')) return;
    const testimonyRef = doc(firestore, 'testimonies', id);
    deleteDoc(testimonyRef).then(() => {
      toast({ title: "Story deleted permanently" });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: testimonyRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const filteredTestimonies = testimonies?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Testimonies & Ideas</h1>
          <p className="text-muted-foreground text-sm font-medium">Full administrative control over community submissions.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTestimony(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg">
              <Plus className="h-4 w-4" /> Register Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">
                {editingTestimony ? 'Edit Testimony Content' : 'Manual Entry: Testimony'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Member Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Email (Optional)</FormLabel>
                      <FormControl><Input placeholder="email@address.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">The Story / Idea</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="Type the story here..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Testimony Image (Optional)</label>
                  <Tabs value={uploadMethod} onValueChange={(v) => {
                    setUploadMethod(v as 'file' | 'link');
                    form.setValue('imageUrl', '');
                  }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="text-[10px] font-bold uppercase"><Upload className="h-3 w-3 mr-2" /> Computer</TabsTrigger>
                      <TabsTrigger value="link" className="text-[10px] font-bold uppercase"><LinkIcon className="h-3 w-3 mr-2" /> Link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="file" className="pt-2">
                      <div className="relative">
                        <div className={cn(
                          "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all",
                          uploadMethod === 'file' && imageUrl ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-muted-foreground/20"
                        )}>
                          {isProcessingFile ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : uploadMethod === 'file' && imageUrl ? (
                            <>
                              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                              <p className="text-[10px] font-bold uppercase text-emerald-700">Image Attached</p>
                              <Button variant="ghost" size="sm" className="text-[9px] uppercase font-bold h-7" type="button" onClick={() => form.setValue('imageUrl', '')}>Change</Button>
                            </>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground/40" />
                              <p className="text-[9px] font-bold uppercase text-muted-foreground text-center">Upload from computer</p>
                              <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            </>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="link" className="pt-2">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="https://example.com/photo.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-primary font-bold uppercase text-xs h-12" disabled={isProcessingFile}>
                    {editingTestimony ? 'Update Entry' : 'Post to Database'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{testimonies?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-500/10 text-emerald-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Live Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{testimonies?.filter(t => t.status === 'approved').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-500/10 text-amber-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{testimonies?.filter(t => t.status === 'pending').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-white/50 border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or content..." 
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
                <TableHead className="text-[10px] font-bold uppercase tracking-wider py-4 pl-6">Member</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Story / Idea</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Image</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 italic text-muted-foreground text-sm">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/20" />
                    Loading submissions...
                  </TableCell>
                </TableRow>
              ) : filteredTestimonies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic text-sm">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : filteredTestimonies?.map((t) => (
                <TableRow key={t.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-primary">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.email || 'No email'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs md:max-w-md">
                    <p className="text-xs leading-relaxed line-clamp-2 text-slate-700 italic">"{t.content}"</p>
                  </TableCell>
                  <TableCell>
                    {t.imageUrl ? (
                      <div className="relative h-8 w-12 rounded bg-muted overflow-hidden">
                        <Image src={t.imageUrl} alt={t.name} fill className="object-cover" sizes="48px" unoptimized={t.imageUrl.startsWith('data:')} />
                      </div>
                    ) : (
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">No Image</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.timestamp?.toDate ? format(t.timestamp.toDate(), 'MMM d, yyyy') : 'Recently'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] font-bold uppercase tracking-widest ${
                      t.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest">Management</DropdownMenuLabel>
                        {t.status === 'pending' ? (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(t.id, 'approved')} className="text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Story
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(t.id, 'pending')} className="text-xs font-bold text-amber-600">
                            <XCircle className="h-4 w-4 mr-2" /> Move to Pending
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                          setEditingTestimony(t);
                          setIsDialogOpen(true);
                        }} className="text-xs font-bold text-blue-600">
                          <Edit className="h-4 w-4 mr-2" /> Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-xs font-bold text-rose-700">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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