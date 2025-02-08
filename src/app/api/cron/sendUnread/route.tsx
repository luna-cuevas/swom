import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabaseClient";

const supabase = getSupabaseAdmin();

type User = {
  id: string;
  email: string;
};

type SendEmailResult = {
  userId: string;
  email: string;
  success: boolean;
  error?: string;
};

async function sendBrevoTemplate(
  email: string,
  templateId: number,
  params?: Record<string, unknown>
) {
  const response = await fetch(
    `${process.env.BASE_URL}/api/admin/sendBrevoTemplate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, templateId, params }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send Brevo template: ${await response.text()}`);
  }

  return await response.json();
}

async function processUser(user: User): Promise<SendEmailResult> {
  try {
    // Send email notification
    await sendBrevoTemplate(user.email, 5);
    console.log(`✅ Sent unread messages notification to ${user.email}`);

    // Update notification status
    const { error: updateError } = await supabase
      .from("read_receipts")
      .update({ notified: true })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(
        `Failed to update notification status: ${updateError.message}`
      );
    }

    return {
      userId: user.id,
      email: user.email,
      success: true,
    };
  } catch (error) {
    console.error(`❌ Error processing user ${user.email}:`, error);
    return {
      userId: user.id,
      email: user.email,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Fetch users with unread messages
    const { data: receipts, error: receiptsError } = await supabase
      .from("read_receipts")
      .select("user_id")
      .eq("notified", false);

    if (receiptsError) {
      throw new Error(
        `Error fetching unread messages: ${receiptsError.message}`
      );
    }

    if (!receipts?.length) {
      return NextResponse.json({ message: "No unread messages to process" });
    }

    // Get unique user IDs
    const userIds = [...new Set(receipts.map((receipt) => receipt.user_id))];
    console.log(`📨 Processing ${userIds.length} users with unread messages`);

    // Fetch all user emails in one query
    const { data: users, error: usersError } = await supabase
      .from("appUsers")
      .select("id, email")
      .in("id", userIds);

    if (usersError) {
      throw new Error(`Error fetching user emails: ${usersError.message}`);
    }

    // Process users in parallel with rate limiting (5 at a time)
    const results: SendEmailResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processUser));
      results.push(...batchResults);

      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Compile statistics
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: "Email notification process completed",
      statistics: {
        total: results.length,
        successful,
        failed,
      },
      results,
    });
  } catch (error: unknown) {
    console.error("❌ Unhandled error in main handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
