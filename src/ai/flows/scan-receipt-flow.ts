'use server';
/**
 * @fileOverview A Genkit flow for scanning bank receipts and extracting transaction details.
 *
 * - scanReceipt - A function that processes a receipt image and extracts donor name and amount.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScanReceiptOutput - The return type for the scanReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScanReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a bank receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const ScanReceiptOutputSchema = z.object({
  donorName: z.string().describe('The name of the person who made the donation as shown on the receipt.'),
  amount: z.number().describe('The total currency amount shown on the receipt.'),
  currency: z.string().optional().describe('The currency symbol or code found on the receipt.'),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const scanReceiptPrompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: { schema: ScanReceiptInputSchema },
  output: { schema: ScanReceiptOutputSchema },
  prompt: `You are an expert financial auditor. Your task is to extract specific information from the provided bank receipt image.

Please analyze the receipt and extract:
1. The full name of the donor/sender.
2. The exact total amount of the transaction.
3. The currency (e.g., USD, NGN, etc.).

If you cannot find a specific field, return an empty string for text fields or 0 for numeric fields. Be precise and do not hallucinate information.

Receipt Image: {{media url=receiptDataUri}}`,
});

const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ScanReceiptInputSchema,
    outputSchema: ScanReceiptOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await scanReceiptPrompt(input);
      return output!;
    } catch (e: any) {
      console.error('Scan Receipt Flow Error:', e);
      return {
        donorName: "",
        amount: 0,
        currency: ""
      };
    }
  }
);
