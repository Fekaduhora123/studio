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
  Activity
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
  phone: z.string().optional().or(z.literal('')),
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
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = React.useMemo(() => {
    const initial = { total: 0, active: 0, male: 0, female: 0, married: 0, unmarried: 0 };
    if (!members) return initial;

    return members.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'Active') acc.active++;
      if (curr.gender === 'Male') acc.male++;
      if (curr.gender === 'Female') acc.female++;
      if (curr.maritalStatus === 'Married') acc.married++;
      if (curr.maritalStatus === 'Unmarried') acc.unmarried++;
      return acc;
    }, initial);
  }, [members]);

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
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Congregation</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Manage church membership data and demographic insights.</p>
        </div>
        <div className="flex justify-center sm:justify-end gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2 font-bold uppercase text-[10px] tracking-widest h-9">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMember(null);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary font-bold uppercase text-[10px] tracking-widest h-9">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-headline font-bold text-primary uppercase tracking-tight">
                  {editingMember ? 'Edit Profile' : 'Register Member'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Full Name</FormLabel>
                        <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Email</FormLabel>
                          <FormControl><Input type="email" placeholder="email@address.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Phone</FormLabel>
                          <FormControl><Input placeholder="+251 ..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Gender" />
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
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Marital</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Ministry/Group</FormLabel>
                          <FormControl><Input placeholder="e.g. Choir" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
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
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-primary font-bold uppercase text-[10px] tracking-widest h-11">
                      {editingMember ? 'Update Profile' : 'Register Member'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <Card className="border-none shadow-sm bg-primary text-white col-span-2 sm:col-span-1">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Total</CardTitle>
            <Users className="h-3 w-3 opacity-60" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50 border-blue-100">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-blue-700 uppercase tracking-widest">Male</CardTitle>
            <User className="h-3 w-3 text-blue-400" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg md:text-xl font-bold text-blue-600">{stats.male}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-rose-50/50 border-rose-100">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-rose-700 uppercase tracking-widest">Female</CardTitle>
            <User className="h-3 w-3 text-rose-400" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg md:text-xl font-bold text-rose-500">{stats.female}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50 border-emerald-100">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Married</CardTitle>
            <Heart className="h-3 w-3 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg md:text-xl font-bold text-emerald-700">{stats.married}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50 border-slate-100">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-widest">Unmarried</CardTitle>
            <Heart className="h-3 w-3 text-slate-300" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg md:text-xl font-bold text-slate-700">{stats.unmarried}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/10 border-accent/20">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[9px] md:text-[10px] font-bold text-accent-foreground uppercase tracking-widest">Active</CardTitle>
            <Activity className="h-3 w-3 text-accent" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg md:text-xl font-bold text-accent-foreground">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white/50 border-b p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name or email..." 
                className="pl-9 bg-white border-primary/10 h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 font-bold uppercase text-[10px] border-primary/20 h-9">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Member</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Gender</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Marital</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Ministry</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Joined</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 italic text-muted-foreground text-xs">Loading database...</TableCell>
                </TableRow>
              ) : filteredMembers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic text-xs">No members found.</TableCell>
                </TableRow>
              ) : filteredMembers?.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-primary/5">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-primary truncate max-w-[120px]">{member.name}</span>
                        <span className="text-[9px] text-muted-foreground font-medium truncate max-w-[120px]">{member.email || member.phone || 'No contact'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-tighter ${member.gender === 'Male' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-rose-200 text-rose-500 bg-rose-50'}`}>
                      {member.gender || 'Male'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-muted text-muted-foreground">
                      {member.maritalStatus || 'Unmarried'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-tighter">
                      {member.group || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {member.joinedDate?.toDate ? format(member.joinedDate.toDate(), 'MMM d, yyyy') : 'Recently'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] font-bold uppercase tracking-widest ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member Profile</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setEditingMember(member);
                          setIsDialogOpen(true);
                        }} className="text-xs font-bold">
                          <Edit className="h-4 w-4 mr-2 text-blue-600" /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs font-bold text-rose-700 focus:bg-rose-50" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Member
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
