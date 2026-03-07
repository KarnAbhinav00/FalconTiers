import { NextResponse } from 'next/server'

const MESSAGE = 'Tier list item API is not configured in the current schema.'

export async function GET() {
  return NextResponse.json({ error: MESSAGE }, { status: 501 })
}

export async function POST() {
  return NextResponse.json({ error: MESSAGE }, { status: 501 })
}

export async function PUT() {
  return NextResponse.json({ error: MESSAGE }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ error: MESSAGE }, { status: 501 })
}
