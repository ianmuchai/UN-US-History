import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { getSiliconFlowConfig } from '@/lib/siliconflow';

export async function GET() {
  const config = getSiliconFlowConfig();

  return NextResponse.json({
    provider: 'openrouter',
    hasApiKey: Boolean(config.apiKey),
    baseUrl: config.baseUrl,
    model: config.model,
    secondaryModel: config.secondaryModel ?? null,
  });
}