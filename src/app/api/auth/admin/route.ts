// src/app/api/auth/admin/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Pega a senha correta da variável de ambiente
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      // Se a variável de ambiente não estiver configurada, retorna um erro
      console.error("ADMIN_PASSWORD não está definido nas variáveis de ambiente.");
      return NextResponse.json({ success: false, message: 'Erro de configuração no servidor.' }, { status: 500 });
    }

    if (password === correctPassword) {
      // Senha correta
      return NextResponse.json({ success: true });
    } else {
      // Senha incorreta
      return NextResponse.json({ success: false, message: 'Senha incorreta' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Requisição inválida' }, { status: 400 });
  }
}