// src/app/api/sellers/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  if (!storeId) {
    return NextResponse.json({ error: 'Store ID é obrigatório' }, { status: 400 });
  }

  try {
    const result = await conn.query('SELECT * FROM sellers WHERE store_id = $1', [storeId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}