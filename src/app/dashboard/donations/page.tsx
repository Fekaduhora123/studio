
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
  Loader2
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
    const matchesSearch = d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <h1 className="text-3xl font-headline font-bold text-primary">Income Control</h1>
          <p className="text-muted-foreground">Verify and track categorized church contributions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">Total Approved</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">${stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tithes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">${stats.Tithe.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offerings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">${stats.Offering.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GoFund</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">${stats.GoFund.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Building</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">${stats['Building Purposes'].toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold text-accent-foreground uppercase tracking-wider">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{stats.pending}</div>
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
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
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
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" /> Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Donor Name</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Ref #</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Amount</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading donations...</TableCell>
                </TableRow>
              ) : filteredDonations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No donations found.</TableCell>
                </TableRow>
              ) : filteredDonations?.map((donation) => (
                <TableRow key={donation.id} className="hover:bg-muted/10">
                  <TableCell className="text-sm">
                    {donation.timestamp?.toDate ? format(donation.timestamp.toDate(), 'MMM d, yyyy') : 'Pending'}
                  </TableCell>
                  <TableCell className="font-medium">{donation.donorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-primary/20 text-primary">
                      {donation.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{donation.referenceNumber}</TableCell>
                  <TableCell>
                    <Badge className={
                      donation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 
                      donation.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' : 
                      'bg-amber-500/10 text-amber-600'
                    }>
                      {donation.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    ${donation.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <CardTitle>Verification Details</CardTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <span className="text-muted-foreground">Donor:</span>
                              <span className="font-bold">{donation.donorName}</span>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-bold">${donation.amount}</span>
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-bold text-primary">{donation.type}</span>
                              <span className="text-muted-foreground">Reference:</span>
                              <span className="font-mono">{donation.referenceNumber}</span>
                            </div>
                            <div className="border rounded-lg p-2 bg-muted/20">
                              <p className="text-xs font-bold mb-2 uppercase tracking-widest text-muted-foreground">Uploaded Receipt</p>
                              {donation.receiptData?.startsWith('data:application/pdf') ? (
                                <div className="flex items-center justify-center p-8 bg-white rounded border">
                                   <FileText className="h-12 w-12 text-muted-foreground" />
                                   <span className="ml-2 text-sm">PDF Document</span>
                                </div>
                              ) : (
                                <img 
                                  src={donation.receiptData} 
                                  alt="Receipt" 
                                  className="w-full h-auto rounded border shadow-sm"
                                />
                              )}
                            </div>
                            {donation.status === 'pending' && (
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                                  onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                >
                                  <Check className="h-4 w-4 mr-2" /> Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  className="flex-1"
                                  onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                >
                                  <X className="h-4 w-4 mr-2" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
