import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth } from '@/lib/api-utils';

// GET /api/files - Get files by hubId or userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!hubId && !userId) {
      return createApiResponse(false, null, 'Either hubId or userId is required');
    }

    let query = adminDb.collection('files').orderBy('uploadedAt', 'desc');

    if (hubId) {
      query = query.where('hubId', '==', hubId);
    } else if (userId) {
      query = query.where('uploadedBy', '==', userId);
    }

    const snapshot = await query.limit(limit).get();
    
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(true, files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return handleApiError(error);
  }
}

// DELETE /api/files - Delete a file (requires authentication)
export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return createApiResponse(false, null, 'File ID is required');
    }

    // Get file document
    const fileDoc = await adminDb.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return createApiResponse(false, null, 'File not found');
    }

    const fileData = fileDoc.data();

    // Check if user owns the file or the hub
    if (fileData?.uploadedBy !== auth.uid) {
      // Check if user owns the hub
      const hubDoc = await adminDb.collection('studyHubs').doc(fileData?.hubId).get();
      if (!hubDoc.exists || hubDoc.data()?.ownerId !== auth.uid) {
        return createApiResponse(false, null, 'Unauthorized');
      }
    }

    // Delete from Firestore
    await adminDb.collection('files').doc(fileId).delete();

    return createApiResponse(true, { message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return handleApiError(error);
  }
});