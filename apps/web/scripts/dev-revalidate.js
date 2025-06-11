#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE REVALIDACIÓN PARA DESARROLLO
 * 
 * Permite forzar revalidación manual durante el desarrollo
 * cuando los cambios de Sanity no se ven inmediatamente.
 * 
 * Uso:
 * npm run dev:revalidate              # Revalidar todo
 * npm run dev:revalidate conference   # Revalidar solo conferences
 * npm run dev:revalidate /events      # Revalidar path específico
 */

async function revalidate(type = null, path = null) {
    const baseUrl = 'http://localhost:3000';

    let url = `${baseUrl}/api/revalidate`;
    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (path) params.append('path', path);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    console.log('🔄 Enviando revalidación manual...');
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
            console.log('✅ Revalidación exitosa:');
            console.log(`   Tags: ${result.revalidated.tags.join(', ') || 'ninguno'}`);
            console.log(`   Paths: ${result.revalidated.paths.join(', ') || 'ninguno'}`);
            console.log('🎉 Los cambios deberían verse ahora en el navegador');
        } else {
            console.error('❌ Error en revalidación:', result.message);
        }
    } catch (error) {
        console.error('💥 Error de conexión:', error.message);
        console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    }
}

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const [typeOrPath] = args;

if (typeOrPath) {
    // Determinar si es un tipo o un path
    if (typeOrPath.startsWith('/')) {
        revalidate(null, typeOrPath);
    } else {
        revalidate(typeOrPath, null);
    }
} else {
    revalidate();
} 