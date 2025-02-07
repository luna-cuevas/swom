import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface MemberLog {
  id: string;
  user_id: string;
  appUsers: {
    email: string;
  }[];
  action: string;
  details: any;
  created_at: string;
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Fetch member logs
    const { data: logs, error } = await supabase
      .from("member_logs")
      .select(
        `
        id,
        user_id,
        action,
        details,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching member logs:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // For message logs with attachments, fetch the attachment details
    const messageLogs = logs?.filter(
      (log) => log.action === "send_message" && log.details?.has_attachments
    );
    if (messageLogs?.length > 0) {
      for (const log of messageLogs) {
        if (log.details?.message_id) {
          const { data: attachments } = await supabase
            .from("message_attachments")
            .select("*")
            .eq("message_id", log.details.message_id);

          if (attachments && attachments.length > 0) {
            log.details.attachments = attachments;
          }
        }
      }
    }

    // Log the raw data for debugging
    console.log(
      "Raw member logs:",
      JSON.stringify(
        logs?.filter((log) => log.action === "send_message"),
        null,
        2
      )
    );

    // Fetch user emails
    const { data: users, error: usersError } = await supabase
      .from("appUsers")
      .select("id, email")
      .in(
        "id",
        logs.map((log) => log.user_id)
      );

    if (usersError) {
      console.error("Error fetching user emails:", usersError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Transform the data to match the expected format
    const formattedLogs = (logs as MemberLog[]).map((log) => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      details: log.details,
      created_at: log.created_at,
      user_email: users.find((user) => user.id === log.user_id)?.email,
    }));

    // Log the formatted data for debugging
    console.log(
      "Formatted member logs:",
      JSON.stringify(
        formattedLogs?.filter((log) => log.action === "send_message"),
        null,
        2
      )
    );

    // Return with no-cache headers
    return new NextResponse(JSON.stringify(formattedLogs), {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in getMemberLogs route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
