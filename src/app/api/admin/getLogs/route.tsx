import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Fetch admin logs
    const { data: logs, error: logsError } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (logsError) {
      console.error("Error fetching admin logs:", logsError);
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    // Get unique admin IDs
    const adminIds = [...new Set(logs.map((log) => log.admin_id))];

    // Fetch admin emails
    const { data: users, error: usersError } = await supabase
      .from("appUsers")
      .select("id, email")
      .in("id", adminIds);

    if (usersError) {
      console.error("Error fetching admin users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Create a map of admin IDs to emails
    const adminEmailMap = new Map(users?.map((user) => [user.id, user.email]));

    // Transform the data to match the expected format
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      admin_id: log.admin_id,
      admin_email: adminEmailMap.get(log.admin_id) || "Unknown",
      action: log.action,
      details: log.details,
      created_at: log.created_at,
    }));

    return NextResponse.json(formattedLogs);
  } catch (error: any) {
    console.error("Error in getLogs route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
