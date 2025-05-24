import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: Request, { params }: { params: Promise<{ title: string }> }) {
  const { title } = await params
  try {
    const prisma = new PrismaClient()
    const novel = await prisma.novel.findFirst({
      where: {
        title,
      },
    })
    await prisma.$disconnect()

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
    }

    return NextResponse.json(novel)
  } catch (error) {
    console.error('Error fetching novel:', error)
    return NextResponse.json({ error: 'Failed to fetch novel' }, { status: 500 })
  }
}
