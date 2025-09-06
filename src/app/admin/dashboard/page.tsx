import { NextResponse } from 'next/server';
import conn from '@/lib/db';
import { keysToCamel } from '@/lib/utils';

// Função para buscar e consolidar todos os dados para o dashboard do admin
export async function GET() {
  try {
    // Usamos uma consulta SQL com JOIN para buscar todos os vendedores e o nome de suas lojas de uma só vez.
    const query = `
      SELECT 
        s.*, 
        st.name as store_name 
      FROM 
        sellers s
      JOIN 
        stores st ON s.store_id = st.id
    `;
    
    const sellersResult = await conn.query(query);

    // Também buscamos todas as lojas para ter a lista completa, mesmo as que não têm vendedores.
    const storesResult = await conn.query('SELECT * FROM stores');

    const responseData = {
      sellers: keysToCamel(sellersResult.rows),
      stores: keysToCamel(storesResult.rows)
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar dados consolidados para o dashboard:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
