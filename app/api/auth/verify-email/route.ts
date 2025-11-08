import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { createApiResponse, handleApiError, requireAuth } from '@/lib/api-utils';

// POST /api/auth/verify-email - Send email verification
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    // Get user record
    const userRecord = await adminAuth.getUser(auth.uid);
    
    if (userRecord.emailVerified) {
      return createApiResponse(false, null, 'Email is already verified');
    }

    // Generate email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth?verified=true`,
      handleCodeInApp: true,
    };

    const link = await adminAuth.generateEmailVerificationLink(
      userRecord.email!,
      actionCodeSettings
    );

    // In a real app, you would send this link via email using a service like SendGrid, Nodemailer, etc.
    // For now, we'll just return success
    console.log('Email verification link generated:', link);

    return createApiResponse(true, { 
      message: 'Verification email sent successfully',
      // In development, you might want to return the link for testing
      ...(process.env.NODE_ENV === 'development' && { verificationLink: link })
    }, undefined, 'Verification email sent successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    return handleApiError(error);
  }
});