'use server';
/**
 * @fileOverview A Genkit flow for scanning digital banking receipts and QR transaction summaries.
 *
 * - scanReceipt - A function that processes a QR/Digital receipt image and extracts transaction details.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScanReceiptOutput - The return type for the scanReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScanReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo or screenshot of a digital banking receipt or QR transaction, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const ScanReceiptOutputSchema = z.object({
  donorName: z.string().describe('The name of the person who made the donation/transfer.'),
  amount: z.number().describe('The total currency amount transferred.'),
  currency: z.string().optional().describe('The currency (e.g., ETB).'),
  qrNumber: z.string().optional().describe('The QR Transaction ID or Reference Number (e.g., FT24...)'),
  detectedAccountNumber: z.string().optional().describe('The destination account number found.'),
  isCorrectAccount: z.boolean().describe('True if the transfer was sent to account 1000221935978 or MUGHER FULL GOSPEL CHURCH.'),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const scanReceiptPrompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: { schema: ScanReceiptInputSchema },
  output: { schema: ScanReceiptOutputSchema },
  prompt: `You are an expert financial auditor for MUGHER FULL GOSPEL CHURCH. 
Your task is to scan the provided image (usually a mobile banking screenshot or QR receipt) and extract transaction details.

Please analyze the image and extract:
1. The donor's name (sender).
2. The exact amount transferred.
3. The QR Transaction Number / Reference Number (e.g., 'QR Number', 'Ref No', 'Txn ID').
4. The destination account.

VERIFICATION RULES:
Set 'isCorrectAccount' to true ONLY if the destination matches:
- Account: 1000221935978 (or ends in 5978)
- Beneficiary: MUGHER FULL GOSPEL CHURCH (or variations like MUGHER FULL GOS, MUGHER BEL CHU)

Digital Receipt Image: {{media url=receiptDataUri}}`,
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
      console.error('Scan QR Flow Error:', e);
      return {
        donorName: "",
        amount: 0,
        currency: "ETB",
        qrNumber: "",
        detectedAccountNumber: "",
        isCorrectAccount: false
      };
    }
  }
);
