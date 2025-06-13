// estimate-ovulation-flow.ts
'use server';

/**
 * @fileOverview Estimates the time to ovulation based on logged cycle data.
 *
 * - estimateTimeToOvulation - A function that estimates the time to ovulation.
 * - EstimateTimeToOvulationInput - The input type for the estimateTimeToOvulation function.
 * - EstimateTimeToOvulationOutput - The return type for the estimateTimeToOvulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTimeToOvulationInputSchema = z.object({
  cycleData: z
    .string()
    .describe(
      'A string containing the user\u2019s logged cycle data, including previous period dates, cycle lengths, and any BBT or ovulation test results.'
    ),
});
export type EstimateTimeToOvulationInput = z.infer<typeof EstimateTimeToOvulationInputSchema>;

const EstimateTimeToOvulationOutputSchema = z.object({
  timeToOvulationDays: z
    .number()
    .describe(
      'The estimated number of days until ovulation, based on the provided cycle data.'
    ),
  confidenceLevel: z
    .string()
    .describe(
      'A string indicating the confidence level of the estimation (e.g., High, Medium, Low), based on the consistency and completeness of the cycle data.'
    ),
  additionalTips: z
    .string()
    .describe(
      'Any personalized tips for the user based on their cycle data, such as when to start ovulation testing or potential lifestyle adjustments.'
    ),
});
export type EstimateTimeToOvulationOutput = z.infer<typeof EstimateTimeToOvulationOutputSchema>;

export async function estimateTimeToOvulation(
  input: EstimateTimeToOvulationInput
): Promise<EstimateTimeToOvulationOutput> {
  return estimateTimeToOvulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTimeToOvulationPrompt',
  input: {schema: EstimateTimeToOvulationInputSchema},
  output: {schema: EstimateTimeToOvulationOutputSchema},
  prompt: `You are an AI assistant specialized in fertility tracking and ovulation prediction.
  Based on the user's logged cycle data, estimate the time to ovulation, provide a confidence level for the estimation, and offer personalized tips.

  Cycle Data: {{{cycleData}}}

  Please provide the estimated time to ovulation in days, a confidence level (High, Medium, or Low), and any relevant tips for the user.
  Format the output as a JSON object.`,
});

const estimateTimeToOvulationFlow = ai.defineFlow(
  {
    name: 'estimateTimeToOvulationFlow',
    inputSchema: EstimateTimeToOvulationInputSchema,
    outputSchema: EstimateTimeToOvulationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
