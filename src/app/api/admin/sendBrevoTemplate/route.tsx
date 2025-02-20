import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, templateId, params } = body;

  if (!email || !templateId) {
    console.error("Missing required fields:", { email, templateId });
    return NextResponse.json(
      { error: "Email and templateId are required" },
      { status: 400 }
    );
  }

  const url = "https://api.brevo.com/v3/smtp/email";

  // Prepare request body
  const requestBody = {
    sender: { email: "info@swom.travel" }, // Explicitly set sender
    to: [{ email }],
    templateId: parseInt(templateId),
    params: params || { placeholder: "" }, // Always present, but empty if undefined
  };

  // Convert request body to string
  const requestBodyString = JSON.stringify(requestBody);
  const contentLength = Buffer.byteLength(requestBodyString, "utf-8"); // Calculate content length

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "api-key": process.env.BREVO_API_KEY as string,
    "content-length": contentLength.toString(), // Explicitly set content-length
  };

  console.log("Sending email with:", { email, templateId, params, contentLength });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: requestBodyString, // Use precomputed string
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error from Brevo API:", {
        status: response.status,
        data,
        requestBody,
      });
      return NextResponse.json(
        { error: "Failed to send template email", details: data },
        { status: response.status }
      );
    }

    console.log("Successfully sent email:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error in sendBrevoEmail:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
