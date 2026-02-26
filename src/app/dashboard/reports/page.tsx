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
  Lightbulb
} from 'lucide-react';
import { financialReportSummary, type FinancialReportSummaryOutput } from '@/ai/flows/financial-report-summary-flow';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights into church revenue and expenditure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> PDF Report
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={generateAISummary}>
            <Sparkles className="h-4 w-4" /> AI Insights
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-headline font-bold">Monthly Summary</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">May 2024</Badge>
            </div>
            <CardDescription>Income vs Expenses breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-primary">$12,450</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-accent-foreground">$8,230</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Income Streams</h4>
              {mockFinancialData.monthlyReport.incomeBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.source}</span>
                  <span className="font-medium">${item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between font-bold text-primary">
                <span>Net Balance</span>
                <span>$4,220</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-headline font-bold text-primary">AI Financial Analyst</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!summary && !loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="bg-muted p-4 rounded-full">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold">Generate Intelligence</h4>
                  <p className="text-sm text-muted-foreground max-w-[300px]">
                    Use our AI to summarize your reports and find actionable trends.
                  </p>
                </div>
                <Button variant="outline" className="border-accent text-accent-foreground" onClick={generateAISummary}>
                  Generate Report Summary
                </Button>
              </div>
            ) : loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div>
                  <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Executive Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700">{summary?.summary}</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Key Trends
                    </h4>
                    <ul className="space-y-2">
                      {summary?.keyTrends.map((trend, i) => (
                        <li key={i} className="text-xs bg-muted/50 p-2 rounded-md border-l-2 border-primary">{trend}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Actionable Insights
                    </h4>
                    <ul className="space-y-2">
                      {summary?.insights.map((insight, i) => (
                        <li key={i} className="text-xs bg-accent/10 p-2 rounded-md border-l-2 border-accent text-accent-foreground font-medium">{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}