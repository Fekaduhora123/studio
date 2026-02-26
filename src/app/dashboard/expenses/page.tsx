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
  ReceiptText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Eye,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockExpenses = [
  { id: 1, category: 'Utility', description: 'Electric Bill - May', amount: 450, date: '2024-05-15', approvedBy: 'Pastor James', status: 'Approved' },
  { id: 2, category: 'Rent', description: 'Building Lease', amount: 2500, date: '2024-05-01', approvedBy: 'Finance Board', status: 'Approved' },
  { id: 3, category: 'Charity', description: 'Community Food Bank', amount: 1200, date: '2024-05-12', approvedBy: 'Pastor James', status: 'Approved' },
  { id: 4, category: 'Salary', description: 'Staff Payroll - May', amount: 4500, date: '2024-05-15', approvedBy: 'Finance Board', status: 'Approved' },
  { id: 5, category: 'Construction', description: 'Roof Repair Materials', amount: 850, date: '2024-05-18', approvedBy: 'Maintenance Head', status: 'Pending' },
];

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Expense Management</h1>
          <p className="text-muted-foreground">Track and categorize all church expenditures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> Record Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9,500</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently within budget limits
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Salary</div>
            <p className="text-xs text-muted-foreground mt-1">
              $4,500 total this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              Needs board review
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search description or category..." 
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
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Approved By</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Amount</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/10">
                  <TableCell className="text-sm">{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal bg-muted text-foreground">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{expense.approvedBy}</TableCell>
                  <TableCell>
                    <Badge className={expense.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-600">
                    -${expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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