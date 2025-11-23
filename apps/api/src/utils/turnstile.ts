import { logger } from "./logger";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  ip?: string
): Promise<boolean> {
  if (!token) {
    logger.error("Turnstile token is missing");
    return false;
  }

  if (!secretKey) {
    logger.error("Turnstile secret key is missing");
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json() as any;

    if (!data.success) {
      logger.error("Turnstile verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error verifying Turnstile token:", error);
    return false;
  }
}
