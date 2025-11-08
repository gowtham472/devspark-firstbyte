import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

interface ActivityItem {
  id: string;
  type: 'hub_created' | 'hub_updated' | 'file_uploaded' | 'file_deleted' | 'file_updated';
  message: string;
  userId: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// GET /api/hubs/[hubId]/history - Get hub activity history
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const hubId = pathname.split('/')[3]; // /api/hubs/[hubId]/history
    
    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    // Check if hub exists
    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = hubDoc.data();

    // Get activity from the hub's activity subcollection
    const activitySnapshot = await adminDb
      .collection('studyHubs')
      .doc(hubId)
      .collection('activity')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    let activities: ActivityItem[] = activitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityItem));

    // If no activity records exist, create some based on hub and files data
    if (activities.length === 0) {
      const mockActivities: ActivityItem[] = [];

      // Add hub creation activity
      mockActivities.push({
        id: 'hub_created',
        type: 'hub_created',
        message: 'Hub created',
        userId: hubData?.ownerId || 'unknown',
        userName: hubData?.ownerName || 'Owner',
        timestamp: hubData?.createdAt || new Date().toISOString(),
        metadata: {
          hubTitle: hubData?.title
        }
      });

      // Add hub update activity if it was updated
      if (hubData?.updatedAt && hubData.updatedAt !== hubData.createdAt) {
        mockActivities.push({
          id: 'hub_updated',
          type: 'hub_updated',
          message: 'Hub details updated',
          userId: hubData.ownerId || 'unknown',
          userName: hubData?.ownerName || 'Owner',
          timestamp: hubData.updatedAt,
          metadata: {
            hubTitle: hubData.title
          }
        });
      }

      // Get recent files for activity
      const filesSnapshot = await adminDb
        .collection('files')
        .where('hubId', '==', hubId)
        .orderBy('uploadedAt', 'desc')
        .limit(10)
        .get();

      filesSnapshot.docs.forEach(fileDoc => {
        const fileData = fileDoc.data();
        mockActivities.push({
          id: `file_${fileDoc.id}`,
          type: 'file_uploaded',
          message: `Uploaded ${fileData.fileName}`,
          userId: fileData.uploadedBy || 'unknown',
          userName: fileData.uploaderName || 'User',
          timestamp: fileData.uploadedAt || new Date().toISOString(),
          metadata: {
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType
          }
        });
      });

      // Sort by timestamp
      activities = mockActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    return createApiResponse(true, activities);
  } catch (error) {
    console.error('Error fetching hub history:', error);
    return handleApiError(error);
  }
}