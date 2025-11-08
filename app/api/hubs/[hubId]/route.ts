import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface UpdateHubRequest {
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  previewImage?: string;
}

// GET /api/hubs/[hubId] - Get specific hub
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const hubId = pathname.split('/').pop();
    
    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = {
      id: hubDoc.id,
      ...hubDoc.data()
    };

    return createApiResponse(true, hubData);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/hubs/[hubId] - Update hub
export const PUT = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { pathname } = new URL(request.url);
    const hubId = pathname.split('/').pop();
    
    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = hubDoc.data();
    if (hubData?.ownerId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    const body = await parseRequestBody<UpdateHubRequest>(request);
    if (!body) {
      return createApiResponse(false, null, 'Invalid request body');
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('studyHubs').doc(hubId).update(updateData);

    const updatedDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    const responseData = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };

    return createApiResponse(true, responseData, undefined, 'Hub updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE /api/hubs/[hubId] - Delete hub
export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { pathname } = new URL(request.url);
    const hubId = pathname.split('/').pop();
    
    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = hubDoc.data();
    if (hubData?.ownerId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    await adminDb.collection('studyHubs').doc(hubId).delete();

    return createApiResponse(true, null, undefined, 'Hub deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});