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

    // Send broadcast message about status change
    const channel = supabase.channel("message_status_room", {
      config: {
        broadcast: {
          self: true,
          ack: true
        },
      },
    });

    try {
      // Wait for subscription and broadcast
      await new Promise((resolve, reject) => {
        let broadcastSent = false;
        const timeout = setTimeout(() => {
          if (!broadcastSent) {
            reject(new Error("Broadcast timeout"));
          }
        }, 5000); // 5 second timeout

        channel
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              try {
                console.log("Sending mark-as-read broadcast");
                const result = await channel.send({
                  type: "broadcast",
                  event: "message_status",
                  payload: {
                    user_id: userId,
                    action: "mark_as_read",
                    messageIds,
                    conversation_id: conversationId
                  }
                });

                console.log("Broadcast result:", result);
                broadcastSent = true;
                clearTimeout(timeout);

                // Give a small delay before cleanup to ensure message is processed
                setTimeout(async () => {
                  await supabase.removeChannel(channel);
                  resolve(true);
                }, 1000);
              } catch (error) {
                clearTimeout(timeout);
                reject(error);
              }
            } else if (status === "CHANNEL_ERROR") {
              clearTimeout(timeout);
              reject(new Error("Failed to subscribe to channel"));
            }
          });
      });

      console.log("Mark-as-read broadcast completed successfully");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      // Clean up channel even if broadcast fails
      await supabase.removeChannel(channel);
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