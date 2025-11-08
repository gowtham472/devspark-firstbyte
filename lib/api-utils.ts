import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success,
    data,
    error,
    message,
  }, {
    status: success ? 200 : 400,
  });
}

export async function verifyAuthToken(request: NextRequest): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, auth: { uid: string }) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await verifyAuthToken(request);
    if (!auth) {
      return createApiResponse(false, null, 'Authentication required');
    }
    return handler(request, auth);
  };
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  return createApiResponse(false, null, 'Internal server error');
}

export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}