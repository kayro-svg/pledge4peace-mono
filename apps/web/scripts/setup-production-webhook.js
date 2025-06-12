#!/usr/bin/env node

/**
 * 🚀 SCRIPT PARA CONFIGURAR WEBHOOK EN PRODUCCIÓN
 * 
 * Este script configura el webhook de Sanity para apuntar a tu sitio de producción
 * en lugar del ngrok de desarrollo.
 * 
 * Uso:
 * 1. Cambia PRODUCTION_URL por tu dominio real
 * 2. node scripts/setup-production-webhook.js
 * 
 * Variables de entorno necesarias:
 * - SANITY_REVALIDATE_SECRET
 * - NEXT_PUBLIC_SANITY_PROJECT_ID  
 * - NEXT_PUBLIC_SANITY_DATASET
 * - SANITY_API_TOKEN (con permisos de admin)
 */

import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// ⚠️ CAMBIA ESTA URL POR TU DOMINIO DE PRODUCCIÓN
const PRODUCTION_URL = 'https://tu-dominio-produccion.com'; // 📝 ACTUALIZAR AQUÍ

// Configuración
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f5zk7i1f';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;
const API_TOKEN = process.env.SANITY_API_TOKEN;

// Cliente administrativo
const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2023-05-03',
    token: API_TOKEN,
    useCdn: false,
});

async function setupProductionWebhook() {
    console.log('🚀 Configurando webhook para PRODUCCIÓN...\n');

    // Verificar que se haya actualizado la URL
    if (PRODUCTION_URL === 'https://tu-dominio-produccion.com') {
        console.error('❌ Error: Debes actualizar PRODUCTION_URL en el script');
        console.log('💡 Cambia la línea 25 por tu dominio real de producción');
        console.log('   Ejemplo: https://pledge4peace.vercel.app');
        process.exit(1);
    }

    // Verificar variables de entorno
    if (!REVALIDATE_SECRET) {
        console.error('❌ Error: SANITY_REVALIDATE_SECRET no está configurado');
        process.exit(1);
    }

    if (!API_TOKEN) {
        console.error('❌ Error: SANITY_API_TOKEN no está configurado');
        console.log('💡 Obtén un token en: https://manage.sanity.io/');
        process.exit(1);
    }

    const webhookConfig = {
        name: 'Next.js Revalidation - Pledge4Peace (PRODUCTION)',
        url: `${PRODUCTION_URL}/api/revalidate?secret=${REVALIDATE_SECRET}`,
        dataset: DATASET,
        trigger: {
            types: ['homePage', 'campaign', 'article', 'conference', 'aboutPage', 'volunteerPage'],
            includeDrafts: false,
        },
        httpMethod: 'POST',
        apiVersion: '2023-05-03',
    };

    try {
        console.log(`🌐 URL de producción: ${PRODUCTION_URL}`);
        console.log(`📡 URL completa del webhook: ${webhookConfig.url}`);
        console.log(`📋 Tipos de documento: ${webhookConfig.trigger.types.join(', ')}`);
        console.log(`🗂️  Dataset: ${DATASET}`);
        console.log(`🆔 Project ID: ${PROJECT_ID}\n`);

        // Listar webhooks existentes
        console.log('📋 Verificando webhooks existentes...');
        const existingWebhooks = await client.request({
            url: '/hooks',
            method: 'GET',
        });

        if (existingWebhooks.length > 0) {
            console.log('Webhooks existentes encontrados:');
            existingWebhooks.forEach((webhook, index) => {
                const isProduction = webhook.url.includes(PRODUCTION_URL);
                const isDevelopment = webhook.url.includes('ngrok');
                const status = isProduction ? '🟢 PRODUCCIÓN' :
                    isDevelopment ? '🟡 DESARROLLO' : '⚪ OTRO';

                console.log(`  ${index + 1}. ${webhook.name} - ${status}`);
                console.log(`     ${webhook.url}`);
            });
            console.log('');
        } else {
            console.log('No se encontraron webhooks existentes.\n');
        }

        // Crear el webhook de producción
        console.log('⚡ Creando webhook de PRODUCCIÓN...');
        const newWebhook = await client.request({
            url: '/hooks',
            method: 'POST',
            body: webhookConfig,
        });

        console.log('✅ ¡Webhook de PRODUCCIÓN creado exitosamente!');
        console.log(`🆔 ID del webhook: ${newWebhook.id}`);
        console.log(`📛 Nombre: ${newWebhook.name}`);
        console.log(`🔗 URL: ${newWebhook.url}\n`);

        console.log('🎉 ¡Configuración de PRODUCCIÓN completada!');
        console.log('⚡ Los cambios en Sanity ahora se verán en PRODUCCIÓN en 2-10 segundos.');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Despliega tu sitio a producción con los cambios');
        console.log('2. Haz un cambio en Sanity Studio');
        console.log('3. Verifica que se actualice en tu sitio de producción');
        console.log('4. (Opcional) Elimina webhooks de desarrollo antiguos');

    } catch (error) {
        console.error('❌ Error creando webhook de producción:', error);

        if (error.statusCode === 401) {
            console.log('\n💡 Consejos para resolver el error:');
            console.log('- Verifica que SANITY_API_TOKEN tenga permisos de administrador');
            console.log('- Obtén un nuevo token en: https://manage.sanity.io/');
        } else if (error.statusCode === 409) {
            console.log('\n💡 Un webhook con esta configuración ya existe.');
            console.log('Esto puede ser normal si ya configuraste producción antes.');
        }

        process.exit(1);
    }
}

async function testProductionRevalidation() {
    const testUrl = `${PRODUCTION_URL}/api/revalidate?secret=${REVALIDATE_SECRET}`;

    console.log('\n🧪 Probando endpoint de revalidación en PRODUCCIÓN...');
    console.log(`📡 URL de prueba: ${testUrl}`);

    try {
        const response = await fetch(testUrl, {
            method: 'GET', // Usar GET para test manual
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Test de revalidación en PRODUCCIÓN exitoso!');
            console.log(`📄 Respuesta:`, result);
        } else {
            console.log('❌ Test de revalidación en PRODUCCIÓN falló');
            console.log(`📄 Error:`, result);
            console.log('\n💡 Esto puede ser normal si el endpoint GET no está habilitado en producción');
        }
    } catch (error) {
        console.log('❌ Error en test de revalidación:', error.message);
        console.log('💡 Esto puede ser normal - el webhook POST funcionará aunque el GET falle');
    }
}

// Función para mostrar instrucciones
function showInstructions() {
    console.log('\n📖 INSTRUCCIONES PARA CONFIGURAR PRODUCCIÓN:\n');
    console.log('1. 📝 Edita este archivo y cambia PRODUCTION_URL por tu dominio:');
    console.log('   Ejemplo: https://pledge4peace.vercel.app');
    console.log('   Ejemplo: https://tu-dominio.com\n');
    console.log('2. 🚀 Ejecuta el script:');
    console.log('   node scripts/setup-production-webhook.js\n');
    console.log('3. ✅ Despliega a producción\n');
    console.log('4. 🎉 Los cambios se verán en 2-10 segundos\n');
}

// Ejecutar script
async function main() {
    showInstructions();
    await setupProductionWebhook();
    await testProductionRevalidation();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} 