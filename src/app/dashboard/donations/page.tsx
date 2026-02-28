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
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Download,
  Calendar,
  Eye,
  Check,
  X,
  FileText,
  Filter,
  Loader2,
  Upload,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DonationsPage() {
  const firestore = useFirestore();
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

  const { data: donations, loading } = useCollection(donationsQuery);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const donationRef = doc(firestore, 'donations', id);
    updateDoc(donationRef, { status });
  };

  const stats = React.useMemo(() => {
    const initial = {
      Tithe: 0,
      Offering: 0,
      GoFund: 0,
      'Building Purposes': 0,
      total: 0,
      pending: 0
    };
    if (!donations) return initial;
    
    return donations.reduce((acc, curr) => {
      if (curr.status === 'approved') {
        acc.total += curr.amount;
        if (curr.type === 'Tithe') acc.Tithe += curr.amount;
        if (curr.type === 'Offering') acc.Offering += curr.amount;
        if (curr.type === 'GoFund') acc.GoFund += curr.amount;
        if (curr.type === 'Building Purposes') acc['Building Purposes'] += curr.amount;
      } else if (curr.status === 'pending') {
        acc.pending += 1;
      }
      return acc;
    }, initial);
  }, [donations]);

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

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Income Control</h1>
          <p className="text-muted-foreground font-medium">MUGHER FULL GOSPEL CHURCH verified categorization.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 font-bold uppercase text-xs">
            <Download className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Approved</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">${stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        {['Tithe', 'Offering', 'GoFund', 'Building Purposes'].map((category) => (
          <Card key={category} className="border-none shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold">${(stats as any)[category].toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-none shadow-sm bg-accent/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">Pending Review</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-accent-foreground">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor or reference..." 
                className="pl-9 bg-white border-primary/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-white text-xs font-bold uppercase tracking-wider">
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
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Donor Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Ref #</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Verify</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading contributions...</TableCell>
                </TableRow>
              ) : filteredDonations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">No matching records found.</TableCell>
                </TableRow>
              ) : filteredDonations?.map((donation) => (
                <TableRow key={donation.id} className="hover:bg-muted/10 group transition-colors">
                  <TableCell className="text-xs font-medium">
                    {donation.timestamp?.toDate ? format(donation.timestamp.toDate(), 'MMM d, yyyy') : 'Pending'}
                  </TableCell>
                  <TableCell className="font-bold text-primary">{donation.donorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                      {donation.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono opacity-60 group-hover:opacity-100">{donation.referenceNumber}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] font-bold uppercase tracking-widest ${
                      donation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                      donation.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 tabular-nums">
                    ${donation.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md border-none shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Contribution Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border border-primary/5">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Donor</p>
                              <p className="font-bold text-primary">{donation.donorName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount</p>
                              <p className="font-bold text-emerald-600">${donation.amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                              <p className="font-bold">{donation.type}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reference</p>
                              <p className="font-mono text-xs opacity-70">{donation.referenceNumber}</p>
                            </div>
                          </div>

                          {donation.isAiVerified && (
                            <Alert className="bg-emerald-50 border-emerald-200">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              <AlertTitle className="text-emerald-800 text-xs font-bold uppercase tracking-widest">AI Verified Secure</AlertTitle>
                              <AlertDescription className="text-emerald-700 text-[10px] leading-relaxed">
                                AI successfully verified this deposit was made to **MUGHER FULL GOSPEL CHURCH** (Account ends in **5978**).
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification Asset</p>
                            <div className="border rounded-xl p-4 bg-muted/5 min-h-[200px] flex flex-col items-center justify-center text-center">
                              {donation.receiptData ? (
                                donation.receiptData.startsWith('data:application/pdf') ? (
                                  <div className="space-y-2">
                                     <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                                     <span className="text-xs font-bold text-muted-foreground">PDF Document</span>
                                  </div>
                                ) : (
                                  <img 
                                    src={donation.receiptData} 
                                    alt="Receipt" 
                                    className="w-full h-auto rounded-lg border shadow-sm"
                                  />
                                )
                              ) : donation.isAiVerified ? (
                                <div className="space-y-3 p-6">
                                  <div className="bg-emerald-100 p-4 rounded-full w-fit mx-auto">
                                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-emerald-700">Image Purged for Privacy</p>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">Verification was successful. Raw receipt data was deleted to optimize system storage as per the current privacy policy.</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3 p-12">
                                  <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                                  <p className="text-sm text-muted-foreground font-medium italic">No receipt asset provided</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {donation.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-xs" 
                                onClick={() => handleUpdateStatus(donation.id, 'approved')}
                              >
                                <Check className="h-4 w-4 mr-2" /> Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="flex-1 font-bold uppercase text-xs"
                                onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-2" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
