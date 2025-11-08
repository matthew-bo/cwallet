import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * GET /api/mcp/resources
 * 
 * Lists available MCP resources
 * This is a proxy to the MCP server for ChatGPT integration
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
    const response = await fetch(`${mcpServerUrl}/resources`, {
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
    console.error('Error fetching MCP resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

