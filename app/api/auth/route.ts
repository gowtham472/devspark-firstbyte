import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, parseRequestBody } from '@/lib/api-utils';

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  institution?: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody<SignUpRequest | SignInRequest>(request);
    if (!body) {
      return createApiResponse(false, null, 'Invalid request body');
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'signup':
        return handleSignUp(body as SignUpRequest);
      case 'signin':
        return handleSignIn(body as SignInRequest);
      default:
        return createApiResponse(false, null, 'Invalid action');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

async function handleSignUp(data: SignUpRequest) {
  const { email, password, name, institution } = data;

  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      email,
      name,
      institution: institution || '',
      bio: '',
      avatarURL: '',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    return createApiResponse(true, { uid: userRecord.uid }, undefined, 'User created successfully');
  } catch (error: unknown) {
    console.error('SignUp Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return createApiResponse(false, null, errorMessage);
  }
}

async function handleSignIn(data: SignInRequest) {
  const { email } = data;

  try {
    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // Get user profile
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    const userProfile = userDoc.data();

    return createApiResponse(true, { 
      uid: userRecord.uid,
      profile: userProfile 
    }, undefined, 'Sign in successful');
  } catch (error: unknown) {
    console.error('SignIn Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
    return createApiResponse(false, null, errorMessage);
  }
}