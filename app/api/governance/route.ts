import { NextResponse } from 'next/server';

const AGENT_RUNTIME_URL = process.env.NEXT_PUBLIC_AGENT_RUNTIME_URL || 'http://localhost:8080';

/**
 * Governance API Route
 *
 * Proxies to the backend governance endpoint.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const backendUrl = new URL(`${AGENT_RUNTIME_URL}/governance`);
    if (sessionId) {
      backendUrl.searchParams.set('sessionId', sessionId);
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendData = await response.json();
    console.log('PROXY DATA FETCHED:', JSON.stringify(backendData));
    if (!backendData?.logs || backendData.logs.length === 0) {
      console.error('PROXY ERROR: Backend returned 0 logs for session:', sessionId);
    }
    return NextResponse.json(
      backendData,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error fetching governance logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch governance logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId parameter required for deletion',
        },
        { status: 400 }
      );
    }

    const backendUrl = new URL(`${AGENT_RUNTIME_URL}/governance`);
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
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
