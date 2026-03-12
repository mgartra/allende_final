import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    return NextResponse.json({ message: "¡Conexión total lograda!" })
  } catch (error) {
    return NextResponse.json({ error: "Error de base de datos" }, { status: 500 })
  }
}