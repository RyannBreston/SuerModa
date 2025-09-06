// src/app/api/sellers/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils'; // Importa a nova função

// Função GET
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  try {
    const result = await conn.query('SELECT * FROM sellers WHERE store_id = $1 ORDER BY name ASC', [storeId]);
    // Converte o resultado para camelCase
    return NextResponse.json(keysToCamel(result.rows));
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função POST
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  // Recebe em camelCase
  const { name, password, avatarId } = await request.json();

  if (!name || !password || !avatarId) {
    return NextResponse.json({ error: 'Dados incompletos para criar vendedor' }, { status: 400 });
  }

  try {
    // Insere no DB usando snake_case
    const result = await conn.query(
      `INSERT INTO sellers (name, password, avatar_id, store_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, password, avatarId, storeId]
    );
    // Converte a resposta para camelCase
    return NextResponse.json(keysToCamel(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}