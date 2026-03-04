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
import { Input } from '@/components/ui/input';
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
  Filter, 
  MoreVertical, 
  Download,
  Loader2,
  Trash2,
  Edit,
  Users,
  User,
  Heart,
  Activity,
  Church
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const memberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().min(5, "Phone is required"),
  group: z.string().optional().or(z.literal('')),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  gender: z.enum(["Male", "Female"]).default("Male"),
  maritalStatus: z.enum(["Married", "Unmarried"]).default("Unmarried"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MembersPage() {
  const firestore = useFirestore();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const membersQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'members'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: members, loading } = useCollection(membersQuery);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      group: "",
      status: "Active",
      gender: "Male",
      maritalStatus: "Unmarried",
    },
  });

  React.useEffect(() => {
    if (editingMember) {
      form.reset({
        name: editingMember.name,
        email: editingMember.email || "",
        phone: editingMember.phone || "",
        group: editingMember.group || "",
        status: editingMember.status || "Active",
        gender: editingMember.gender || "Male",
        maritalStatus: editingMember.maritalStatus || "Unmarried",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        group: "",
        status: "Active",
        gender: "Male",
        maritalStatus: "Unmarried",
      });
    }
  }, [editingMember, form]);

  const onSubmit = async (values: MemberFormValues) => {
    if (!firestore) return;

    const memberData = {
      ...values,
      joinedDate: editingMember ? editingMember.joinedDate : serverTimestamp(),
    };

    if (editingMember) {
      const memberRef = doc(firestore, 'members', editingMember.id);
      updateDoc(memberRef, memberData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: memberRef.path,
          operation: 'update',
          requestResourceData: memberData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      addDoc(collection(firestore, 'members'), memberData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'members',
          operation: 'create',
          requestResourceData: memberData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    setIsDialogOpen(false);
    setEditingMember(null);
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this member?')) return;
    const memberRef = doc(firestore, 'members', id);
    deleteDoc(memberRef).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: memberRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const filteredMembers = members?.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = React.useMemo(() => {
    const initial = { 
      total: 0, 
      active: 0, 
      male: 0, 
      female: 0, 
      married: 0, 
      unmarried: 0,
      ministries: new Set<string>()
    };
    if (!members) return { ...initial, ministries: 0 };

    const result = members.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'Active') acc.active++;
      if (curr.gender === 'Male') acc.male++;
      if (curr.gender === 'Female') acc.female++;
      if (curr.maritalStatus === 'Married') acc.married++;
      if (curr.maritalStatus === 'Unmarried') acc.unmarried++;
      if (curr.group) acc.ministries.add(curr.group);
      return acc;
    }, initial);

    return {
      ...result,
      ministries: result.ministries.size
    };
  }, [members]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-headline font-bold text-primary uppercase tracking-tight">Congregation</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Comprehensive membership ledger and demographic insights.</p>
        </div>
        <div className="flex justify-center sm:justify-end gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2 font-bold uppercase text-[10px] tracking-widest h-10 border-primary/20">
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMember(null);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg">
                <Plus className="h-4 w-4" /> Register Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl rounded-2xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">
                  {editingMember ? 'Update Member Profile' : 'New Member Registration'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto px-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Full Legal Name</FormLabel>
                        <FormControl><Input placeholder="Enter full name" className="h-12 text-sm" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Email Address (Optional)</FormLabel>
                          <FormControl><Input type="email" placeholder="email@address.com" className="h-12 text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Primary Phone Number</FormLabel>
                          <FormControl><Input placeholder="+251 ..." className="h-12 text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Gender Orientation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Married">Married</SelectItem>
                              <SelectItem value="Unmarried">Unmarried</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Assigned Ministry / Group</FormLabel>
                          <FormControl><Input placeholder="e.g. Choir, Outreach, Youth" className="h-12 text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Membership Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Current Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="submit" className="w-full bg-primary font-bold uppercase text-xs tracking-widest h-14 shadow-xl">
                      {editingMember ? 'Save Profile Changes' : 'Confirm Registration'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 px-1">
        <Card className="border-none shadow-sm bg-primary text-white col-span-2 sm:col-span-1">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Total Population</CardTitle>
            <Users className="h-4 w-4 opacity-60" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50 border-blue-100">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-blue-700 uppercase tracking-widest">Male</CardTitle>
            <User className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.male}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-rose-50/50 border-rose-100">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-rose-700 uppercase tracking-widest">Female</CardTitle>
            <User className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-rose-500">{stats.female}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50 border-emerald-100">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Married</CardTitle>
            <Heart className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-emerald-700">{stats.married}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50 border-slate-100">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-widest">Unmarried</CardTitle>
            <Heart className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-slate-700">{stats.unmarried}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50/50 border-amber-100">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest">Ministry Grp</CardTitle>
            <Church className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-amber-700">{stats.ministries}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/10 border-accent/20">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-accent-foreground uppercase tracking-widest">Active</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl md:text-2xl font-bold text-accent-foreground">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden w-full">
        <CardHeader className="bg-white/50 border-b p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone or ministry..." 
                className="pl-10 bg-white border-primary/10 h-11 text-sm shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 font-bold uppercase text-[10px] border-primary/20 h-11 bg-white">
                <Filter className="h-4 w-4" /> Comprehensive Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider py-5 pl-6">Profile</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Gender</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Marital</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Ministry</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Member Since</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 italic text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                      Initializing Ledger...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMembers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-muted-foreground italic text-sm">
                    No matching records found in the database.
                  </TableCell>
                </TableRow>
              ) : filteredMembers?.map((member) => (
                <TableRow key={member.id} className="hover:bg-primary/5 transition-all group border-b border-primary/5">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm transition-transform group-hover:scale-110">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-primary tracking-tight">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">ID: {member.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-bold text-slate-600 tracking-tight">{member.phone || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-tighter h-6 ${member.gender === 'Male' ? 'border-blue-200 text-blue-600 bg-blue-50/50' : 'border-rose-200 text-rose-500 bg-rose-50/50'}`}>
                      {member.gender || 'Male'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-slate-200 text-slate-500 bg-slate-50/50 h-6">
                      {member.maritalStatus || 'Unmarried'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-tighter h-6">
                      {member.group || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground font-bold whitespace-nowrap opacity-80">
                    {member.joinedDate?.toDate ? format(member.joinedDate.toDate(), 'MMM d, yyyy') : 'Recent Registry'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] font-bold uppercase tracking-widest px-3 h-6 ${member.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-none">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground p-3 pb-2">Member Profile Management</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setEditingMember(member);
                          setIsDialogOpen(true);
                        }} className="text-sm font-bold p-3">
                          <Edit className="h-4 w-4 mr-3 text-blue-600" /> Edit Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/5" />
                        <DropdownMenuItem className="text-sm font-bold text-rose-700 focus:bg-rose-50 p-3" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4 mr-3" /> Deactivate / Purge Member
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
