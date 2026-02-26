'use server';
/**
 * @fileOverview A Genkit flow for generating an AI-powered summary of monthly and yearly financial reports.
 *
 * - financialReportSummary - A function that calls the Genkit flow to summarize financial data.
 * - FinancialReportSummaryInput - The input type for the financialReportSummary function.
 * - FinancialReportSummaryOutput - The return type for the financialReportSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IncomeDataItemSchema = z.object({
  source: z.string().describe('Source of income (e.g., Tithe, Offering, GoFund).'),
  amount: z.number().describe('Amount received from this source.'),
});

const ExpenseDataItemSchema = z.object({
  category: z.string().describe('Category of expense (e.g., Utility, Rent, Salary).'),
  amount: z.number().describe('Amount spent for this category.'),
});

const FinancialReportDataSchema = z.object({
  period: z.string().describe('The reporting period, e.g., "Monthly" or "Yearly" followed by specific date/range.'),
  totalIncome: z.number().describe('Total income for the period.'),
  totalExpenses: z.number().describe('Total expenses for the period.'),
  balance: z.number().describe('Financial balance (Income - Expenses) for the period.'),
  incomeBreakdown: z.array(IncomeDataItemSchema).describe('Detailed breakdown of income sources.'),
  expenseBreakdown: z.array(ExpenseDataItemSchema).describe('Detailed breakdown of expenses by category.'),
  previousPeriodIncome: z.number().optional().describe('Total income from the previous comparable period for trend analysis.'),
  previousPeriodExpenses: z.number().optional().describe('Total expenses from the previous comparable period for trend analysis.'),
});

const FinancialReportSummaryInputSchema = z.object({
  monthlyReport: FinancialReportDataSchema.describe('Structured data for the monthly financial report.'),
  yearlyReport: FinancialReportDataSchema.describe('Structured data for the yearly financial report.'),
});
export type FinancialReportSummaryInput = z.infer<typeof FinancialReportSummaryInputSchema>;

const FinancialReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise AI-generated summary of the financial reports.'),
  keyTrends: z.array(z.string()).describe('List of key trends observed (e.g., "Tithe increased by X%").'),
  insights: z.array(z.string()).describe('Actionable insights or recommendations based on the financial data.'),
});
export type FinancialReportSummaryOutput = z.infer<typeof FinancialReportSummaryOutputSchema>;

const financialReportSummaryPrompt = ai.definePrompt({
  name: 'financialReportSummaryPrompt',
  input: { schema: FinancialReportSummaryInputSchema },
  output: { schema: FinancialReportSummaryOutputSchema },
  prompt: `You are an expert financial analyst for a church. Your task is to summarize the provided monthly and yearly financial reports, highlight key trends, and provide actionable insights.

---
Monthly Financial Report (Period: {{{monthlyReport.period}}})
Total Income: ${{monthlyReport.totalIncome}}
Total Expenses: ${{monthlyReport.totalExpenses}}
Balance: ${{monthlyReport.balance}}

Income Breakdown:
{{#each monthlyReport.incomeBreakdown}}
- {{{this.source}}}: ${{this.amount}}
{{/each}}

Expense Breakdown:
{{#each monthlyReport.expenseBreakdown}}
- {{{this.category}}}: ${{this.amount}}
{{/each}}

{{#if monthlyReport.previousPeriodIncome}}
Compared to previous month:
Previous Month's Income: ${{monthlyReport.previousPeriodIncome}}
Previous Month's Expenses: ${{monthlyReport.previousPeriodExpenses}}
{{/if}}

---
Yearly Financial Report (Period: {{{yearlyReport.period}}})
Total Income: ${{yearlyReport.totalIncome}}
Total Expenses: ${{yearlyReport.totalExpenses}}
Balance: ${{yearlyReport.balance}}

Income Breakdown:
{{#each yearlyReport.incomeBreakdown}}
- {{{this.source}}}: ${{this.amount}}
{{/each}}

Expense Breakdown:
{{#each yearlyReport.expenseBreakdown}}
- {{{this.category}}}: ${{this.amount}}
{{/each}}

{{#if yearlyReport.previousPeriodIncome}}
Compared to previous year:
Previous Year's Income: ${{yearlyReport.previousPeriodIncome}}
Previous Year's Expenses: ${{yearlyReport.previousPeriodExpenses}}
{{/if}}

---

Based on the reports above, provide:
1.  A concise summary of the church's financial health for both the month and the year.
2.  Key trends, especially focusing on changes compared to previous periods, top income sources, and major expenses.
3.  Actionable insights or recommendations for financial management.

Format your response as a JSON object with the following structure:
{
  "summary": "...",
  "keyTrends": [
    "...",
    "..."
  ],
  "insights": [
    "...",
    "..."
  ]
}
`,
});

const financialReportSummaryFlow = ai.defineFlow(
  {
    name: 'financialReportSummaryFlow',
    inputSchema: FinancialReportSummaryInputSchema,
    outputSchema: FinancialReportSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await financialReportSummaryPrompt(input);
    return output!;
  }
);

export async function financialReportSummary(input: FinancialReportSummaryInput): Promise<FinancialReportSummaryOutput> {
  return financialReportSummaryFlow(input);
}
