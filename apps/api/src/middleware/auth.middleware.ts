import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { AuthService } from "../services/auth.service";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "user" | "superAdmin";
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
    authService: AuthService;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verificar el token JWT
    const payload = (await verify(
      token,
      c.env.JWT_SECRET
    )) as unknown as AuthUser;

    if (!payload || !payload.id) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    // Guardar la información del usuario en el contexto
    c.set("user", payload);

    // Asegurarse de que el servicio de autenticación esté disponible
    if (!c.get("authService")) {
      throw new HTTPException(500, { message: "Auth service not available" });
    }

    await next();
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    // Check if it's a token expiration error
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = String(error.message).toLowerCase();
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("jwt expired")
      ) {
        throw new HTTPException(401, { message: "Token expired" });
      }
    }

    throw new HTTPException(401, { message: "Authentication failed" });
  }
}

// Middleware para rutas públicas que solo necesitan el usuario si está disponible
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = (await verify(
        token,
        c.env.JWT_SECRET
      )) as unknown as AuthUser;

      if (payload && payload.id) {
        c.set("user", payload);
      }
    }

    await next();
  } catch (error) {
    // Si hay un error con el token, simplemente continuamos sin usuario
    await next();
  }
}

/**
 * Middleware específico para verificar permisos de SuperAdmin
 * Solo permite acceso a usuarios con role = 'superAdmin'
 */
export async function superAdminMiddleware(c: Context, next: Next) {
  // Primero verificar autenticación estándar
  await authMiddleware(c, async () => {
    const user = getAuthUser(c);

    // Verificar que el usuario tiene rol de superAdmin
    if (user.role !== "superAdmin") {
      throw new HTTPException(403, {
        message: "Access denied. SuperAdmin privileges required.",
      });
    }

    await next();
  });
}

// Helper para obtener el usuario autenticado del contexto
export function getAuthUser(c: Context): AuthUser {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "User not authenticated" });
  }
  return user;
}

/**
 * Helper para verificar si el usuario actual es superAdmin
 */
export function isSuperAdmin(c: Context): boolean {
  try {
    const user = getAuthUser(c);
    return user.role === "superAdmin";
  } catch {
    return false;
  }
}

/**
 * Helper para verificar si el usuario puede eliminar un recurso
 * Permite al propietario Y al superAdmin eliminar
 */
export function canDeleteResource(c: Context, resourceUserId: string): boolean {
  const user = getAuthUser(c);
  return user.id === resourceUserId || user.role === "superAdmin";
}

// Middleware para verificar la propiedad de un recurso
export function checkResourceOwnership(resourceUserId: string, c: Context) {
  const user = getAuthUser(c);
  if (user.id !== resourceUserId) {
    throw new HTTPException(403, {
      message: "Not authorized to modify this resource",
    });
  }
}
