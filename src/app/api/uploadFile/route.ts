import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/utils/sanityClient';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to Sanity
    const fileBuffer = await file.arrayBuffer();
    const fileAsset = await sanityClient.assets.upload('file', Buffer.from(fileBuffer), {
      filename: file.name,
      contentType: file.type
    });

    return NextResponse.json({ fileId: fileAsset._id });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 