import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, templateId, params } = body;

    if (!email || !templateId) {
      console.error("Missing required fields:", { email, templateId });
      return NextResponse.json(
        { error: "Email and templateId are required" },
        { status: 400 }
      );
    }

    const url = "https://api.brevo.com/v3/smtp/email";
    const requestBody = {
      sender: { email: "info@swom.travel" },
      to: [{ email }],
      templateId: parseInt(templateId),
      params: params || {},
    };

    console.log("Sending request to Brevo:", JSON.stringify(requestBody));

    // Create headers without content-length
    const headers = new Headers({
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    let responseData;
    try {
      const responseText = await response.text();
      console.log("Brevo API raw response:", responseText);
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error("Failed to parse Brevo response:", e);
      return NextResponse.json(
        { error: "Invalid response from Brevo API" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Error from Brevo API:", {
        status: response.status,
        data: responseData,
      });
      return NextResponse.json(
        { error: "Failed to send template email", details: responseData },
        { status: response.status }
      );
    }

    console.log("Successfully sent email:", responseData);
    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("Error in sendBrevoEmail:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
