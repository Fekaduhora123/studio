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
  Plus, 
  Search, 
  Download,
  Calendar,
  Trash2,
  Loader2,
  Edit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const expenseSchema = z.object({
  description: z.string().min(2, "Description is required"),
  category: z.string().min(2, "Category is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Enter a valid amount"),
  status: z.enum(["Approved", "Pending", "Rejected"]).default("Pending"),
  approvedBy: z.string().optional().or(z.literal('')),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const expensesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'expenses'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: expenses, loading } = useCollection(expensesQuery);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      category: "",
      amount: "",
      status: "Pending",
      approvedBy: "",
    },
  });

  React.useEffect(() => {
    if (editingExpense) {
      form.reset({
        description: editingExpense.description,
        category: editingExpense.category,
        amount: editingExpense.amount.toString(),
        status: editingExpense.status || "Pending",
        approvedBy: editingExpense.approvedBy || "",
      });
    } else {
      form.reset({
        description: "",
        category: "",
        amount: "",
        status: "Pending",
        approvedBy: "",
      });
    }
  }, [editingExpense, form]);

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    if (!firestore) return;
    const expenseRef = doc(firestore, 'expenses', id);
    updateDoc(expenseRef, { status }).then(() => {
      toast({
        title: `Expense ${status}`,
        description: `The expenditure has been marked as ${status.toLowerCase()}.`,
      });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: expenseRef.path,
        operation: 'update',
        requestResourceData: { status },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!firestore) return;

    const expenseData = {
      ...values,
      amount: Number(values.amount),
      date: editingExpense ? editingExpense.date : serverTimestamp(),
    };

    if (editingExpense) {
      const expenseRef = doc(firestore, 'expenses', editingExpense.id);
      updateDoc(expenseRef, expenseData).then(() => {
        toast({ title: "Expense Updated", description: "The record has been successfully updated." });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: expenseRef.path,
          operation: 'update',
          requestResourceData: expenseData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      addDoc(collection(firestore, 'expenses'), expenseData).then(() => {
        toast({ title: "Expense Recorded", description: "The expenditure has been logged." });
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'expenses',
          operation: 'create',
          requestResourceData: expenseData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this expense record?')) return;
    const expenseRef = doc(firestore, 'expenses', id);
    deleteDoc(expenseRef).then(() => {
      toast({ title: "Expense Deleted", description: "The record was removed permanently." });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: expenseRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const filteredExpenses = expenses?.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = React.useMemo(() => {
    const initial = { total: 0, pending: 0, topCategory: 'None' };
    if (!expenses) return initial;

    const categories: Record<string, number> = {};
    
    const result = expenses.reduce((acc, curr) => {
      if (curr.status === 'Approved') acc.total += curr.amount;
      if (curr.status === 'Pending') acc.pending++;
      
      categories[curr.category] = (categories[curr.category] || 0) + curr.amount;
      return acc;
    }, initial);

    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    result.topCategory = sortedCategories[0]?.[0] || 'None';

    return result;
  }, [expenses]);

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
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Financial Outflow</h1>
          <p className="text-muted-foreground font-medium text-sm">MUGHER FULL GOSPEL CHURCH expenditure monitoring.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 font-bold uppercase text-[10px] tracking-widest border-primary/20">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingExpense(null);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest">
                <Plus className="h-4 w-4" /> Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">
                  {editingExpense ? 'Edit Expense Record' : 'Log New Expenditure'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Description</FormLabel>
                        <FormControl><Input placeholder="e.g. Electricity Bill - May" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Category</FormLabel>
                          <FormControl><Input placeholder="Utility, Salary, etc." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Amount (ETB)</FormLabel>
                          <FormControl><Input placeholder="0.00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="approvedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Approved By</FormLabel>
                          <FormControl><Input placeholder="e.g. Pastor James" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Current Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-primary font-bold uppercase text-[10px] tracking-widest">
                      {editingExpense ? 'Update Record' : 'Save Expenditure'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Approved (MTD)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">ETB {stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top Spending Category</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-primary">{stats.topCategory}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">Awaiting Approval</CardTitle>
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
                placeholder="Search description or category..." 
                className="pl-9 bg-white border-primary/10 h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 font-bold uppercase text-[10px] tracking-widest border-primary/20">
                <Filter className="h-4 w-4" /> Filter Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Audited By</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs italic">Loading ledger...</TableCell>
                </TableRow>
              ) : filteredExpenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs italic">No expenditures found.</TableCell>
                </TableRow>
              ) : filteredExpenses?.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/10 group transition-colors">
                  <TableCell className="text-[10px] font-medium whitespace-nowrap">
                    {expense.date?.toDate ? format(expense.date.toDate(), 'MMM d, yyyy') : 'Pending'}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-primary">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{expense.approvedBy || '---'}</TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] font-bold uppercase tracking-widest ${
                      expense.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                      expense.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-600 tabular-nums text-xs">
                    -ETB {expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Expense Action</DropdownMenuLabel>
                        {expense.status === 'Pending' && (
                          <>
                            <DropdownMenuItem 
                              className="text-xs font-bold text-emerald-600"
                              onClick={() => handleUpdateStatus(expense.id, 'Approved')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-xs font-bold text-rose-600"
                              onClick={() => handleUpdateStatus(expense.id, 'Rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-xs font-bold text-blue-600"
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-xs font-bold text-rose-700 focus:bg-rose-50" 
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Record
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
