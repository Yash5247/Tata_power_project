import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    equipment: {
      total: 24,
      healthy: 18,
      atRisk: 4,
      critical: 2
    }
  })
}

