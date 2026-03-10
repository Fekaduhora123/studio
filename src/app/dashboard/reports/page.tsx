"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ListFilter,
  ExternalLink,
  Download,
  FileDown
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const firestore = useFirestore();
  const [summary, setSummary] = React.useState<FinancialReportSummaryOutput | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [selectedMonthLabel, setSelectedMonthLabel] = React.useState(format(new Date(), 'MMMM yyyy'));
  
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [detailTitle, setDetailTitle] = React.useState('');
  const [detailItems, setDetailItems] = React.useState<any[]>([]);
  const [detailType, setDetailType] = React.useState<'income' | 'expense'>('income');

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

      const incomeMap: Record<string, number> = {};
      monthDonations.forEach(d => {
        incomeMap[d.type] = (incomeMap[d.type] || 0) + d.amount;
      });

      const expenseMap: Record<string, number> = {};
      monthExpenses.forEach(e => {
        expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount;
      });

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeBreakdown: Object.entries(incomeMap).map(([source, amount]) => ({ source, amount })),
        expenseBreakdown: Object.entries(expenseMap).map(([category, amount]) => ({ category, amount })),
        rawDonations: monthDonations,
        rawExpenses: monthExpenses
      };
    };

    const current = calculateMetrics(currentMonthStart, currentMonthEnd);
    const previous = calculateMetrics(prevMonthStart, prevMonthEnd);

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
        totalIncome: donations.reduce((sum, d) => sum + d.amount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        balance: donations.reduce((sum, d) => sum + d.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
        incomeBreakdown: current.incomeBreakdown,
        expenseBreakdown: current.expenseBreakdown
      }
    };
  }, [donations, expenses, selectedMonthLabel]);

  const generateAISummary = async () => {
    if (!reportData) return;
    setAnalyzing(true);
    try {
      const sanitizeForAI = (report: any) => ({
        period: report.period,
        totalIncome: report.totalIncome,
        totalExpenses: report.totalExpenses,
        balance: report.balance,
        incomeBreakdown: report.incomeBreakdown,
        expenseBreakdown: report.expenseBreakdown,
        previousPeriodIncome: report.previousPeriodIncome || 0,
        previousPeriodExpenses: report.previousPeriodExpenses || 0,
      });

      const result = await financialReportSummary({
        monthlyReport: sanitizeForAI(reportData.monthly),
        yearlyReport: sanitizeForAI(reportData.yearly)
      });
      setSummary(result);
    } catch (err) {
      console.error('AI Summary Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const churchName = "MUGHER FULL GOSPEL CHURCH";
    const reportTitle = `Financial Summary Report: ${selectedMonthLabel}`;

    doc.setFontSize(18);
    doc.setTextColor(45, 78, 178); 
    doc.text(churchName, 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); 
    doc.text(reportTitle, 14, 30);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("High-Level Performance", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value (ETB)']],
      body: [
        ['Total Inflow', reportData.monthly.totalIncome.toLocaleString()],
        ['Total Outflow', reportData.monthly.totalExpenses.toLocaleString()],
        ['Net Balance', reportData.monthly.balance.toLocaleString()],
        ['Building Fund (Net Position)', reportData.monthly.buildingNet.toLocaleString()],
      ],
      theme: 'striped',
      headStyles: { fillStyle: 'fill', fillColor: [45, 78, 178] },
    });

    doc.save(`MUGHER_SUMMARY_${selectedMonthLabel.replace(' ', '_')}.pdf`);
  };

  const handleDownloadCategoryPDF = () => {
    if (!detailItems || detailItems.length === 0) return;

    const doc = new jsPDF();
    const churchName = "MUGHER FULL GOSPEL CHURCH";
    const reportTitle = `Detailed ${detailTitle} Report`;
    const period = selectedMonthLabel;

    doc.setFontSize(16);
    doc.setTextColor(45, 78, 178);
    doc.text(churchName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`${reportTitle} - ${period}`, 14, 28);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, 196, 32);

    const isExpense = detailType === 'expense';
    const headers = isExpense 
      ? [['Date', 'Description (Reason)', 'Audited By', 'Amount (ETB)']] 
      : [['Date', 'Donor Name', 'Reference', 'Amount (ETB)']];

    const body = detailItems.map(item => {
      const dateStr = item.timestamp?.toDate ? format(item.timestamp.toDate(), 'MMM d, yyyy') : 
                     item.date?.toDate ? format(item.date.toDate(), 'MMM d, yyyy') : '---';
      
      if (isExpense) {
        return [
          dateStr,
          item.description || 'N/A',
          item.approvedBy || '---',
          item.amount.toLocaleString()
        ];
      } else {
        return [
          dateStr,
          item.donorName || 'Unidentified',
          item.referenceNumber || '---',
          item.amount.toLocaleString()
        ];
      }
    });

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: body,
      theme: 'grid',
      headStyles: { 
        fillStyle: 'fill', 
        fillColor: isExpense ? [225, 29, 72] : [45, 78, 178] 
      },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { cellWidth: isExpense ? 80 : 'auto' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total ${detailTitle}: ETB ${detailItems.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`, 14, finalY + 10);

    doc.save(`MUGHER_${detailTitle.replace(' ', '_')}_DETAILED_${period.replace(' ', '_')}.pdf`);
  };

  const handleShowDetails = (category: string, type: 'income' | 'expense') => {
    if (!reportData) return;
    setDetailType(type);
    setDetailTitle(category);
    
    if (type === 'income') {
      const items = reportData.monthly.rawDonations.filter(d => d.type === category);
      setDetailItems(items);
    } else {
      const items = reportData.monthly.rawExpenses.filter(e => e.category === category);
      setDetailItems(items);
    }
    setDetailDialogOpen(true);
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
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Financial Performance</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Real-time ledger analysis for MUGHER FULL GOSPEL CHURCH.</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
          <Select value={selectedMonthLabel} onValueChange={setSelectedMonthLabel}>
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] bg-white font-bold uppercase text-[10px] tracking-widest border-primary/20 h-9">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={format(new Date(), 'MMMM yyyy')}>{format(new Date(), 'MMMM yyyy')}</SelectItem>
              <SelectItem value={format(subMonths(new Date(), 1), 'MMMM yyyy')}>{format(subMonths(new Date(), 1), 'MMMM yyyy')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none gap-2 font-bold uppercase text-[9px] md:text-[10px] tracking-widest border-primary/20 h-9" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button className="flex-1 sm:flex-none gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase text-[9px] md:text-[10px] tracking-widest shadow-sm h-9" onClick={generateAISummary}>
              <Sparkles className="h-4 w-4" /> AI Audit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-primary text-white">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Income</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-xl md:text-2xl font-bold">${reportData?.monthly.totalIncome.toLocaleString()}</div>
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
                <div className="text-xl md:text-2xl font-bold">${reportData?.monthly.totalExpenses.toLocaleString()}</div>
                <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight">Active Outflow</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-600 text-white sm:col-span-2 md:col-span-1">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Net Building Fund</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className={`text-xl md:text-2xl font-bold ${reportData?.monthly.buildingNet && reportData.monthly.buildingNet < 0 ? 'text-rose-200' : ''}`}>
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
                {reportData?.monthly.incomeBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No income recorded for this period.</p>
                ) : reportData?.monthly.incomeBreakdown.map((item, i) => (
                  <button 
                    key={i} 
                    className="w-full flex flex-col gap-1 group text-left transition-all hover:translate-x-1"
                    onClick={() => handleShowDetails(item.source, 'income')}
                  >
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-bold uppercase">
                      <span className="text-muted-foreground group-hover:text-primary flex items-center gap-1 truncate max-w-[120px]">
                        {item.source} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="text-primary tabular-nums">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all" 
                        style={{ width: `${(item.amount / (reportData?.monthly.totalIncome || 1)) * 100}%` }}
                      />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-600">Outflow Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {reportData?.monthly.expenseBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No expenses recorded for this period.</p>
                ) : reportData?.monthly.expenseBreakdown.map((item, i) => (
                  <button 
                    key={i} 
                    className="w-full flex flex-col gap-1 group text-left transition-all hover:translate-x-1"
                    onClick={() => handleShowDetails(item.category, 'expense')}
                  >
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-bold uppercase">
                      <span className="text-muted-foreground group-hover:text-rose-600 flex items-center gap-1 truncate max-w-[120px]">
                        {item.category} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="text-rose-600 tabular-nums">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-rose-600 h-full transition-all" 
                        style={{ width: `${(item.amount / (reportData?.monthly.totalExpenses || 1)) * 100}%` }}
                      />
                    </div>
                  </button>
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
                <CardTitle className="text-base md:text-lg font-headline font-bold text-primary uppercase tracking-tight">AI Financial Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {!summary && !analyzing ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                  <div className="bg-muted p-5 rounded-full">
                    <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary text-sm">Analysis Required</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed px-4">
                      AI can analyze the correlation between donation categories and expenditures.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary font-bold uppercase text-[9px] tracking-widest hover:bg-primary/5 h-10" onClick={generateAISummary}>
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="space-y-3">
                    <h4 className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3 text-primary" /> Auditor Notes
                    </h4>
                    <div className="text-xs leading-relaxed text-slate-700 bg-muted/30 p-3 rounded-xl border border-primary/5 font-medium italic">
                      "{summary?.summary}"
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-emerald-600" /> Fund Health
                    </h4>
                    <div className="space-y-2">
                      {summary?.keyTrends.map((trend, i) => (
                        <div key={i} className="text-[10px] bg-emerald-50 p-2.5 rounded-lg border-l-4 border-emerald-500 text-emerald-900 font-bold">
                          {trend}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-accent" /> Insights
                    </h4>
                    <div className="space-y-2">
                      {summary?.insights.map((insight, i) => (
                        <div key={i} className="text-[10px] bg-amber-50 p-2.5 rounded-lg border-l-4 border-amber-500 text-amber-900 font-bold">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary h-8" onClick={() => setSummary(null)}>
                    Clear Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-[98vw] w-full sm:max-w-[95vw] h-[98vh] sm:h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-xl">
          <DialogHeader className="p-4 md:p-6 bg-primary/5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ListFilter className={`h-5 w-5 ${detailType === 'income' ? 'text-primary' : 'text-rose-600'}`} />
                <DialogTitle className="text-lg md:text-xl font-headline font-bold uppercase tracking-tight">
                  {detailTitle} Ledger
                </DialogTitle>
              </div>
              <DialogDescription className="text-[9px] font-bold uppercase tracking-widest">
                Approved records for {selectedMonthLabel}
              </DialogDescription>
            </div>
            <Button 
              size="sm" 
              className={`w-full sm:w-auto font-bold uppercase text-[9px] tracking-widest gap-2 ${detailType === 'income' ? 'bg-primary' : 'bg-rose-600'}`}
              onClick={handleDownloadCategoryPDF}
            >
              <FileDown className="h-4 w-4" /> Download
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                    {detailType === 'income' ? 'Donor Name' : 'Description'}
                  </TableHead>
                  {detailType === 'expense' && <TableHead className="text-[10px] font-bold uppercase tracking-wider">Auditor</TableHead>}
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={detailType === 'income' ? 3 : 4} className="text-center py-12 text-muted-foreground italic text-xs">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                ) : detailItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="text-[10px] font-medium whitespace-nowrap">
                      {item.timestamp?.toDate ? format(item.timestamp.toDate(), 'MMM d, yyyy') : 
                       item.date?.toDate ? format(item.date.toDate(), 'MMM d, yyyy') : '---'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                      {detailType === 'income' ? (item.donorName || 'Unidentified') : item.description}
                    </TableCell>
                    {detailType === 'expense' && (
                      <TableCell className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                        {item.approvedBy || '---'}
                      </TableCell>
                    )}
                    <TableCell className={`text-right font-bold tabular-nums text-xs ${detailType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {detailType === 'expense' ? '-' : ''}${item.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 bg-muted/20 border-t flex justify-end">
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Subtotal</p>
              <p className={`text-lg md:text-xl font-bold ${detailType === 'income' ? 'text-primary' : 'text-rose-600'}`}>
                ${detailItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
