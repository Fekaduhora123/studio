"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { financialReportSummary, type FinancialReportSummaryOutput } from '@/ai/flows/financial-report-summary-flow';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const mockFinancialData = {
  monthlyReport: {
    period: "May 2024",
    totalIncome: 12450,
    totalExpenses: 8230,
    balance: 4220,
    incomeBreakdown: [
      { source: "Tithe", amount: 8200 },
      { source: "Offering", amount: 2450 },
      { source: "GoFund", amount: 1800 }
    ],
    expenseBreakdown: [
      { category: "Utility", amount: 1200 },
      { category: "Salary", amount: 4500 },
      { category: "Charity", amount: 1530 },
      { category: "Rent", amount: 1000 }
    ],
    previousPeriodIncome: 13100,
    previousPeriodExpenses: 8000
  },
  yearlyReport: {
    period: "2024 YTD",
    totalIncome: 75400,
    totalExpenses: 52100,
    balance: 23300,
    incomeBreakdown: [
      { source: "Tithe", amount: 52000 },
      { source: "Offering", amount: 14400 },
      { source: "GoFund", amount: 9000 }
    ],
    expenseBreakdown: [
      { category: "Utility", amount: 7200 },
      { category: "Salary", amount: 31500 },
      { category: "Charity", amount: 8400 },
      { category: "Rent", amount: 5000 }
    ]
  }
};

export default function ReportsPage() {
  const [summary, setSummary] = React.useState<FinancialReportSummaryOutput | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState("May 2024");

  const generateAISummary = async () => {
    setLoading(true);
    try {
      const result = await financialReportSummary(mockFinancialData);
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const incomeGrowth = mockFinancialData.monthlyReport.previousPeriodIncome 
    ? ((mockFinancialData.monthlyReport.totalIncome - mockFinancialData.monthlyReport.previousPeriodIncome) / mockFinancialData.monthlyReport.previousPeriodIncome * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Monthly Financials</h1>
          <p className="text-muted-foreground font-medium">Detailed performance analysis for MUGHER FULL GOSPEL CHURCH.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-white font-bold uppercase text-xs tracking-widest border-primary/20">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="May 2024">May 2024</SelectItem>
              <SelectItem value="April 2024">April 2024</SelectItem>
              <SelectItem value="March 2024">March 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 font-bold uppercase text-[10px] tracking-widest border-primary/20">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase text-[10px] tracking-widest shadow-sm" onClick={generateAISummary}>
            <Sparkles className="h-4 w-4" /> Analyze Month
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-primary text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">${mockFinancialData.monthlyReport.totalIncome.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  {Number(incomeGrowth) > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(Number(incomeGrowth))}% vs Last Month
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-rose-600 text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">${mockFinancialData.monthlyReport.totalExpenses.toLocaleString()}</div>
                <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight">Budget: $10,000</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-600 text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Net Balance</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">${mockFinancialData.monthlyReport.balance.toLocaleString()}</div>
                <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight">Health: Positive</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Income Streams</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {mockFinancialData.monthlyReport.incomeBreakdown.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase">
                      <span className="text-muted-foreground">{item.source}</span>
                      <span className="text-primary">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all" 
                        style={{ width: `${(item.amount / mockFinancialData.monthlyReport.totalIncome) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-600">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {mockFinancialData.monthlyReport.expenseBreakdown.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="text-rose-600">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-rose-600 h-full transition-all" 
                        style={{ width: `${(item.amount / mockFinancialData.monthlyReport.totalExpenses) * 100}%` }}
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
                <CardTitle className="text-lg font-headline font-bold text-primary uppercase tracking-tight">AI Monthly Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!summary && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                  <div className="bg-muted p-6 rounded-full">
                    <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary">Intelligence Needed</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our AI analyst can scan your monthly data to identify trends and growth opportunities.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5" onClick={generateAISummary}>
                    Generate Analysis
                  </Button>
                </div>
              ) : loading ? (
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
                      <FileText className="h-4 w-4 text-primary" /> Executive Summary
                    </h4>
                    <div className="text-sm leading-relaxed text-slate-700 bg-muted/30 p-4 rounded-xl border border-primary/5 font-medium italic">
                      "{summary?.summary}"
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" /> Key Trends Identified
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
                      <AlertCircle className="h-4 w-4 text-accent" /> Actionable Insights
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
                    Refresh Analysis
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
