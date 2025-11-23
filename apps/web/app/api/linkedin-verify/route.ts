import { NextRequest, NextResponse } from "next/server";

/**
 * LinkedIn OAuth verification endpoint
 * This is a standalone OAuth flow that doesn't interfere with NextAuth sessions
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("LinkedIn OAuth error:", error);
    const redirectUrl = new URL(
      "/peace-seal/community-review",
      request.nextUrl.origin
    );
    redirectUrl.searchParams.set("linkedin_error", error);
    return NextResponse.redirect(redirectUrl);
  }

  // Validate state to prevent CSRF
  const storedState = request.cookies.get("linkedin_oauth_state")?.value || "";
  if (!state || state !== storedState) {
    console.error("State mismatch in LinkedIn OAuth");
    const redirectUrl = new URL(
      "/peace-seal/community-review",
      request.nextUrl.origin
    );
    redirectUrl.searchParams.set("linkedin_error", "state_mismatch");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL(
      "/peace-seal/community-review",
      request.nextUrl.origin
    );
    redirectUrl.searchParams.set("linkedin_error", "no_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: `${request.nextUrl.origin}/api/linkedin-verify`,
          client_id: process.env.LINKEDIN_CLIENT_ID || "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    // Get user info
    const userInfoResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await userInfoResponse.json();

    // Get the callback URL from cookies
    const callbackUrl =
      request.cookies.get("linkedin_callback_url")?.value ||
      "/peace-seal/community-review";

    // Redirect back with tokens and email as URL parameters (temporary, will be handled client-side)
    const redirectUrl = new URL(callbackUrl, request.nextUrl.origin);
    redirectUrl.searchParams.set("linkedin_verified", "true");
    redirectUrl.searchParams.set("linkedin_email", userInfo.email || "");
    redirectUrl.searchParams.set("linkedin_sub", userInfo.sub || "");
    // Store tokens in URL hash (not sent to server)
    redirectUrl.hash = `idToken=${encodeURIComponent(idToken || "")}&accessToken=${encodeURIComponent(accessToken)}`;

    const response = NextResponse.redirect(redirectUrl);

    // Clear cookies
    response.cookies.delete("linkedin_oauth_state");
    response.cookies.delete("linkedin_callback_url");

    return response;
  } catch (error) {
    console.error("LinkedIn verification error:", error);
    const redirectUrl = new URL(
      "/peace-seal/community-review",
      request.nextUrl.origin
    );
    redirectUrl.searchParams.set("linkedin_error", "verification_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
