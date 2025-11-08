import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth, parseRequestBody } from '@/lib/api-utils';

interface CreateHubRequest {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private';
  previewImage?: string;
}

interface HubData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ownerId: string;
  visibility: 'public' | 'private';
  previewImage: string;
  files: unknown[];
  stars: number;
  starredBy: string[];
  createdAt: string;
  updatedAt: string;
}

// GET /api/hubs - Get all public hubs or user's hubs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
      let query = adminDb.collection('studyHubs').orderBy('createdAt', 'desc');

      // Apply filters
      if (userId) {
        query = query.where('ownerId', '==', userId);
      } else {
        query = query.where('visibility', '==', 'public');
      }

      if (visibility) {
        query = query.where('visibility', '==', visibility);
      }

      const snapshot = await query.limit(limit).get();
    
      let hubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HubData[];

      // Client-side filtering for search and tags (for simplicity)
      if (search) {
        hubs = hubs.filter(hub => 
          hub.title.toLowerCase().includes(search.toLowerCase()) ||
          hub.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (tags) {
        const tagArray = tags.split(',');
        hubs = hubs.filter(hub => 
          tagArray.some(tag => hub.tags?.includes(tag.trim()))
        );
      }

      return createApiResponse(true, hubs);
    } catch (dbError) {
      console.log('Firebase permission error, returning mock data:', dbError);
      
      // Return mock data for development
      const mockHubs: HubData[] = [
        {
          id: '1',
          title: 'Data Structures & Algorithms',
          description: 'Complete notes and practice problems for DSA concepts',
          tags: ['Computer Science', 'Programming', 'Algorithms'],
          ownerId: 'user1',
          visibility: 'public',
          previewImage: '',
          files: [],
          stars: 42,
          starredBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'React Development Guide',
          description: 'Modern React patterns and best practices',
          tags: ['React', 'JavaScript', 'Frontend'],
          ownerId: 'user2',
          visibility: 'public',
          previewImage: '',
          files: [],
          stars: 38,
          starredBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Machine Learning Basics',
          description: 'Introduction to ML concepts and Python implementations',
          tags: ['Machine Learning', 'Python', 'AI'],
          ownerId: 'user3',
          visibility: 'public',
          previewImage: '',
          files: [],
          stars: 65,
          starredBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      return createApiResponse(true, mockHubs);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/hubs - Create new hub
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await parseRequestBody<CreateHubRequest>(request);
    if (!body) {
      return createApiResponse(false, null, 'Invalid request body');
    }

    const { title, description, tags, visibility, previewImage } = body;

    if (!title || !description) {
      return createApiResponse(false, null, 'Title and description are required');
    }

    const hubData = {
      title,
      description,
      tags: tags || [],
      ownerId: auth.uid,
      visibility: visibility || 'public',
      previewImage: previewImage || '',
      files: [],
      stars: 0,
      starredBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const hubRef = await adminDb.collection('studyHubs').add(hubData);
    
    return createApiResponse(true, { 
      id: hubRef.id, 
      ...hubData 
    }, undefined, 'Hub created successfully');
  } catch (error) {
    return handleApiError(error);
  }
});