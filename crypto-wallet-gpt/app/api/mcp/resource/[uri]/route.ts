import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

type RouteContext = {
  params: Promise<{ uri: string }>;
};

/**
 * GET /api/mcp/resource/:uri
 * 
 * Fetches a specific MCP resource
 * This is a proxy to the MCP server for ChatGPT integration
 */
export async function GET(req: Request, context: RouteContext) {
  try {
    // Await params (Next.js 15+ requirement)
    const params = await context.params;
    const { uri } = params;

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session token for MCP server
    // Note: In production, you'd want to use a proper token mechanism
    const sessionToken = req.headers.get('cookie')?.split('next-auth.session-token=')[1]?.split(';')[0];

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      );
    }

    // MCP server URL from environment
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';

    // Forward request to MCP server
    const response = await fetch(`${mcpServerUrl}/resource/${encodeURIComponent(uri)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
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
    console.error('Error fetching MCP resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

