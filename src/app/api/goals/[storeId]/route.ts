// src/app/api/goals/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils';

// Função GET para buscar as metas da loja (com logging melhorado)
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    let result = await conn.query('SELECT * FROM goals WHERE store_id = $1 LIMIT 1', [storeId]);
    
    if (result.rows.length === 0) {
      // Se não encontrar, busca as metas padrão
      result = await conn.query("SELECT * FROM goals WHERE store_id = '00000000-0000-0000-0000-000000000000' LIMIT 1");
    }
    
    if (result.rows.length === 0) {
      console.error(`Nenhuma meta encontrada para storeId: ${storeId} ou como padrão.`);
      return NextResponse.json({ error: 'Nenhuma meta encontrada' }, { status: 404 });
    }
    
    // Converte de snake_case (banco) para camelCase (frontend)
    const goalsInCamelCase = keysToCamel(result.rows[0]);
    return NextResponse.json(goalsInCamelCase);

  } catch (error) {
    console.error(`Erro CRÍTICO ao buscar metas para storeId: ${storeId}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar metas.' }, { status: 500 });
  }
}

// Função POST para salvar/atualizar as metas da loja (versão explícita e segura)
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  // O frontend envia os dados em camelCase
  const goals: { [key: string]: number } = await request.json();

  // Mapeamento explícito de camelCase (JS) para snake_case (SQL)
  const queryParams = [
    storeId,
    goals.metaMinha, goals.meta, goals.metona, goals.metaLendaria,
    goals.legendariaBonusValorVenda, goals.legendariaBonusValorPremio,
    goals.metaMinhaPrize, goals.metaPrize, goals.metonaPrize,
    goals.paGoal1, goals.paPrize1, goals.paGoal2, goals.paPrize2,
    goals.paGoal3, goals.paPrize3, goals.paGoal4, goals.paPrize4,
    goals.ticketMedioGoal1, goals.ticketMedioPrize1, goals.ticketMedioGoal2, goals.ticketMedioPrize2,
    goals.ticketMedioGoal3, goals.ticketMedioPrize3, goals.ticketMedioGoal4, goals.ticketMedioPrize4
  ];
  
  const query = `
    INSERT INTO goals (
      store_id,
      meta_minha, meta, metona, meta_lendaria,
      legendaria_bonus_valor_venda, legendaria_bonus_valor_premio,
      meta_minha_prize, meta_prize, metona_prize,
      pa_goal1, pa_prize1, pa_goal2, pa_prize2, pa_goal3, pa_prize3, pa_goal4, pa_prize4,
      ticket_medio_goal1, ticket_medio_prize1, ticket_medio_goal2, ticket_medio_prize2,
      ticket_medio_goal3, ticket_medio_prize3, ticket_medio_goal4, ticket_medio_prize4
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
    )
    ON CONFLICT (store_id) 
    DO UPDATE SET
      meta_minha = EXCLUDED.meta_minha,
      meta = EXCLUDED.meta,
      metona = EXCLUDED.metona,
      meta_lendaria = EXCLUDED.meta_lendaria,
      legendaria_bonus_valor_venda = EXCLUDED.legendaria_bonus_valor_venda,
      legendaria_bonus_valor_premio = EXCLUDED.legendaria_bonus_valor_premio,
      meta_minha_prize = EXCLUDED.meta_minha_prize,
      meta_prize = EXCLUDED.meta_prize,
      metona_prize = EXCLUDED.metona_prize,
      pa_goal1 = EXCLUDED.pa_goal1,
      pa_prize1 = EXCLUDED.pa_prize1,
      pa_goal2 = EXCLUDED.pa_goal2,
      pa_prize2 = EXCLUDED.pa_prize2,
      pa_goal3 = EXCLUDED.pa_goal3,
      pa_prize3 = EXCLUDED.pa_prize3,
      pa_goal4 = EXCLUDED.pa_goal4,
      pa_prize4 = EXCLUDED.pa_prize4,
      ticket_medio_goal1 = EXCLUDED.ticket_medio_goal1,
      ticket_medio_prize1 = EXCLUDED.ticket_medio_prize1,
      ticket_medio_goal2 = EXCLUDED.ticket_medio_goal2,
      ticket_medio_prize2 = EXCLUDED.ticket_medio_prize2,
      ticket_medio_goal3 = EXCLUDED.ticket_medio_goal3,
      ticket_medio_prize3 = EXCLUDED.ticket_medio_prize3,
      ticket_medio_goal4 = EXCLUDED.ticket_medio_goal4,
      ticket_medio_prize4 = EXCLUDED.ticket_medio_prize4
    RETURNING *;
  `;

  try {
    const result = await conn.query(query, queryParams);
    return NextResponse.json(keysToCamel(result.rows[0]));
  } catch (error) {
    console.error('Erro CRÍTICO ao salvar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao salvar metas.' }, { status: 500 });
  }
}