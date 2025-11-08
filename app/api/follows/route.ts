import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface FollowRequest {
  targetUserId: string;
}

// POST /api/follows - Follow/Unfollow a user
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await parseRequestBody<FollowRequest>(request);
    if (!body || !body.targetUserId) {
      return createApiResponse(false, null, 'Target user ID required');
    }

    const { targetUserId } = body;

    if (targetUserId === auth.uid) {
      return createApiResponse(false, null, 'Cannot follow yourself');
    }

    // Check if target user exists
    const targetUserDoc = await adminDb.collection('users').doc(targetUserId).get();
    if (!targetUserDoc.exists) {
      return createApiResponse(false, null, 'User not found');
    }

    // Get current user data
    const currentUserDoc = await adminDb.collection('users').doc(auth.uid).get();
    const currentUserData = currentUserDoc.data();
    const following = currentUserData?.following || [];

    // Get target user data
    const targetUserData = targetUserDoc.data();
    const followers = targetUserData?.followers || [];

    const isFollowing = following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      const newFollowing = following.filter((id: string) => id !== targetUserId);
      const newFollowers = followers.filter((id: string) => id !== auth.uid);

      // Update both users
      await Promise.all([
        adminDb.collection('users').doc(auth.uid).update({
          following: newFollowing,
          updatedAt: new Date().toISOString(),
        }),
        adminDb.collection('users').doc(targetUserId).update({
          followers: newFollowers,
          updatedAt: new Date().toISOString(),
        }),
      ]);

      return createApiResponse(true, {
        isFollowing: false,
        followersCount: newFollowers.length,
      }, undefined, 'User unfollowed');
    } else {
      // Follow
      const newFollowing = [...following, targetUserId];
      const newFollowers = [...followers, auth.uid];

      // Update both users
      await Promise.all([
        adminDb.collection('users').doc(auth.uid).update({
          following: newFollowing,
          updatedAt: new Date().toISOString(),
        }),
        adminDb.collection('users').doc(targetUserId).update({
          followers: newFollowers,
          updatedAt: new Date().toISOString(),
        }),
      ]);

      return createApiResponse(true, {
        isFollowing: true,
        followersCount: newFollowers.length,
      }, undefined, 'User followed');
    }
  } catch (error) {
    return handleApiError(error);
  }
});

// GET /api/follows?userId=xxx&type=followers|following - Get followers or following
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId || !type) {
      return createApiResponse(false, null, 'User ID and type required');
    }

    if (type !== 'followers' && type !== 'following') {
      return createApiResponse(false, null, 'Type must be "followers" or "following"');
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return createApiResponse(false, null, 'User not found');
    }

    const userData = userDoc.data();
    const userIds = userData?.[type] || [];

    if (userIds.length === 0) {
      return createApiResponse(true, []);
    }

    // Get user profiles for the IDs
    const userPromises = userIds.map((id: string) => 
      adminDb.collection('users').doc(id).get()
    );

    const userDocs = await Promise.all(userPromises);
    const users = userDocs
      .filter(doc => doc.exists)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    return createApiResponse(true, users);
  } catch (error) {
    return handleApiError(error);
  }
}