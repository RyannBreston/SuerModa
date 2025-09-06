// src/app/api/goals/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';

// Função GET para buscar as metas da loja
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    // Esta consulta assume que você tem uma tabela 'goals' com 'store_id'
    const result = await conn.query('SELECT * FROM goals WHERE store_id = $1 LIMIT 1', [storeId]);
    
    if (result.rows.length === 0) {
      // Se não houver metas específicas, você pode retornar metas padrão
      const defaultResult = await conn.query("SELECT * FROM goals WHERE store_id = 'default' LIMIT 1");
      if (defaultResult.rows.length === 0) {
        return NextResponse.json({ error: 'Nenhuma meta encontrada' }, { status: 404 });
      }
      return NextResponse.json(defaultResult.rows[0]);
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função POST para salvar/atualizar as metas da loja
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  const goalsData = await request.json();

  // Lista de todas as chaves de metas para a consulta SQL
  const goalKeys = Object.keys(goalsData);
  const goalValues = Object.values(goalsData);

  // Monta a parte SET da consulta dinamicamente
  const setClause = goalKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

  const query = `
    INSERT INTO goals (store_id, ${goalKeys.map(k => `"${k}"`).join(', ')})
    VALUES ($1, ${goalKeys.map((_, i) => `$${i + 2}`).join(', ')})
    ON CONFLICT (store_id) 
    DO UPDATE SET ${setClause}
    RETURNING *;
  `;

  try {
    const result = await conn.query(query, [storeId, ...goalValues]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}