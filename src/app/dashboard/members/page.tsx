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
  CardDescription
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
  Mail,
  Phone,
  UserPlus,
  UserCheck,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockMembers = [
  { id: 1, name: 'Alice Thompson', email: 'alice@example.com', phone: '(555) 123-4567', group: 'Choir', joined: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Benjamin Garcia', email: 'ben@example.com', phone: '(555) 234-5678', group: 'Youth', joined: '2023-03-22', status: 'Active' },
  { id: 3, name: 'Catherine Wu', email: 'cath@example.com', phone: '(555) 345-6789', group: 'Media', joined: '2022-11-05', status: 'Inactive' },
  { id: 4, name: 'David Smith', email: 'david@example.com', phone: '(555) 456-7890', group: 'Ushers', joined: '2023-06-10', status: 'Active' },
  { id: 5, name: 'Elena Rodriguez', email: 'elena@example.com', phone: '(555) 567-8901', group: 'Women', joined: '2023-02-28', status: 'Active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', phone: '(555) 678-9012', group: 'Men', joined: '2022-09-14', status: 'Active' },
];

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredMembers = mockMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Congregation</h1>
          <p className="text-muted-foreground">Manage your member database and ministry groups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">1,248</div>
            <Users className="h-8 w-8 text-primary/20" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">1,102</div>
            <UserCheck className="h-8 w-8 text-emerald-500/20" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">24</div>
            <UserPlus className="h-8 w-8 text-accent/20" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search members..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold w-[250px]">Name</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Ministry</TableHead>
                <TableHead className="font-bold">Joined</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                      {member.group}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.joined}</TableCell>
                  <TableCell>
                    <Badge className={member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Member</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Archive Member</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No members found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}