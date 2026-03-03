"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { financialReportSummary, type FinancialReportSummaryOutput } from '@/ai/flows/financial-report-summary-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { startOfMonth, endOfMonth, subMonths, format, isWithinInterval } from 'date-fns';

export default function ReportsPage() {
  const firestore = useFirestore();
  const [summary, setSummary] = React.useState<FinancialReportSummaryOutput | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [selectedMonthLabel, setSelectedMonthLabel] = React.useState(format(new Date(), 'MMMM yyyy'));

  // Fetch all approved data for reporting
  const donationsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), where('status', '==', 'approved'));
  }, [firestore]);

  const expensesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'expenses'), where('status', '==', 'Approved'));
  }, [firestore]);

  const { data: donations, loading: donationsLoading } = useCollection(donationsQuery);
  const { data: expenses, loading: expensesLoading } = useCollection(expensesQuery);

  const reportData = React.useMemo(() => {
    if (!donations || !expenses) return null;

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    const calculateMetrics = (start: Date, end: Date) => {
      const monthDonations = donations.filter(d => d.timestamp?.toDate && isWithinInterval(d.timestamp.toDate(), { start, end }));
      const monthExpenses = expenses.filter(e => e.date?.toDate && isWithinInterval(e.date.toDate(), { start, end }));

      const totalIncome = monthDonations.reduce((sum, d) => sum + d.amount, 0);
      const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Income Breakdown
      const incomeMap: Record<string, number> = {};
      monthDonations.forEach(d => {
        incomeMap[d.type] = (incomeMap[d.type] || 0) + d.amount;
      });

      // Expense Breakdown
      const expenseMap: Record<string, number> = {};
      monthExpenses.forEach(e => {
        expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount;
      });

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeBreakdown: Object.entries(incomeMap).map(([source, amount]) => ({ source, amount })),
        expenseBreakdown: Object.entries(expenseMap).map(([category, amount]) => ({ category, amount }))
      };
    };

    const current = calculateMetrics(currentMonthStart, currentMonthEnd);
    const previous = calculateMetrics(prevMonthStart, prevMonthEnd);

    // Special logic for "Building Purposes" net balance
    const buildingDonations = current.incomeBreakdown.find(i => i.source === 'Building Purposes')?.amount || 0;
    const buildingExpenses = current.expenseBreakdown.find(e => e.category === 'Building Purposes')?.amount || 0;
    const buildingNet = buildingDonations - buildingExpenses;

    return {
      monthly: {
        period: selectedMonthLabel,
        ...current,
        previousPeriodIncome: previous.totalIncome,
        previousPeriodExpenses: previous.totalExpenses,
        buildingNet
      },
      yearly: {
        period: `${format(now, 'yyyy')} YTD`,
        // Simply use all approved for YTD in MVP
        totalIncome: donations.reduce((sum, d) => sum + d.amount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        balance: donations.reduce((sum, d) => sum + d.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
        incomeBreakdown: current.incomeBreakdown, // Simplified for brevity
        expenseBreakdown: current.expenseBreakdown
      }
    };
  }, [donations, expenses, selectedMonthLabel]);

  const generateAISummary = async () => {
    if (!reportData) return;
    setAnalyzing(true);
    try {
      const result = await financialReportSummary({
        monthlyReport: reportData.monthly,
        yearlyReport: reportData.yearly
      });
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (donationsLoading || expensesLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const incomeGrowth = reportData?.monthly.previousPeriodIncome 
    ? (((reportData.monthly.totalIncome - reportData.monthly.previousPeriodIncome) / reportData.monthly.previousPeriodIncome) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Financial Performance</h1>
          <p className="text-muted-foreground font-medium">Real-time ledger analysis for MUGHER FULL GOSPEL CHURCH.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonthLabel} onValueChange={setSelectedMonthLabel}>
            <SelectTrigger className="w-[180px] bg-white font-bold uppercase text-xs tracking-widest border-primary/20">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={format(new Date(), 'MMMM yyyy')}>{format(new Date(), 'MMMM yyyy')}</SelectItem>
              <SelectItem value={format(subMonths(new Date(), 1), 'MMMM yyyy')}>{format(subMonths(new Date(), 1), 'MMMM yyyy')}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase text-[10px] tracking-widest shadow-sm" onClick={generateAISummary}>
            <Sparkles className="h-4 w-4" /> Run AI Audit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-primary text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Income</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">${reportData?.monthly.totalIncome.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  {Number(incomeGrowth) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(Number(incomeGrowth))}% vs Previous
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-rose-600 text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">${reportData?.monthly.totalExpenses.toLocaleString()}</div>
                <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight">Active Burn Rate</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-600 text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Net Building Fund</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className={`text-2xl font-bold ${reportData?.monthly.buildingNet && reportData.monthly.buildingNet < 0 ? 'text-rose-200' : ''}`}>
                  ${reportData?.monthly.buildingNet.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight">Allocated Balance</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Inflow Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {reportData?.monthly.incomeBreakdown.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase">
                      <span className="text-muted-foreground">{item.source}</span>
                      <span className="text-primary">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all" 
                        style={{ width: `${(item.amount / (reportData?.monthly.totalIncome || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-600">Outflow Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {reportData?.monthly.expenseBreakdown.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="text-rose-600">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-rose-600 h-full transition-all" 
                        style={{ width: `${(item.amount / (reportData?.monthly.totalExpenses || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-primary/5">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg font-headline font-bold text-primary uppercase tracking-tight">AI Financial Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!summary && !analyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                  <div className="bg-muted p-6 rounded-full">
                    <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary">Analysis Required</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      AI can analyze the correlation between specific donation categories and expenditures.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5" onClick={generateAISummary}>
                    Start Analysis
                  </Button>
                </div>
              ) : analyzing ? (
                <div className="space-y-6">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="space-y-3">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Auditor Notes
                    </h4>
                    <div className="text-sm leading-relaxed text-slate-700 bg-muted/30 p-4 rounded-xl border border-primary/5 font-medium italic">
                      "{summary?.summary}"
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" /> Fund Health
                    </h4>
                    <div className="space-y-2">
                      {summary?.keyTrends.map((trend, i) => (
                        <div key={i} className="text-[11px] bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-500 text-emerald-900 font-bold">
                          {trend}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-accent" /> Leadership Insights
                    </h4>
                    <div className="space-y-2">
                      {summary?.insights.map((insight, i) => (
                        <div key={i} className="text-[11px] bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 text-amber-900 font-bold">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors" onClick={() => setSummary(null)}>
                    Clear Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}