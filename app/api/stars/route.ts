import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface StarRequest {
  hubId: string;
}

// POST /api/stars - Star/Unstar a hub
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await parseRequestBody<StarRequest>(request);
    if (!body || !body.hubId) {
      return createApiResponse(false, null, 'Hub ID required');
    }

    const { hubId } = body;

    // Check if hub exists
    const hubDoc = await adminDb.collection('studyHubs').doc(hubId).get();
    if (!hubDoc.exists) {
      return createApiResponse(false, null, 'Hub not found');
    }

    const hubData = hubDoc.data();
    const starredBy = hubData?.starredBy || [];
    const isStarred = starredBy.includes(auth.uid);

    let newStarredBy: string[];
    let newStars: number;

    if (isStarred) {
      // Unstar
      newStarredBy = starredBy.filter((id: string) => id !== auth.uid);
      newStars = Math.max(0, (hubData?.stars || 0) - 1);
    } else {
      // Star
      newStarredBy = [...starredBy, auth.uid];
      newStars = (hubData?.stars || 0) + 1;
    }

    await adminDb.collection('studyHubs').doc(hubId).update({
      starredBy: newStarredBy,
      stars: newStars,
      updatedAt: new Date().toISOString(),
    });

    return createApiResponse(true, {
      hubId,
      isStarred: !isStarred,
      stars: newStars,
    }, undefined, isStarred ? 'Hub unstarred' : 'Hub starred');
  } catch (error) {
    return handleApiError(error);
  }
});

// GET /api/stars - Get user's starred hubs
export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const snapshot = await adminDb
      .collection('studyHubs')
      .where('starredBy', 'array-contains', auth.uid)
      .orderBy('updatedAt', 'desc')
      .get();

    const starredHubs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(true, starredHubs);
  } catch (error) {
    return handleApiError(error);
  }
});