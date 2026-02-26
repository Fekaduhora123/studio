'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting significant decreases in donation income
 * and generating AI-powered insights into potential reasons or implications.
 *
 * - financialAnomalyAlert - A function that triggers the financial anomaly detection flow.
 * - FinancialAnomalyAlertInput - The input type for the financialAnomalyAlert function.
 * - FinancialAnomalyAlertOutput - The return type for the financialAnomalyAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const FinancialAnomalyAlertInputSchema = z.object({
  currentMonthIncome: z.number().describe('Total donation income for the current reporting period.'),
  previousMonthIncome: z.number().describe('Total donation income for the previous reporting period.'),
  averageHistoricalIncome: z.number().optional().describe('Optional: Average donation income over a longer historical period (e.g., last 6-12 months) for broader context.'),
  thresholdPercentage: z.number().min(0).max(100).default(10).describe('The percentage decrease (0-100) that triggers an anomaly alert.'),
});
export type FinancialAnomalyAlertInput = z.infer<typeof FinancialAnomalyAlertInputSchema>;

// Output Schema
const FinancialAnomalyAlertOutputSchema = z.object({
  isAnomalyDetected: z.boolean().describe('True if a significant donation income decrease was detected, false otherwise.'),
  insight: z.string().describe('An AI-generated insight into potential reasons or implications if an anomaly is detected, or a message indicating no anomaly.'),
  currentMonthIncome: z.number().describe('The current reporting period\'s income.'),
  previousMonthIncome: z.number().describe('The previous reporting period\'s income.'),
  percentageChange: z.number().describe('The percentage change in income from the previous period to the current period.'),
});
export type FinancialAnomalyAlertOutput = z.infer<typeof FinancialAnomalyAlertOutputSchema>;

// Prompt definition
const financialAnomalyInsightPrompt = ai.definePrompt({
  name: 'financialAnomalyInsightPrompt',
  input: { schema: FinancialAnomalyAlertInputSchema },
  output: { schema: FinancialAnomalyAlertOutputSchema.pick({ insight: true }) },
  prompt: `You are an AI financial analyst for a church.\n  \nA significant decrease in donation income has been detected. Your task is to provide a brief, concise insight into potential reasons for this decrease and its possible implications for the church.\n\nHere are the financial details:\n- Current Period Income: $ {{{currentMonthIncome}}}\n- Previous Period Income: $ {{{previousMonthIncome}}}\n- Percentage Decrease: {{{percentageChange}}}%\n\n{{#if averageHistoricalIncome}}\n- Average Historical Income (over a longer period): $ {{{averageHistoricalIncome}}}\n{{/if}}\n\nPlease consider common factors influencing church donations, such as seasonal trends, economic changes, or recent church activities. Focus on providing actionable insights.\n\nProvide your insight in a single paragraph.`,
});

// Genkit Flow definition
const financialAnomalyAlertFlow = ai.defineFlow(
  {
    name: 'financialAnomalyAlertFlow',
    inputSchema: FinancialAnomalyAlertInputSchema,
    outputSchema: FinancialAnomalyAlertOutputSchema,
  },
  async (input) => {
    const { currentMonthIncome, previousMonthIncome, averageHistoricalIncome, thresholdPercentage } = input;

    let percentageChange = 0;
    if (previousMonthIncome > 0) {
      percentageChange = ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
    } else if (currentMonthIncome > 0) {
      // If previous income was 0 but current is positive, it's an increase, not a decrease relevant to the anomaly.
      // We'll set a high positive percentage so it doesn't trigger a decrease anomaly.
      percentageChange = 10000; // A very large increase, effectively not a decrease
    } else {
      // Both are 0
      percentageChange = 0;
    }

    const isAnomalyDetected = percentageChange < -thresholdPercentage;

    let insight = `No significant anomaly detected. Income changed by ${percentageChange.toFixed(2)}%.`;

    if (isAnomalyDetected) {
      // Call the AI prompt to get insight
      const promptInput = {
        currentMonthIncome,
        previousMonthIncome,
        averageHistoricalIncome,
        percentageChange: parseFloat(Math.abs(percentageChange).toFixed(2)), // Pass absolute value for readability in prompt
        thresholdPercentage, // Not strictly used by prompt, but part of the input schema
      };
      const { output } = await financialAnomalyInsightPrompt(promptInput);
      insight = output?.insight || 'AI failed to generate insight.';
    }

    return {
      isAnomalyDetected,
      insight,
      currentMonthIncome,
      previousMonthIncome,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    };
  }
);

// Wrapper function for external calls
export async function financialAnomalyAlert(input: FinancialAnomalyAlertInput): Promise<FinancialAnomalyAlertOutput> {
  return financialAnomalyAlertFlow(input);
}
