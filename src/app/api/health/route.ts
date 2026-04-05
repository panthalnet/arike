import { NextResponse } from 'next/server'

export async function GET() {
  // Basic health check - returns 200 OK if server is running
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
