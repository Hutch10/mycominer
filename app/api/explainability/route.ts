import { NextRequest, NextResponse } from 'next/server';

const AGENT_RUNTIME_URL = process.env.NEXT_PUBLIC_AGENT_RUNTIME_URL || 'http://localhost:8080';

/**
 * Explainability API Route
 *
 * Proxies to the backend explainability endpoint.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const backendUrl = sessionId
      ? `${AGENT_RUNTIME_URL}/explainability/graph/${sessionId}`
      : `${AGENT_RUNTIME_URL}/explainability/stats`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching explainability graph:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch explainability graph',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId parameter required',
        },
        { status: 400 }
      );
    }

    const backendUrl = new URL(`${AGENT_RUNTIME_URL}/explainability`);
    backendUrl.searchParams.set('sessionId', sessionId);

    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error clearing graph:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear graph',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
