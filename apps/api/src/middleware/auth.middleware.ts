import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
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
    const payload = (await verify(token, c.env.JWT_SECRET)) as AuthUser;

    if (!payload || !payload.id) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    // Guardar la información del usuario en el contexto
    c.set("user", payload);

    await next();
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(401, { message: "Authentication failed" });
  }
}

// Middleware para rutas públicas que solo necesitan el usuario si está disponible
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = (await verify(token, c.env.JWT_SECRET)) as AuthUser;

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

// Helper para obtener el usuario autenticado del contexto
export function getAuthUser(c: Context): AuthUser {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "User not authenticated" });
  }
  return user;
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
