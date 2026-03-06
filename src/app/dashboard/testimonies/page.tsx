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
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function TestimoniesManagementPage() {
  const firestore = useFirestore();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const testimoniesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonies'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: testimonies, loading } = useCollection(testimoniesQuery);

  const handleUpdateStatus = (id: string, status: 'approved' | 'pending') => {
    if (!firestore) return;
    const testimonyRef = doc(firestore, 'testimonies', id);
    updateDoc(testimonyRef, { status }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: testimonyRef.path,
        operation: 'update',
        requestResourceData: { status },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('Permanently delete this story? This cannot be undone.')) return;
    const testimonyRef = doc(firestore, 'testimonies', id);
    deleteDoc(testimonyRef).catch(async (err) => {
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
          <p className="text-muted-foreground text-sm">Review and manage stories shared by the congregation.</p>
        </div>
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
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground text-sm">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/20" />
                    Loading submissions...
                  </TableCell>
                </TableRow>
              ) : filteredTestimonies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-sm">
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
                  <TableCell className="max-w-md">
                    <p className="text-xs leading-relaxed line-clamp-2 text-slate-700 italic">"{t.content}"</p>
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
