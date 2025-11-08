import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth } from '@/lib/api-utils';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload file to Cloudinary and store metadata
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const hubId = formData.get('hubId') as string;
    const fileName = formData.get('fileName') as string;

    if (!file || !hubId) {
      return createApiResponse(false, null, 'File and Hub ID required');
    }

    // Check if user owns the hub
    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = hubDoc.data();
    if (hubData?.ownerId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Automatically detect file type
          folder: `bytehub/hubs/${hubId}`,
          public_id: fileName || file.name,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const result = uploadResult as { secure_url: string; public_id: string };

    // Store file metadata in Firestore
    const fileData = {
      hubId,
      fileName: fileName || file.name,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileURL: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploaderId: auth.uid,
      uploadedAt: new Date().toISOString(),
    };

    const fileRef = await adminDb.collection('files').add(fileData);

    // Update hub with file reference
    const hubFiles = hubData?.files || [];
    await adminDb.collection('studyHubs').doc(hubId).update({
      files: [...hubFiles, fileRef.id],
      updatedAt: new Date().toISOString(),
    });

    return createApiResponse(true, {
      id: fileRef.id,
      ...fileData,
    }, undefined, 'File uploaded successfully');
  } catch (error) {
    return handleApiError(error);
  }
});

// GET /api/upload?hubId=xxx - Get files for a hub
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId');

    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const snapshot = await adminDb
      .collection('files')
      .where('hubId', '==', hubId)
      .orderBy('uploadedAt', 'desc')
      .get();

    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(true, files);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/upload - Delete file
export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return createApiResponse(false, null, 'File ID required');
    }

    const fileDoc = await adminDb.collection('files').doc(fileId).get();
    if (!fileDoc.exists) {
      return createApiResponse(false, null, 'File not found');
    }

    const fileData = fileDoc.data();
    
    // Check if user owns the file or the hub
    const hubDoc = await adminDb.collection('studyHubs').doc(fileData?.hubId).get();
    const hubData = hubDoc.data();

    if (fileData?.uploaderId !== auth.uid && hubData?.ownerId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    // Delete from Cloudinary
    if (fileData?.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(fileData.cloudinaryPublicId);
    }

    // Remove from hub files array
    if (hubData?.files) {
      const updatedFiles = hubData.files.filter((id: string) => id !== fileId);
      await adminDb.collection('studyHubs').doc(fileData?.hubId).update({
        files: updatedFiles,
        updatedAt: new Date().toISOString(),
      });
    }

    // Delete file document
    await adminDb.collection('files').doc(fileId).delete();

    return createApiResponse(true, null, undefined, 'File deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});