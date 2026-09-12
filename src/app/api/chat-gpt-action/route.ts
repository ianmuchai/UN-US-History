// src/app/api/chat-gpt-action/route.ts
// This endpoint is specifically designed for ChatGPT Action integration
import { NextRequest, NextResponse } from 'next/server';
import { usClimatePolicies, getAllStatements } from '@/lib/policyData';

interface ActionRequest {
  query: string;
  context?: string;
}

function isActionRequest(value: unknown): value is ActionRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'query' in value &&
    typeof (value as { query?: unknown }).query === 'string'
  );
}

function includesAnyTerm(value: string | undefined, terms: string[]): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.toLowerCase();
  return terms.some((term) => normalizedValue.includes(term));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isActionRequest(body) || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    const context = body.context?.trim();
    const searchTerms = (context ? `${query} ${context}` : query)
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);
    const terms = searchTerms.length > 0 ? searchTerms : [query.toLowerCase()];

    // Process the query
    const allStatements = getAllStatements();
    const relevantStatements = allStatements.filter(stmt =>
      includesAnyTerm(stmt.quote, terms) ||
      includesAnyTerm(stmt.position, terms) ||
      includesAnyTerm(stmt.context, terms)
    ).slice(0, 5);

    const response = {
      query,
      context,
      findings: relevantStatements.map(stmt => ({
        date: stmt.date,
        speaker: stmt.speaker,
        quote: stmt.quote || stmt.position,
        context: stmt.context,
        category: stmt.category,
      })),
      themes: usClimatePolicies.map(theme => ({
        title: theme.title,
        position: theme.overallPosition,
        recent_shifts: theme.shifts.slice(0, 2),
        areas_of_ambiguity: theme.areas_of_ambiguity.slice(0, 2),
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('ChatGPT Action error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return OpenAPI spec for ChatGPT Action
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'US Climate & Energy Policy Agent API',
      version: '1.0.0',
      description: 'Query and analyze US climate and energy policy positions',
    },
    servers: [
      {
        url: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000',
      },
    ],
    paths: {
      '/api/chat-gpt-action': {
        post: {
          summary: 'Query US climate and energy policy',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'Policy query or topic to analyze',
                    },
                    context: {
                      type: 'string',
                      description: 'Additional context for the query',
                    },
                  },
                  required: ['query'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Policy analysis results',
            },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
