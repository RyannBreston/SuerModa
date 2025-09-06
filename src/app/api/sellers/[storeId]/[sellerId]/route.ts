import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils';

// Função GET para buscar os dados públicos de UM vendedor
export async function GET(
  request: Request,
  { params }: { params: { sellerId: string } }
) {
  const { sellerId } = params;
  try {
    // Seleciona apenas os campos públicos necessários para a tela de login
    const result = await conn.query(
      'SELECT id, name, avatar_id FROM sellers WHERE id = $1',
      [sellerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 });
    }
    
    // Converte de snake_case (banco) para camelCase (frontend)
    return NextResponse.json(keysToCamel(result.rows[0]));
  } catch (error) {
    console.error(`Erro ao buscar vendedor ${sellerId}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função POST para ATUALIZAR os dados de desempenho de um vendedor
export async function POST(
  request: Request,
  { params }: { params: { sellerId: string } }
) {
  const { sellerId } = params;
  // O frontend envia os dados em camelCase
  const { vendas, pa, ticketMedio, corridinhaDiaria } = await request.json();

  if (!sellerId) {
    return NextResponse.json({ error: 'ID do vendedor é obrigatório' }, { status: 400 });
  }

  try {
    // Usa os nomes de coluna em snake_case para o SQL
    const result = await conn.query(
      `UPDATE sellers 
       SET vendas = $1, pa = $2, ticket_medio = $3, corridinha_diaria = $4 
       WHERE id = $5 
       RETURNING *`,
      [vendas, pa, ticketMedio, corridinhaDiaria, sellerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendedor não encontrado para atualização' }, { status: 404 });
    }

    // Retorna os dados atualizados, convertidos para camelCase
    return NextResponse.json(keysToCamel(result.rows[0]));
  } catch (error) {
    console.error(`Erro ao atualizar vendedor ${sellerId}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
