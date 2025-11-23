import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Start LinkedIn OAuth flow for verification only
 * This endpoint generates the OAuth URL and redirects the user
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl =
    searchParams.get("callbackUrl") || "/peace-seal/community-review";

  // Generate state for CSRF protection
  const state = randomBytes(32).toString("hex");

  // Build LinkedIn OAuth URL
  const linkedinAuthUrl = new URL(
    "https://www.linkedin.com/oauth/v2/authorization"
  );
  linkedinAuthUrl.searchParams.set("response_type", "code");
  linkedinAuthUrl.searchParams.set(
    "client_id",
    process.env.LINKEDIN_CLIENT_ID || ""
  );
  linkedinAuthUrl.searchParams.set(
    "redirect_uri",
    `${request.nextUrl.origin}/api/linkedin-verify`
  );
  linkedinAuthUrl.searchParams.set("scope", "openid profile email");
  linkedinAuthUrl.searchParams.set("state", state);

  // Create response with redirect
  const response = NextResponse.redirect(linkedinAuthUrl.toString());

  // Store state and callback URL in cookies for validation
  response.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("linkedin_callback_url", callbackUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
