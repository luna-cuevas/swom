import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/utils/sanityClient';

export async function POST(req: NextRequest) {
  try {
    const { agreementId, status, userId } = await req.json();

    if (!agreementId || !status || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update agreement status in Sanity
    const sanityUpdate = await sanityClient
      .patch(agreementId)
      .set({ status })
      .commit();

    // Fetch the agreement details to get the conversation ID
    const agreement = await sanityClient.fetch(`
      *[_type == "swomAgreement" && _id == $agreementId][0]{
        conversationId,
        status
      }
    `, { agreementId });

    // Send a notification message
    const message = status === 'accepted' 
      ? 'Swom agreement accepted! 🎉'
      : 'Swom agreement rejected.';

    await fetch('/api/messages/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: agreement.conversationId,
        sender_id: userId,
        content: message,
      }),
    });

    return NextResponse.json({
      sanityUpdate
    });
  } catch (error) {
    console.error('Error updating agreement status:', error);
    return NextResponse.json(
      { error: 'Failed to update agreement status' },
      { status: 500 }
    );
  }
} 