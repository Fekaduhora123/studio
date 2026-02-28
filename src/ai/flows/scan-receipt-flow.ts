'use server';
/**
 * @fileOverview A Genkit flow for scanning bank receipts and extracting transaction details.
 *
 * - scanReceipt - A function that processes a receipt image and extracts donor name, amount, and account verification.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScanReceiptOutput - The return type for the scanReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  detectedAccountNumber: z.string().optional().describe('The destination account number found on the receipt.'),
  detectedBeneficiary: z.string().optional().describe('The name of the bank account recipient found on the receipt.'),
  isCorrectAccount: z.boolean().describe('True if the receipt shows a transfer to account 1000221935978 or MUGHER FULL GOSPEL CHURCH (including abbreviations like FULL GOS, BEL CHU, or MUGHER).'),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const scanReceiptPrompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: { schema: ScanReceiptInputSchema },
  output: { schema: ScanReceiptOutputSchema },
  prompt: `You are an expert financial auditor for MUGHER FULL GOSPEL CHURCH. Your task is to extract information and verify if a donation was sent to the correct church account.

Please analyze the receipt image and extract:
1. The full name of the donor/sender (e.g., "FIKADU HORA REGASSA").
2. The exact total amount of the transaction (e.g., 1000.00).
3. The currency (e.g., ETB, USD).
4. The destination account number or partial number (e.g., "5978").
5. The name of the beneficiary/recipient.

VERIFICATION RULES:
Set 'isCorrectAccount' to true if you find ANY of the following:
- The account number matches or ends with "1000221935978" or "5978".
- The beneficiary name is "MUGHER FULL GOSPEL CHURCH" or similar abbreviations like "FULL GOS", "BEL CHU", "ETHIOPIAN FULL GOS", "MU/M/", "MUGHER".

If the receipt is for a different church or account, set 'isCorrectAccount' to false.

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
        currency: "",
        detectedAccountNumber: "",
        detectedBeneficiary: "",
        isCorrectAccount: false
      };
    }
  }
);
