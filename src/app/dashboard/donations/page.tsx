
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
  Eraser,
  TrendingDown
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

  const handlePurgeImage = (id: string) => {
    if (!firestore) return;
    const donationRef = doc(firestore, 'donations', id);
    updateDoc(donationRef, { receiptData: null }).then(() => {
      toast({
        title: "Image Purged",
        description: "The receipt image has been removed to save storage.",
      });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: donationRef.path,
        operation: 'update',
        requestResourceData: { receiptData: null },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteDonation = (id: string) => {
    if (!firestore) return;
    if (!confirm('Are you sure you want to permanently delete this record?')) return;
    
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
    const res = {
      Tithe: 0,
      Offering: 0,
      GoFund: 0,
      'Building Purposes': 0,
      total: 0,
      pending: 0
    };
    if (!donations) return res;
    
    donations.forEach((curr) => {
      if (curr.status === 'approved') {
        res.total += curr.amount;
        if (curr.type === 'Tithe') res.Tithe += curr.amount;
        if (curr.type === 'Offering') res.Offering += curr.amount;
        if (curr.type === 'GoFund') res.GoFund += curr.amount;
        if (curr.type === 'Building Purposes') res['Building Purposes'] += curr.amount;
      } else if (curr.status === 'pending') {
        res.pending += 1;
      }
    });

    if (expenses) {
      const buildingExpenses = expenses
        .filter(e => e.category === 'Building Purposes')
        .reduce((sum, e) => sum + e.amount, 0);
      
      res['Building Purposes'] -= buildingExpenses;
      res.total -= buildingExpenses;
    }

    return res;
  }, [donations, expenses]);

  const filteredDonations = donations?.filter(d => {
    const donorName = d.donorName || '';
    const type = d.type || '';
    const ref = d.referenceNumber || '';
    
    const matchesSearch = donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const filteredTotal = React.useMemo(() => {
    return filteredDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  }, [filteredDonations]);

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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Income Control</h1>
          <p className="text-muted-foreground font-medium text-[10px] md:text-sm">MUGHER FULL GOSPEL CHURCH verified categorization.</p>
        </div>
        <div className="flex justify-center sm:justify-end gap-2">
          <Button variant="outline" className="gap-2 font-bold uppercase text-[9px] md:text-[10px] tracking-widest border-primary/20 h-9">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-none shadow-sm bg-primary text-white col-span-2 md:col-span-1">
          <CardHeader className="p-3 pb-1 md:p-4 md:pb-2">
            <CardTitle className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-80">Net Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">${stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        {['Tithe', 'Offering', 'GoFund', 'Building Purposes'].map((category) => (
          <Card key={category} className={`border-none shadow-sm ${category === 'Building Purposes' ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
            <CardHeader className="p-3 pb-1 md:p-4 md:pb-2">
              <CardTitle className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 md:gap-2">
                {category}
                {category === 'Building Purposes' && <TrendingDown className="h-3 w-3 text-rose-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
              <div className={`text-sm md:text-xl font-bold truncate ${category === 'Building Purposes' && stats['Building Purposes'] < 0 ? 'text-rose-600' : ''}`}>
                ${(stats as any)[category].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-none shadow-sm bg-amber-500/10">
          <CardHeader className="p-3 pb-1 md:p-4 md:pb-2">
            <CardTitle className="text-[8px] md:text-[9px] font-bold text-amber-700 uppercase tracking-widest">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-sm md:text-xl font-bold text-amber-700">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white/50 border-b p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor..." 
                className="pl-9 bg-white border-primary/10 h-10 text-[10px] md:text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white h-10 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Tithe">Tithe</SelectItem>
                  <SelectItem value="Offering">Offering</SelectItem>
                  <SelectItem value="GoFund">GoFund</SelectItem>
                  <SelectItem value="Building Purposes">Building Purposes</SelectItem>
                  <SelectItem value="Special Seed">Special Seed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Donor Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Ref #</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs italic">Loading contributions...</TableCell>
                </TableRow>
              ) : filteredDonations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs italic">No matching records found.</TableCell>
                </TableRow>
              ) : filteredDonations?.map((donation) => (
                <TableRow key={donation.id} className="hover:bg-muted/10 group transition-colors">
                  <TableCell className="text-[10px] font-medium whitespace-nowrap">
                    {donation.timestamp?.toDate ? format(donation.timestamp.toDate(), 'MMM d, yyyy') : 'Pending'}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-primary max-w-[150px] md:max-w-[200px] truncate">
                    {donation.donorName || 'Unidentified Donor'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                      {donation.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[9px] font-mono opacity-60 group-hover:opacity-100">{donation.referenceNumber}</TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] font-bold uppercase tracking-widest ${
                      donation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                      donation.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 tabular-nums text-xs">
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
                        <DialogContent className="max-w-[95vw] sm:max-w-md border-none shadow-2xl rounded-xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Verification Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto px-1">
                            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-lg border border-primary/5">
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Donor</p>
                                <p className="font-bold text-primary text-xs truncate">{donation.donorName || 'Unidentified'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Amount</p>
                                <p className="font-bold text-emerald-600 text-xs">${donation.amount.toLocaleString()}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                                <p className="font-bold text-xs">{donation.type}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Reference</p>
                                <p className="font-mono text-[10px] opacity-70 truncate">{donation.referenceNumber}</p>
                              </div>
                            </div>

                            {donation.isAiVerified && (
                              <Alert className="bg-emerald-50 border-emerald-200">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                <AlertTitle className="text-emerald-800 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">AI Verified Secure</AlertTitle>
                                <AlertDescription className="text-emerald-700 text-[9px] md:text-[10px] leading-relaxed">
                                  Verified for **MUGHER FULL GOSPEL CHURCH** (Ends in **5978**).
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-2">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Receipt Image</p>
                              <div className="border rounded-xl p-4 bg-muted/5 min-h-[150px] flex flex-col items-center justify-center text-center">
                                {donation.receiptData ? (
                                  <div className="space-y-4 w-full">
                                    <img 
                                      src={donation.receiptData} 
                                      alt="Receipt" 
                                      className="w-full h-auto rounded-lg border shadow-sm max-h-[300px] object-contain"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 text-[10px] font-bold uppercase"
                                      onClick={() => handlePurgeImage(donation.id)}
                                    >
                                      <Eraser className="h-4 w-4 mr-2" /> Purge Image
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-3 p-6">
                                    <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto">
                                      <ShieldCheck className="h-8 w-8 text-primary/40" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-bold text-muted-foreground">Image Not Available</p>
                                      <p className="text-[9px] text-muted-foreground italic">Discarded or Purged.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-2 pb-4">
                              {donation.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-[10px] h-11" 
                                    onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1 font-bold uppercase text-[10px] h-11"
                                    onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                  >
                                    <X className="h-4 w-4 mr-2" /> Reject
                                  </Button>
                                </div>
                              )}
                              <Button 
                                variant="outline" 
                                className="w-full font-bold uppercase text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 h-10"
                                onClick={() => handleDeleteDonation(donation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</DropdownMenuLabel>
                          {donation.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                className="text-xs font-bold text-emerald-600"
                                onClick={() => handleUpdateStatus(donation.id, 'approved')}
                              >
                                <Check className="h-4 w-4 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-xs font-bold text-rose-600"
                                onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {donation.receiptData && (
                            <DropdownMenuItem 
                              className="text-xs font-bold text-blue-600"
                              onClick={() => handlePurgeImage(donation.id)}
                            >
                              <Eraser className="h-4 w-4 mr-2" /> Purge Image
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-xs font-bold text-rose-700 focus:bg-rose-50"
                            onClick={() => handleDeleteDonation(donation.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {!donationsLoading && filteredDonations && filteredDonations.length > 0 && (
              <TableFooter className="bg-muted/50 border-t-2 border-primary/10">
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 tabular-nums text-xs">
                    ${filteredTotal.toLocaleString()}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
