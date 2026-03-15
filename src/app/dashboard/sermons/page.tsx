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
  Plus, 
  Search, 
  MoreVertical, 
  Loader2, 
  Trash2, 
  Edit,
  Video,
  Play,
  Calendar,
  Upload,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sermonSchema = z.object({
  title: z.string().min(2, "Title is required"),
  speaker: z.string().min(2, "Speaker name is required"),
  date: z.string().min(1, "Date is required"),
  videoUrl: z.string().url("Invalid video URL"),
  thumbnailUrl: z.string().min(1, "Thumbnail is required"),
});

type SermonFormValues = z.infer<typeof sermonSchema>;

export default function SermonsManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSermon, setEditingSermon] = React.useState<any>(null);
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const [uploadMethod, setUploadMethod] = React.useState<'file' | 'link'>('file');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sermonsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sermons'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: sermons, loading } = useCollection(sermonsQuery);

  const form = useForm<SermonFormValues>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      title: "",
      speaker: "",
      date: "",
      videoUrl: "",
      thumbnailUrl: "",
    },
  });

  const thumbnailUrl = form.watch('thumbnailUrl');

  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const match = url.match(/src="([^"]+)"/);
    return match ? match[1] : url;
  };

  React.useEffect(() => {
    if (editingSermon) {
      form.reset({
        title: editingSermon.title,
        speaker: editingSermon.speaker,
        date: editingSermon.date,
        videoUrl: editingSermon.videoUrl,
        thumbnailUrl: editingSermon.thumbnailUrl || "",
      });
      setUploadMethod(editingSermon.thumbnailUrl?.startsWith('data:') ? 'file' : 'link');
    } else {
      form.reset({
        title: "",
        speaker: "",
        date: "",
        videoUrl: "",
        thumbnailUrl: "",
      });
      setUploadMethod('file');
    }
  }, [editingSermon, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      form.setValue('thumbnailUrl', result, { shouldValidate: true });
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error processing image" });
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: SermonFormValues) => {
    if (!firestore) return;

    const data = {
      ...values,
      thumbnailUrl: sanitizeUrl(values.thumbnailUrl),
      createdAt: editingSermon ? editingSermon.createdAt : serverTimestamp(),
    };

    if (editingSermon) {
      const sermonRef = doc(firestore, 'sermons', editingSermon.id);
      updateDoc(sermonRef, data).then(() => {
        toast({ title: "Sermon updated successfully" });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: sermonRef.path,
          operation: 'update',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      addDoc(collection(firestore, 'sermons'), data).then(() => {
        toast({ title: "Sermon posted successfully" });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'sermons',
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    setIsDialogOpen(false);
    setEditingSermon(null);
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('Permanently delete this sermon? This cannot be undone.')) return;
    const sermonRef = doc(firestore, 'sermons', id);
    deleteDoc(sermonRef).then(() => {
      toast({ title: "Sermon deleted permanently" });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: sermonRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const filteredSermons = sermons?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Sermon Gallery</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage the church pulpit media library.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSermon(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg">
              <Plus className="h-4 w-4" /> Post Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">
                {editingSermon ? 'Edit Sermon Details' : 'Post New Sermon'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Sermon Title</FormLabel>
                      <FormControl><Input placeholder="The Power of Faith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="speaker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Speaker</FormLabel>
                        <FormControl><Input placeholder="Pastor James M." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Sermon Date</FormLabel>
                        <FormControl><Input placeholder="May 21, 2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Video URL (YouTube/Vimeo)</FormLabel>
                      <FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Thumbnail Source</label>
                  <Tabs value={uploadMethod} onValueChange={(v) => {
                    setUploadMethod(v as 'file' | 'link');
                    form.setValue('thumbnailUrl', '');
                  }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="text-[10px] font-bold uppercase"><Upload className="h-3 w-3 mr-2" /> Computer</TabsTrigger>
                      <TabsTrigger value="link" className="text-[10px] font-bold uppercase"><LinkIcon className="h-3 w-3 mr-2" /> Link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="file" className="pt-2">
                      <div className="relative">
                        <div className={cn(
                          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all",
                          uploadMethod === 'file' && thumbnailUrl ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-muted-foreground/20"
                        )}>
                          {isProcessingFile ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          ) : uploadMethod === 'file' && thumbnailUrl ? (
                            <>
                              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                              <p className="text-[10px] font-bold uppercase text-emerald-700">Thumbnail Ready</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[9px] uppercase font-bold"
                                type="button"
                                onClick={() => form.setValue('thumbnailUrl', '')}
                              >Change Image</Button>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground/40" />
                              <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Click to upload thumbnail from computer</p>
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
                    </TabsContent>
                    <TabsContent value="link" className="pt-2">
                      <FormField
                        control={form.control}
                        name="thumbnailUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="https://example.com/thumb.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  {form.formState.errors.thumbnailUrl && <p className="text-xs text-destructive">{form.formState.errors.thumbnailUrl.message}</p>}
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-primary font-bold uppercase text-xs h-12" disabled={isProcessingFile || !thumbnailUrl}>
                    {editingSermon ? 'Update Sermon' : 'Post to Gallery'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Total Sermons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sermons?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-white/50 border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or speaker..." 
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
                <TableHead className="text-[10px] font-bold uppercase tracking-wider py-4 pl-6">Sermon</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Speaker</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Media</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground text-sm">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/20" />
                    Loading gallery...
                  </TableCell>
                </TableRow>
              ) : filteredSermons?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-sm">
                    No sermons found.
                  </TableCell>
                </TableRow>
              ) : filteredSermons?.map((s) => {
                const displayUrl = sanitizeUrl(s.thumbnailUrl);
                return (
                  <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-20 bg-muted rounded overflow-hidden flex items-center justify-center">
                          {displayUrl ? (
                            <Image 
                              src={displayUrl} 
                              alt={s.title} 
                              fill 
                              className="object-cover" 
                              sizes="80px" 
                              unoptimized={displayUrl.startsWith('data:')} 
                            />
                          ) : (
                            <Video className="h-6 w-6 text-muted-foreground/30" />
                          )}
                          <Play className="absolute h-4 w-4 text-white fill-white opacity-50" />
                        </div>
                        <span className="font-bold text-sm text-primary">{s.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-700">{s.speaker}</TableCell>
                    <TableCell className="text-[11px] font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {s.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-primary/20">
                        Link Available
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
                          <DropdownMenuItem onClick={() => {
                            setEditingSermon(s);
                            setIsDialogOpen(true);
                          }} className="text-xs font-bold text-blue-600">
                            <Edit className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-xs font-bold text-rose-700">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
