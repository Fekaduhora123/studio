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
  HandCoins, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockDonations = [
  { id: 1, donor: 'Sarah Wilson', type: 'Tithe', method: 'Mobile Money', amount: 250, date: '2024-05-18' },
  { id: 2, donor: 'Michael Chen', type: 'GoFund', method: 'Bank Transfer', amount: 1000, date: '2024-05-18' },
  { id: 3, donor: 'Emily Davis', type: 'Offering', method: 'Cash', amount: 45, date: '2024-05-17' },
  { id: 4, donor: 'Robert Johnson', type: 'Tithe', method: 'Bank Transfer', amount: 500, date: '2024-05-17' },
  { id: 5, donor: 'Grace Lee', type: 'Special Seed', method: 'Credit Card', amount: 150, date: '2024-05-16' },
  { id: 6, donor: 'John Miller', type: 'Offering', method: 'Cash', amount: 120, date: '2024-05-16' },
];

export default function DonationsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Income Control</h1>
          <p className="text-muted-foreground">Track Tithes, Offerings, and GoFund contributions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Reports
          </Button>
          <Button className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> New Donation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              +8.2% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GoFund Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,200</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-accent h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">45% of $40k goal</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tithe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,200</div>
            <p className="text-xs text-muted-foreground mt-1">65.8% of total income</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Offering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground mt-1">19.6% of total income</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor or type..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" /> Date Range
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Method
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
                <TableHead className="font-bold">Method</TableHead>
                <TableHead className="font-bold text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDonations.map((donation) => (
                <TableRow key={donation.id} className="hover:bg-muted/10">
                  <TableCell className="text-sm">{donation.date}</TableCell>
                  <TableCell className="font-medium">{donation.donor}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-primary/20 text-primary">
                      {donation.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {donation.method === 'Cash' && <Banknote className="h-3 w-3" />}
                      {donation.method === 'Bank Transfer' && <Smartphone className="h-3 w-3" />}
                      {donation.method === 'Mobile Money' && <Smartphone className="h-3 w-3" />}
                      {donation.method === 'Credit Card' && <CreditCard className="h-3 w-3" />}
                      {donation.method}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    ${donation.amount.toLocaleString()}
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