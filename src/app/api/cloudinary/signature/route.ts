import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function GET() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: 'workspace-share',
  }, process.env.CLOUDINARY_API_SECRET || '');
  
  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
