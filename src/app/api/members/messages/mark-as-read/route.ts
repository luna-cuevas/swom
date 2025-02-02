import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    const { conversationId, messageIds, userId } = await request.json();


    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete message status entries for read messages
    const { error: deleteError } = await supabase
      .from('message_status')
      .delete()
      .eq('user_id', userId)
      .in('message_id', messageIds);

    if (deleteError) {
      console.error('Error deleting message status:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete message status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-as-read route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 