// src/app/api/sellers/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';

// Função GET (que você já tinha)
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  try {
    const result = await conn.query('SELECT * FROM sellers WHERE store_id = $1 ORDER BY name ASC', [storeId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// NOVA Função POST para adicionar um vendedor
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  const { name, password, avatarId } = await request.json();

  if (!name || !password || !avatarId) {
    return NextResponse.json({ error: 'Dados incompletos para criar vendedor' }, { status: 400 });
  }

  try {
    const result = await conn.query(
      `INSERT INTO sellers (name, password, avatar_id, store_id, vendas, pa, ticket_medio, corridinha_diaria)
       VALUES ($1, $2, $3, $4, 0, 0, 0, 0)
       RETURNING *`,
      [name, password, avatarId, storeId]
    );
    return NextResponse.json(result.rows[0], { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}