-- Migration: Add role field to users table for SuperAdmin functionality
-- Migration number: 0002 2025-01-25T00:00:00.000Z

-- Agregar campo role a la tabla users
-- Por defecto todos los usuarios existentes serán 'user'
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'superAdmin'));

-- Crear índice para el campo role para mejor performance en queries de permisos
CREATE INDEX idx_users_role ON users(role);

-- Comentarios para documentar la funcionalidad:
-- role = 'user': Usuario normal con permisos estándar
-- role = 'superAdmin': Administrador con permisos para eliminar cualquier solution/comment 