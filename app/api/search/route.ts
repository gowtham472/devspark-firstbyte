import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

interface SearchResult {
  hubs: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
}

// GET /api/search - Search hubs and users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // hubs, users, or all
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return createApiResponse(false, null, 'Search query required');
    }

    const results: SearchResult = {
      hubs: [],
      users: [],
    };

    // Search hubs
    if (type === 'all' || type === 'hubs') {
      const hubsSnapshot = await adminDb
        .collection('studyHubs')
        .where('visibility', '==', 'public')
        .limit(limit)
        .get();

      const hubs = hubsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((hub: Record<string, unknown>) => {
          const searchTerm = query.toLowerCase();
          const title = hub.title as string || '';
          const description = hub.description as string || '';
          const tags = hub.tags as string[] || [];
          return (
            title.toLowerCase().includes(searchTerm) ||
            description.toLowerCase().includes(searchTerm) ||
            tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
          );
        })
        .slice(0, limit);

      results.hubs = hubs;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const usersSnapshot = await adminDb
        .collection('users')
        .limit(limit * 2) // Get more to filter
        .get();

      const users = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((user: Record<string, unknown>) => {
          const searchTerm = query.toLowerCase();
          const name = user.name as string || '';
          const institution = user.institution as string || '';
          const bio = user.bio as string || '';
          return (
            name.toLowerCase().includes(searchTerm) ||
            institution.toLowerCase().includes(searchTerm) ||
            bio.toLowerCase().includes(searchTerm)
          );
        })
        .slice(0, limit);

      results.users = users;
    }

    return createApiResponse(true, results);
  } catch (error) {
    return handleApiError(error);
  }
}