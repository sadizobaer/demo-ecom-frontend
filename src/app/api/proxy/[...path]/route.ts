/**
 * Next.js catch-all API proxy
 *
 * All client-side fetch calls that start with /api/proxy/... are
 * forwarded to the Go backend server-side, which completely avoids
 * browser CORS restrictions.
 *
 * Example:
 *   Browser → GET /api/proxy/products
 *   Next.js  → GET http://localhost:8080/products  (server-to-server)
 *   Browser  ← JSON response
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] }
) {
  const path = "/" + (params.path ?? []).join("/");
  const search = req.nextUrl.search ?? "";
  const targetUrl = `${BACKEND}${path}${search}`;

  // Forward all headers except host
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  // For non-GET methods, forward the body
  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const resBody = await backendRes.text();
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      // Strip hop-by-hop headers
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(resBody, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable. Is the Go server running on port 8080?" },
      { status: 502 }
    );
  }
}
