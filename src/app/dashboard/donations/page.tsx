"use client";

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { 
  Search, 
  Download,
  Eye,
  Check,
  X,
  Filter,
  Loader2,
  ShieldCheck,
  Trash2,
  MoreVertical,
  TrendingDown,
  QrCode
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export default function DonationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const donationsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const expensesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'expenses'), where('status', '==', 'Approved'));
  }, [firestore]);

  const { data: donations, loading: donationsLoading } = useCollection(donationsQuery);
  const { data: expenses } = useCollection(expensesQuery);

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const donationRef = doc(firestore, 'donations', id);
    updateDoc(donationRef, { status }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: donationRef.path,
        operation: 'update',
        requestResourceData: { status },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteDonation = (id: string) => {
    if (!firestore) return;
    if (!confirm('Permanently delete this record?')) return;
    const donationRef = doc(firestore, 'donations', id);
    deleteDoc(donationRef).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: donationRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const stats = React.useMemo(() => {
    const res = { total: 0, pending: 0, categories: {} as Record<string, number> };
    if (!donations) return res;
    donations.forEach((curr) => {
      if (curr.status === 'approved') {
        res.total += curr.amount;
        res.categories[curr.type] = (res.categories[curr.type] || 0) + curr.amount;
      } else if (curr.status === 'pending') res.pending += 1;
    });
    return res;
  }, [donations]);

  const filteredDonations = donations?.filter(d => {
    const matchesSearch = d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) || d.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Donation Audit</h1>
          <p className="text-muted-foreground font-medium text-[10px] md:text-sm">Verified Transaction Control.</p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 font-bold uppercase text-[10px] border-primary/20 h-9">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary text-white col-span-2 sm:col-span-1">
          <CardHeader className="p-3 pb-1 md:p-4 md:pb-2">
            <CardTitle className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Total Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">${stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-500/10 col-span-1">
          <CardHeader className="p-3 pb-1 md:p-4 md:pb-2">
            <CardTitle className="text-[8px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg font-bold text-amber-700">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white/50 border-b p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-white text-[10px] md:text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-[10px] font-bold uppercase tracking-wider">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Tithe">Tithe</SelectItem>
                <SelectItem value="Offering">Offering</SelectItem>
                <SelectItem value="GoFund">GoFund</SelectItem>
                <SelectItem value="Building Purposes">Building</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px] lg:min-w-full">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase py-4 pl-6">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Donor</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Type</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-xs italic">Loading contribution ledger...</TableCell>
                  </TableRow>
                ) : filteredDonations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-xs italic">No matching records found.</TableCell>
                  </TableRow>
                ) : filteredDonations?.map((donation) => (
                  <TableRow key={donation.id} className="hover:bg-muted/10 group">
                    <TableCell className="text-[10px] font-medium pl-6">
                      {donation.timestamp?.toDate ? format(donation.timestamp.toDate(), 'MMM d, yyyy') : 'Recently'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary truncate max-w-[150px]">
                      {donation.donorName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold">{donation.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 text-xs">
                      ${donation.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[98vw] w-full sm:max-w-[600px] rounded-2xl overflow-y-auto max-h-[98vh]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-headline font-bold text-primary uppercase">Audit Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                              <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-lg">
                                <div><p className="font-bold opacity-60">Donor</p><p className="font-bold">{donation.donorName}</p></div>
                                <div><p className="font-bold opacity-60">Amount</p><p className="font-bold text-emerald-600">${donation.amount.toLocaleString()}</p></div>
                                <div><p className="font-bold opacity-60">QR/Ref</p><p className="font-mono">{donation.referenceNumber}</p></div>
                                <div><p className="font-bold opacity-60">Status</p><p className="font-bold uppercase text-primary">{donation.status}</p></div>
                              </div>
                              {donation.isAiVerified && (
                                <Alert className="bg-emerald-50 border-emerald-200">
                                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                  <AlertTitle className="text-[10px] font-bold text-emerald-800 uppercase">AI Verified Match</AlertTitle>
                                </Alert>
                              )}
                              <div className="flex flex-col gap-2">
                                {donation.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button className="flex-1 bg-emerald-600 font-bold uppercase text-[10px]" onClick={() => handleUpdateStatus(donation.id, 'approved')}>Approve</Button>
                                    <Button variant="destructive" className="flex-1 font-bold uppercase text-[10px]" onClick={() => handleUpdateStatus(donation.id, 'rejected')}>Reject</Button>
                                  </div>
                                )}
                                <Button variant="outline" className="text-rose-600 font-bold uppercase text-[10px]" onClick={() => handleDeleteDonation(donation.id)}>Delete Record</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, 'approved')}>Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, 'rejected')} className="text-rose-600">Reject</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteDonation(donation.id)} className="text-rose-700">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
