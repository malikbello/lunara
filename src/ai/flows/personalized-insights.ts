'use server';

/**
 * @fileOverview Generates personalized fertility insights for the user.
 *
 * - personalizedInsights - A function that generates personalized fertility insights.
 * - PersonalizedInsightsInput - The input type for the personalizedInsights function.
 * - PersonalizedInsightsOutput - The return type for the personalizedInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedInsightsInputSchema = z.object({
  cycleData: z.string().describe('The user provided cycle data.'),
  moodData: z.string().describe('The user provided mood data.'),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on the user data.'),
});
export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function personalizedInsights(input: PersonalizedInsightsInput): Promise<PersonalizedInsightsOutput> {
  return personalizedInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsInputSchema},
  output: {schema: PersonalizedInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in providing personalized fertility insights.

  Based on the user's cycle data: {{{cycleData}}},
  and mood data: {{{moodData}}},
  generate personalized insights to help the user understand their body better.
  These insights should be actionable and informative.
  \n  Provide only the insights in your response.`,
});

const personalizedInsightsFlow = ai.defineFlow(
  {
    name: 'personalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema,
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
