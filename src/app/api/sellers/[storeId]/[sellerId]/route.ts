// src/app/api/sellers/[storeId]/[sellerId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';

// Função para ATUALIZAR os dados de um vendedor (ex: vendas, PA, etc.)
export async function POST(
  request: Request,
  { params }: { params: { sellerId: string } }
) {
  const { sellerId } = params;
  const { vendas, pa, ticketMedio, corridinhaDiaria } = await request.json();

  if (!sellerId) {
    return NextResponse.json({ error: 'ID do vendedor é obrigatório' }, { status: 400 });
  }

  try {
    const result = await conn.query(
      `UPDATE sellers 
       SET vendas = $1, pa = $2, ticket_medio = $3, corridinha_diaria = $4 
       WHERE id = $5 
       RETURNING *`,
      [vendas, pa, ticketMedio, corridinhaDiaria, sellerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}