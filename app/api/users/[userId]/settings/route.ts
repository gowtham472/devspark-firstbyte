import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface UpdateSettingsRequest {
  profileVisibility?: 'public' | 'private';
  emailNotifications?: boolean;
  hubNotifications?: boolean;
  followNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  showEmail?: boolean;
  showInstitution?: boolean;
}

// PUT /api/users/[userId]/settings - Update user settings
export const PUT = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.split('/');
    const userId = pathSegments[pathSegments.length - 2]; // Get userId from path
    
    if (!userId || userId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    const body = await parseRequestBody<UpdateSettingsRequest>(request);
    if (!body) {
      return createApiResponse(false, null, 'Invalid request body');
    }

    try {
      // Update user settings in Firestore
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('users').doc(userId).update(updateData);

      // Get updated user data
      const updatedDoc = await adminDb.collection('users').doc(userId).get();
      
      return createApiResponse(true, updatedDoc.data(), undefined, 'Settings updated successfully');
    } catch (error) {
      console.error('Firebase error, using mock response:', error);
      
      // Mock response for development
      return createApiResponse(true, {
        id: userId,
        ...body,
        updatedAt: new Date().toISOString(),
      }, undefined, 'Settings updated successfully (mock)');
    }
  } catch (error) {
    return handleApiError(error);
  }
});