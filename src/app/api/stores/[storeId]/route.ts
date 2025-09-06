// src/app/api/stores/[storeId]/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';

// Função para ATUALIZAR (PUT) uma loja
export async function PUT(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'O nome da loja é obrigatório' }, { status: 400 });
  }

  try {
    const result = await conn.query(
      'UPDATE stores SET name = $1 WHERE id = $2 RETURNING *',
      [name, storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para DELETAR uma loja
export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    // A exclusão em cascata (ON DELETE CASCADE) no schema do DB cuidará de remover vendedores e metas associados.
    const result = await conn.query(
      'DELETE FROM stores WHERE id = $1 RETURNING *',
      [storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Loja removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover loja:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}