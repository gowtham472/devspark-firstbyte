import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface CreateCommentRequest {
  hubId: string;
  text: string;
}

// POST /api/comments - Create comment
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await parseRequestBody<CreateCommentRequest>(request);
    if (!body || !body.hubId || !body.text) {
      return createApiResponse(false, null, 'Hub ID and comment text required');
    }

    const { hubId, text } = body;

    // Check if hub exists
    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    // Get user info
    const userDoc = await adminDb.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();

    const commentData = {
      hubId,
      userId: auth.uid,
      userName: userData?.name || 'Anonymous',
      userAvatar: userData?.avatarURL || '',
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const commentRef = await adminDb.collection('comments').add(commentData);

    return createApiResponse(true, {
      id: commentRef.id,
      ...commentData
    }, undefined, 'Comment created successfully');
  } catch (error) {
    return handleApiError(error);
  }
});

// GET /api/comments?hubId=xxx - Get comments for a hub
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId');

    if (!hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const snapshot = await adminDb
      .collection('comments')
      .where('hubId', '==', hubId)
      .orderBy('createdAt', 'desc')
      .get();

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(true, comments);
  } catch (error) {
    return handleApiError(error);
  }
}