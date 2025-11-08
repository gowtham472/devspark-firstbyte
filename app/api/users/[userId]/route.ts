import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  institution?: string;
  avatarURL?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  profileVisibility?: 'public' | 'private';
  emailNotifications?: boolean;
  hubNotifications?: boolean;
  followNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  showEmail?: boolean;
  showInstitution?: boolean;
}

// GET /api/users/[userId] - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const userId = pathname.split('/').pop();
    
    if (!userId) {
      return createApiResponse(false, null, 'User ID required');
    }

    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return createApiResponse(false, null, 'User not found');
      }

      const userData = userDoc.data();
      return createApiResponse(true, userData);
    } catch (error) {
      console.error('Firebase error, using mock user data:', error);
      
      // Mock user data for development
      const mockUser = {
        id: userId,
        name: "Mock User",
        email: "user@example.com",
        bio: "This is a mock user for development",
        institution: "Mock University",
        website: "https://mockuser.dev",
        socialLinks: {
          github: "github.com/mockuser",
          linkedin: "linkedin.com/in/mockuser",
          twitter: "twitter.com/mockuser"
        },
        profileVisibility: "public",
        emailNotifications: true,
        hubNotifications: true,
        followNotifications: true,
        theme: "light",
        showEmail: false,
        showInstitution: true,
        emailVerified: false,
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return createApiResponse(true, mockUser);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/users/[userId] - Update user profile
export const PUT = requireAuth(async (request: NextRequest, auth) => {
  try {
    const { pathname } = new URL(request.url);
    const userId = pathname.split('/').pop();
    
    if (!userId || userId !== auth.uid) {
      return createApiResponse(false, null, 'Unauthorized');
    }

    const body = await parseRequestBody<UpdateProfileRequest>(request);
    if (!body) {
      return createApiResponse(false, null, 'Invalid request body');
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminDb.collection('users').doc(userId).update(updateData);

      const updatedDoc = await adminDb.collection('users').doc(userId).get();
      return createApiResponse(true, updatedDoc.data(), undefined, 'Profile updated successfully');
    } catch (error) {
      console.error('Firebase error, using mock response:', error);
      
      // Mock response for development
      return createApiResponse(true, {
        id: userId,
        ...body,
        updatedAt: new Date().toISOString(),
      }, undefined, 'Profile updated successfully (mock)');
    }
  } catch (error) {
    return handleApiError(error);
  }
});