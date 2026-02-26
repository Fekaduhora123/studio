'use server';
/**
 * @fileOverview This file implements a Genkit flow for drafting engaging announcements and event descriptions.
 *
 * - draftAnnouncement - A function that handles the content drafting process.
 * - DraftAnnouncementInput - The input type for the draftAnnouncement function.
 * - DraftAnnouncementOutput - The return type for the draftAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftAnnouncementInputSchema = z.object({
  contentType: z
    .enum(['announcement', 'event'])
    .describe('The type of content to draft: either an announcement or an event description.'),
  keyPoints: z
    .string()
    .describe(
      'Key points or details to include in the draft, provided as a concise text summary.'
    ),
});
export type DraftAnnouncementInput = z.infer<typeof DraftAnnouncementInputSchema>;

const DraftAnnouncementOutputSchema = z.object({
  draftedContent: z.string().describe('The AI-generated draft of the announcement or event description.'),
});
export type DraftAnnouncementOutput = z.infer<typeof DraftAnnouncementOutputSchema>;

export async function draftAnnouncement(
  input: DraftAnnouncementInput
): Promise<DraftAnnouncementOutput> {
  return draftAnnouncementFlow(input);
}

const draftAnnouncementPrompt = ai.definePrompt({
  name: 'draftAnnouncementPrompt',
  input: {schema: DraftAnnouncementInputSchema},
  output: {schema: DraftAnnouncementOutputSchema},
  prompt: `You are an AI assistant specialized in drafting engaging and concise content for church communications.
Your goal is to help an Admin user create compelling announcements or event descriptions.

Based on the provided key points, generate a draft for a {{{contentType}}}.
Ensure the tone is welcoming and informative.

Key Points: {{{keyPoints}}}`,
});

const draftAnnouncementFlow = ai.defineFlow(
  {
    name: 'draftAnnouncementFlow',
    inputSchema: DraftAnnouncementInputSchema,
    outputSchema: DraftAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await draftAnnouncementPrompt(input);
    return output!;
  }
);
