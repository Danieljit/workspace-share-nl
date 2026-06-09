import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireUser, apiErrorResponse } from '@/lib/session';

export const dynamic = 'force-dynamic';

const FOLDER = 'workspace-share';

export async function GET() {
  try {
    // Require a signed-in user: minting upload signatures must not be public,
    // otherwise anyone can upload arbitrary files to our Cloudinary account.
    await requireUser();

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // If Cloudinary isn't configured, tell the client so it can fall back
    // gracefully (e.g. to a local data-URL) instead of attempting an upload.
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured', configured: false },
        { status: 503 },
      );
    }

  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: FOLDER,
    },
    apiSecret,
  );

    return NextResponse.json({
      configured: true,
      signature,
      timestamp,
      folder: FOLDER,
      cloudName,
      apiKey, // publishable Cloudinary API key (not the secret) — required by the client for signed upload
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
