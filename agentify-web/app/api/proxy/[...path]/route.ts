import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://18.136.71.18:3000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return handleRequest(request, params, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string,
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search; // Bao gồm cả dấu ?

  // Tạo URL đầy đủ đến backend (loại bỏ trailing slash của BACKEND_URL nếu có)
  const backendBase = BACKEND_URL.replace(/\/$/, '');
  const backendUrl = `${backendBase}/${path}${queryString}`;

  try {
    // Lấy body nếu có (cho POST, PUT, PATCH)
    let body = null;
    const contentType = request.headers.get('content-type');
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (contentType?.includes('application/json')) {
        try {
          body = await request.json();
        } catch (e) {
          console.error('Error parsing JSON body:', e);
        }
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        body = await request.text();
      } else {
        // Thử parse JSON trước, nếu không được thì lấy text
        try {
          const text = await request.text();
          body = text ? JSON.parse(text) : null;
        } catch {
          body = null;
        }
      }
    }

    // Lấy headers từ request gốc (trừ host và các headers không cần thiết)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Bỏ qua các headers không cần forward
      const lowerKey = key.toLowerCase();
      if (
        ![
          'host',
          'content-length',
          'connection',
          'transfer-encoding',
          'referer',
          'origin',
        ].includes(lowerKey)
      ) {
        headers[key] = value;
      }
    });

    // Set Content-Type nếu chưa có và có body
    if (body && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Log để debug (chỉ trong dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] ${method} ${backendUrl}`, {
        headers,
        body: body ? JSON.stringify(body).substring(0, 200) : null,
      });
    }

    // Forward request đến backend
    const response = await axios({
      method: method as any,
      url: backendUrl,
      data: body,
      headers,
      validateStatus: () => true, // Không throw error cho bất kỳ status code nào
    });

    // Log response để debug
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] Response ${response.status} from ${backendUrl}`);
    }

    // Trả về response từ backend
    // Giữ nguyên Content-Type từ backend nếu có
    const responseHeaders: Record<string, string> = {};
    if (response.headers['content-type']) {
      responseHeaders['Content-Type'] = response.headers[
        'content-type'
      ] as string;
    } else {
      responseHeaders['Content-Type'] = 'application/json';
    }

    // Nếu response là JSON, parse và trả về
    if (typeof response.data === 'object') {
      return NextResponse.json(response.data, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // Nếu không phải JSON, trả về text
    return new NextResponse(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Proxy] Error:', {
      message: error.message,
      url: backendUrl,
      method,
      stack: error.stack,
    });

    // Nếu là axios error, trả về thông tin chi tiết hơn
    if (error.response) {
      return NextResponse.json(
        {
          error: 'Proxy error',
          message: error.message,
          backendError: {
            status: error.response.status,
            data: error.response.data,
          },
        },
        { status: error.response.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 },
    );
  }
}
