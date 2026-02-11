
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[DebugAPI] GET /api/debug-test hit!');
  return NextResponse.json({ message: 'Routing works!' });
}
