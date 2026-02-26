"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  HandCoins, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { financialAnomalyAlert } from '@/ai/flows/financial-anomaly-alert-flow';
import type { FinancialAnomalyAlertOutput } from '@/ai/flows/financial-anomaly-alert-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mockChartData = [
  { name: 'Jan', income: 4500, expenses: 3200 },
  { name: 'Feb', income: 5200, expenses: 3800 },
  { name: 'Mar', income: 4800, expenses: 4000 },
  { name: 'Apr', income: 6100, expenses: 4200 },
  { name: 'May', income: 5900, expenses: 4100 },
  { name: 'Jun', income: 7200, expenses: 4500 },
];

export default function DashboardOverview() {
  const [anomaly, setAnomaly] = React.useState<FinancialAnomalyAlertOutput | null>(null);

  React.useEffect(() => {
    // Check for anomalies using the AI tool (mocking inputs based on recent chart data)
    const checkAnomalies = async () => {
      // In a real app, these would come from Firestore
      const result = await financialAnomalyAlert({
        currentMonthIncome: 5900,
        previousMonthIncome: 7200,
        averageHistoricalIncome: 5500,
        thresholdPercentage: 15
      });
      setAnomaly(result);
    };
    checkAnomalies();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold text-primary">Good Morning, Sanctuary Admin</h1>
        <p className="text-muted-foreground">Here's the latest summary of your church's growth and health.</p>
      </div>

      {anomaly?.isAnomalyDetected && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold flex items-center gap-2">
            AI Financial Alert: Significant Income Decrease Detected
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm opacity-90">
            {anomaly.insight}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-rose-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> -4%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,230</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '66%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">66% of target budget</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Next: Sunday Worship (10:00 AM)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold text-primary">Financial Overview</CardTitle>
            <CardDescription>Monthly breakdown of income vs expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="income" fill="#2D4EB2" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expenses" fill="#EBB41D" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold text-primary">Recent Donations</CardTitle>
            <CardDescription>Latest contributions from our members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Sarah Wilson', type: 'Tithe', amount: '$250', date: '2 hours ago' },
                { name: 'Michael Chen', type: 'GoFund', amount: '$1,000', date: '5 hours ago' },
                { name: 'Emily Davis', type: 'Offering', amount: '$45', date: 'Yesterday' },
                { name: 'Robert Johnson', type: 'Tithe', amount: '$500', date: 'Yesterday' },
                { name: 'Grace Lee', type: 'Special Seed', amount: '$150', date: '2 days ago' },
              ].map((donation, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{donation.name}</p>
                    <p className="text-xs text-muted-foreground">{donation.type} • {donation.date}</p>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">{donation.amount}</div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-primary hover:bg-primary/5 mt-2">View all transactions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}