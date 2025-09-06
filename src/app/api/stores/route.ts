// src/app/api/stores/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';

export async function GET() {
  try {
    const result = await conn.query('SELECT * FROM stores ORDER BY name ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, themeColor } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'O nome da loja é obrigatório' }, { status: 400 });
  }

  const client = await conn.connect();
  try {
    await client.query('BEGIN'); // Inicia transação

    // 1. Insere a nova loja
    const storeResult = await client.query(
      'INSERT INTO stores (name, theme_color) VALUES ($1, $2) RETURNING *',
      [name, themeColor || '217.2 32.6% 17.5%']
    );
    const newStore = storeResult.rows[0];

    // 2. Copia as metas padrão para a nova loja
    await client.query(`
      INSERT INTO goals (store_id, meta_minha, meta, metona, meta_lendaria, legendaria_bonus_valor_venda, legendaria_bonus_valor_premio, meta_minha_prize, meta_prize, metona_prize, pa_goal1, pa_prize1, pa_goal2, pa_prize2, pa_goal3, pa_prize3, pa_goal4, pa_prize4, ticket_medio_goal1, ticket_medio_prize1, ticket_medio_goal2, ticket_medio_prize2, ticket_medio_goal3, ticket_medio_prize3, ticket_medio_goal4, ticket_medio_prize4)
      SELECT $1, meta_minha, meta, metona, meta_lendaria, legendaria_bonus_valor_venda, legendaria_bonus_valor_premio, meta_minha_prize, meta_prize, metona_prize, pa_goal1, pa_prize1, pa_goal2, pa_prize2, pa_goal3, pa_prize3, pa_goal4, pa_prize4, ticket_medio_goal1, ticket_medio_prize1, ticket_medio_goal2, ticket_medio_prize2, ticket_medio_goal3, ticket_medio_prize3, ticket_medio_goal4, ticket_medio_prize4
      FROM goals WHERE store_id = '00000000-0000-0000-0000-000000000000'
    `, [newStore.id]);

    await client.query('COMMIT'); // Finaliza transação
    return NextResponse.json(newStore, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK'); // Desfaz em caso de erro
    console.error('Erro ao criar loja:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}