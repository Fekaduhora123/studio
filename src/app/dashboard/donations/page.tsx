
"use client";

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
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
  Filter, 
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Check,
  X,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function DonationsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const donationsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: donations, loading } = useCollection(donationsQuery);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const donationRef = doc(firestore, 'donations', id);
    await updateDoc(donationRef, { status });
  };

  const filteredDonations = donations?.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThisMonth = donations?.reduce((acc, curr) => {
    if (curr.status === 'approved') return acc + curr.amount;
    return acc;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Income Control</h1>
          <p className="text-muted-foreground">Verify and track Tithes, Offerings, and GoFund contributions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Approved (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalThisMonth.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              Active contributions
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {donations?.filter(d => d.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires admin review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor, type or ref..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" /> Filter Date
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
                            <DialogTitle>Verification Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <span className="text-muted-foreground">Donor:</span>
                              <span className="font-bold">{donation.donorName}</span>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-bold">${donation.amount}</span>
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
