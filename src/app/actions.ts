'use server'

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export async function submitRSVP(formData: FormData) {
  const nombre = formData.get('nombre') as string;

  if (!nombre || nombre.trim().length === 0) {
    return { success: false, message: 'El nombre es obligatorio' };
  }

  // DIAGNÓSTICO: Verificar si Vercel inyectó las variables
  if (!process.env.POSTGRES_URL) {
    console.error("CRITICAL: POSTGRES_URL is missing. Database not connected.");
    return {
      success: false,
      message: 'Error de Configuración: Falta conectar la base de datos en Vercel (Storage -> Connect).'
    };
  }

  try {
    // Intentamos insertar. Si la tabla no existe, fallará (el usuario debe correr el SQL script).
    // OJO: Podríamos hacer un "CREATE TABLE IF NOT EXISTS" aquí mismo para "Auto-setup", 
    // pero es mala práctica en producción. Para un "hobby project" zafa.
    // Vamos a ser pragmáticos: Hacemos el CREATE TABLE IF NOT EXISTS aquí para que "simplemente funcione".

    await sql`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      INSERT INTO guests (name) VALUES (${nombre});
    `;

    revalidatePath('/lista');
    return { success: true, message: '¡Confirmado! Nos vemos en la fiesta.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Error interno de base de datos. Revisá los logs de Vercel.' };
  }
}
