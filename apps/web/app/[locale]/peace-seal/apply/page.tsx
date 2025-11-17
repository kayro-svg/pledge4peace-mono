import ApplyPage from "@/components/peace-seal/peace-seal-apply/ApplyPage";
import { getUserOrganizationAndType } from "@/app/actions/user-actions";
import { logger } from "@/lib/utils/logger";

export default async function Page() {
  let userOrganizationAndType = null;

  try {
    userOrganizationAndType = await getUserOrganizationAndType();
  } catch (error) {
    // Si falla, continuamos sin los datos (el componente manejará el estado de autenticación)
    logger.warn("Failed to fetch user organization and type:", error);

    // Si es un error específico de autenticación, lo manejamos diferente
    if (error instanceof Error) {
      if (
        error.message.includes("LinkedIn login") ||
        error.message.includes("expired token")
      ) {
        logger.info(
          "Authentication issue - profile data not available from server action:",
          error.message
        );
      } else if (error.message.includes("Backend token expired")) {
        logger.info("Backend token expired - user needs to log in again");
      }
    }
  }

  return <ApplyPage initialUserData={userOrganizationAndType} />;
}
