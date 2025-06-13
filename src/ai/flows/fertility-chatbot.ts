// src/ai/flows/fertility-chatbot.ts
'use server';

/**
 * @fileOverview A fertility chatbot AI agent.
 *
 * - fertilityChatbot - A function that handles the chatbot interactions.
 * - FertilityChatbotInput - The input type for the fertilityChatbot function.
 * - FertilityChatbotOutput - The return type for the fertilityChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FertilityChatbotInputSchema = z.object({
  question: z.string().describe('The question the user asks the chatbot.'),
  context: z.string().optional().describe('Additional context to help the chatbot answer the question.'),
});
export type FertilityChatbotInput = z.infer<typeof FertilityChatbotInputSchema>;

const FertilityChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type FertilityChatbotOutput = z.infer<typeof FertilityChatbotOutputSchema>;

export async function fertilityChatbot(input: FertilityChatbotInput): Promise<FertilityChatbotOutput> {
  return fertilityChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fertilityChatbotPrompt',
  input: {schema: FertilityChatbotInputSchema},
  output: {schema: FertilityChatbotOutputSchema},
  prompt: `You are Luna, a helpful and informative AI chatbot assistant specializing in fertility. Answer user questions about fertility, providing tips and guidance.

  Here is some additional context: {{{context}}}

  Question: {{{question}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', // Relaxed from BLOCK_LOW_AND_ABOVE
      },
    ],
  }
});

const fertilityChatbotFlow = ai.defineFlow(
  {
    name: 'fertilityChatbotFlow',
    inputSchema: FertilityChatbotInputSchema,
    outputSchema: FertilityChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
