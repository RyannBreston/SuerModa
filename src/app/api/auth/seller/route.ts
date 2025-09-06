// src/app/api/auth/seller/route.ts
import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { sellerId, password } = await request.json();

    if (!sellerId || !password) {
      return NextResponse.json({ success: false, message: 'Dados incompletos' }, { status: 400 });
    }

    const result = await conn.query('SELECT * FROM sellers WHERE id = $1', [sellerId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Vendedor não encontrado' }, { status: 404 });
    }

    const seller = result.rows[0];

    // Compara a senha enviada com a senha no banco de dados
    if (seller.password === password) {
      // Senha correta, retorna sucesso e os dados públicos do vendedor
      delete seller.password; // Remove a senha da resposta por segurança
      return NextResponse.json({ success: true, seller: keysToCamel(seller) });
    } else {
      // Senha incorreta
      return NextResponse.json({ success: false, message: 'Senha incorreta' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro na autenticação do vendedor:', error);
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}