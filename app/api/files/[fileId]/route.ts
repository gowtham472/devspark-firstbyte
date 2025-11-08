import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth } from '@/lib/api-utils';

// GET /api/files/[fileId] - Get file details and version history
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const fileId = pathname.split('/').pop();
    
    if (!fileId) {
      return createApiResponse(false, null, 'File ID required');
    }

    // Get file document
    const fileDoc = await adminDb.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return createApiResponse(false, null, 'File not found');
    }

    const fileData = {
      id: fileDoc.id,
      ...fileDoc.data()
    };

    // Get version history
    const versionsSnapshot = await adminDb
      .collection('files')
      .doc(fileId)
      .collection('versions')
      .orderBy('version', 'desc')
      .get();

    const versions = versionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(true, {
      ...fileData,
      versions
    });
  } catch (error) {
    console.error('Error fetching file details:', error);
    return handleApiError(error);
  }
}

// DELETE /api/files/[fileId] - Delete a specific file
export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { pathname } = new URL(request.url);
    const fileId = pathname.split('/').pop();

    if (!fileId) {
      return createApiResponse(false, null, 'File ID required');
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

    // Delete all versions first
    const versionsSnapshot = await adminDb
      .collection('files')
      .doc(fileId)
      .collection('versions')
      .get();

    const batch = adminDb.batch();
    versionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the main file document
    batch.delete(adminDb.collection('files').doc(fileId));
    
    await batch.commit();

    return createApiResponse(true, { message: 'File and all versions deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return handleApiError(error);
  }
});