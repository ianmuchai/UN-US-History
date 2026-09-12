import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSiliconFlowConfig } from '@/lib/siliconflow';

export const dynamic = 'force-dynamic';

function keyFingerprint(apiKey: string | undefined): string | null {
  if (!apiKey) {
    return null;
  }

  return createHash('sha256').update(apiKey).digest('hex').slice(0, 12);
}

export async function GET() {
  const config = getSiliconFlowConfig();

  return NextResponse.json({
    provider: 'openrouter',
    hasApiKey: Boolean(config.apiKey),
    keyLength: config.apiKey?.length ?? 0,
    keyLooksLikeOpenRouter: config.apiKey?.startsWith('sk-or-v1-') ?? false,
    keyFingerprint: keyFingerprint(config.apiKey),
    baseUrl: config.baseUrl,
    model: config.model,
    secondaryModel: config.secondaryModel ?? null,
  });
}