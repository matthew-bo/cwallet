import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * GET /api/mcp/tool
 * 
 * Lists available MCP tools
 */
export async function GET(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // MCP server URL from environment
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';

    // Forward request to MCP server
    const response = await fetch(`${mcpServerUrl}/tools`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'MCP server unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching MCP tools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mcp/tool
 * 
 * Executes an MCP tool
 */
export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session token for MCP server
    const sessionToken = req.headers.get('cookie')?.split('next-auth.session-token=')[1]?.split(';')[0];

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { tool, args } = body;

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    // MCP server URL from environment
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';

    // Forward request to MCP server
    const response = await fetch(`${mcpServerUrl}/tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ tool, args }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'MCP server error' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error executing MCP tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

