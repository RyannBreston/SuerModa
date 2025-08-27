'use server';

/**
 * @fileOverview This file defines a Genkit flow for projecting potential incentives
 * a salesperson can earn based on their current sales performance. It calculates
 * potential rewards for reaching different sales goals (Metinha, Meta, Metona, Legendaria, Corridinha Diaria).
 *
 * - incentiveProjection - A function that triggers the incentive projection flow.
 * - IncentiveProjectionInput - The input type for the incentiveProjection function.
 * - IncentiveProjectionOutput - The return type for the incentiveProjection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncentiveProjectionInputSchema = z.object({
  vendas: z.number().describe('The current sales amount of the salesperson.'),
  metaMinha: z.number().describe('The Metinha sales goal.'),
  meta: z.number().describe('The Meta sales goal.'),
  metona: z.number().describe('The Metona sales goal.'),
  metaLendaria: z.number().describe('The Legendaria sales goal.'),
  metaMinhaPrize: z.number().describe('The Metinha prize.'),
  metaPrize: z.number().describe('The Meta prize.'),
  metonaPrize: z.number().describe('The Metona prize.'),
  legendariaBonusValorVenda: z.number().describe('The sales amount for the Legendaria bonus rule.'),
  legendariaBonusValorPremio: z.number().describe('The prize amount for the Legendaria bonus rule.'),
  pa: z.number().describe('Products per customer.'),
  paGoal1: z.number().describe('PA Goal 1.'),
  paGoal2: z.number().describe('PA Goal 2.'),
  paGoal3: z.number().describe('PA Goal 3.'),
  paGoal4: z.number().describe('PA Goal 4.'),
  paPrize1: z.number().describe('PA Prize 1.'),
  paPrize2: z.number().describe('PA Prize 2.'),
  paPrize3: z.number().describe('PA Prize 3.'),
  paPrize4: z.number().describe('PA Prize 4.'),
  ticketMedio: z.number().describe('Average ticket.'),
  ticketMedioGoal1: z.number().describe('Ticket Medio Goal 1.'),
  ticketMedioGoal2: z.number().describe('Ticket Medio Goal 2.'),
  ticketMedioGoal3: z.number().describe('Ticket Medio Goal 3.'),
  ticketMedioGoal4: z.number().describe('Ticket Medio Goal 4.'),
  ticketMedioPrize1: z.number().describe('Ticket Medio Prize 1.'),
  ticketMedioPrize2: z.number().describe('Ticket Medio Prize 2.'),
  ticketMedioPrize3: z.number().describe('Ticket Medio Prize 3.'),
  ticketMedioPrize4: z.number().describe('Ticket Medio Prize 4.'),
  corridinhaDiaria: z.number().describe('Daily sales target for Corridinha Diaria.'),
});
export type IncentiveProjectionInput = z.infer<typeof IncentiveProjectionInputSchema>;

const IncentiveProjectionOutputSchema = z.object({
  metinhaPremio: z.number().describe('Potential reward for reaching Metinha.'),
  metaPremio: z.number().describe('Potential reward for reaching Meta.'),
  metonaPremio: z.number().describe('Potential reward for reaching Metona.'),
  legendariaBonus: z.number().describe('Potential bonus for reaching Legendaria.'),
  paBonus: z.number().describe('Potential bonus for products per customer.'),
  ticketMedioBonus: z.number().describe('Potential bonus for average ticket.'),
  corridinhaDiariaBonus: z.number().describe('Potential bonus for Corridinha Diaria.'),
});
export type IncentiveProjectionOutput = z.infer<typeof IncentiveProjectionOutputSchema>;

export async function incentiveProjection(input: IncentiveProjectionInput): Promise<IncentiveProjectionOutput> {
  return incentiveProjectionFlow(input);
}

const incentiveProjectionFlow = ai.defineFlow(
  {
    name: 'incentiveProjectionFlow',
    inputSchema: IncentiveProjectionInputSchema,
    outputSchema: IncentiveProjectionOutputSchema,
  },
  async input => {
    let metinhaPremio = 0;
    let metaPremio = 0;
    let metonaPremio = 0;
    let legendariaBonus = 0;
    let paBonus = 0;
    let ticketMedioBonus = 0;
    let corridinhaDiariaBonus = 0;
    
    // Calculate sales prize based on highest achieved tier
    let salesPrize = 0;
    if (input.vendas >= input.metaMinha) {
      salesPrize = input.metaMinhaPrize;
    }
    if (input.vendas >= input.meta) {
      salesPrize = input.metaPrize;
    }
    if (input.vendas >= input.metona) {
      salesPrize = input.metonaPrize;
    }
    
    // Assign the prize to the correct tier for display, zeroing out the others.
    if (input.vendas >= input.metona) {
      metonaPremio = salesPrize;
    } else if (input.vendas >= input.meta) {
      metaPremio = salesPrize;
    } else if (input.vendas >= input.metaMinha) {
      metinhaPremio = salesPrize;
    }


    if (input.vendas >= input.metaLendaria && input.legendariaBonusValorVenda > 0) {
      legendariaBonus = Math.floor((input.vendas - input.metona) / input.legendariaBonusValorVenda) * input.legendariaBonusValorPremio;
    }

    if (input.pa >= input.paGoal4) {
      paBonus = input.paPrize4;
    } else if (input.pa >= input.paGoal3) {
      paBonus = input.paPrize3;
    } else if (input.pa >= input.paGoal2) {
      paBonus = input.paPrize2;
    } else if (input.pa >= input.paGoal1) {
      paBonus = input.paPrize1;
    }


    if (input.ticketMedio >= input.ticketMedioGoal4) {
      ticketMedioBonus = input.ticketMedioPrize4;
    } else if (input.ticketMedio >= input.ticketMedioGoal3) {
      ticketMedioBonus = input.ticketMedioPrize3;
    } else if (input.ticketMedio >= input.ticketMedioGoal2) {
      ticketMedioBonus = input.ticketMedioPrize2;
    } else if (input.ticketMedio >= input.ticketMedioGoal1) {
      ticketMedioBonus = input.ticketMedioPrize1;
    }


    corridinhaDiariaBonus = input.corridinhaDiaria;


    return {
      metinhaPremio: metinhaPremio,
      metaPremio: metaPremio,
      metonaPremio: metonaPremio,
      legendariaBonus: legendariaBonus,
      paBonus: paBonus,
      ticketMedioBonus: ticketMedioBonus,
      corridinhaDiariaBonus: corridinhaDiariaBonus,
    };

  }
);
