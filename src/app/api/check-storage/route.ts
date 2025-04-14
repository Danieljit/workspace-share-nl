import { NextResponse } from 'next/server';

export async function GET() {
  // This is a server-side API route to check localStorage contents
  // Note: localStorage is client-side only, so we can't directly access it here
  // This is just a placeholder to let the client know to check localStorage
  
  return NextResponse.json({ message: 'Check localStorage on client side' });
}
