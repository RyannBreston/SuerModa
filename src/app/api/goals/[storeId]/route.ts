// src/app/api/goals/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils'; // Importa a nova função

// Função GET para buscar as metas da loja
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    let result = await conn.query('SELECT * FROM goals WHERE store_id = $1 LIMIT 1', [storeId]);
    
    // Se não encontrar metas para a loja, busca as metas padrão
    if (result.rows.length === 0) {
      result = await conn.query("SELECT * FROM goals WHERE store_id = '00000000-0000-0000-0000-000000000000' LIMIT 1");
    }
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Nenhuma meta encontrada' }, { status: 404 });
    }
    
    // Converte as chaves do resultado para camelCase antes de enviar
    const goalsInCamelCase = keysToCamel(result.rows[0]);
    return NextResponse.json(goalsInCamelCase);

  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// A função POST já deve estar correta, mas vamos garantir
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  const goalsData = await request.json(); // Recebe dados em camelCase

  // Converte para snake_case para o SQL
  const goalsInSnakeCase: { [key: string]: any } = {};
  for (const key in goalsData) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    goalsInSnakeCase[snakeKey] = goalsData[key];
  }

  const goalKeys = Object.keys(goalsInSnakeCase);
  const goalValues = Object.values(goalsInSnakeCase);
  const setClause = goalKeys.map((key, index) => `${key} = $${index + 2}`).join(', ');

  const query = `
    INSERT INTO goals (store_id, ${goalKeys.join(', ')})
    VALUES ($1, ${goalKeys.map((_, i) => `$${i + 2}`).join(', ')})
    ON CONFLICT (store_id) 
    DO UPDATE SET ${setClause}
    RETURNING *;
  `;

  try {
    const result = await conn.query(query, [storeId, ...goalValues]);
    // Converte de volta para camelCase para a resposta
    return NextResponse.json(keysToCamel(result.rows[0]));
  } catch (error) {
    console.error('Erro ao salvar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}