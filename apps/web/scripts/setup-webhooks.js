#!/usr/bin/env node

/**
 * Script para configurar webhooks de Sanity para revalidación en tiempo real
 * 
 * Uso:
 * node scripts/setup-webhooks.js
 * 
 * Asegúrate de tener las siguientes variables de entorno configuradas:
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

// Configuración
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f5zk7i1f';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;
const API_TOKEN = process.env.SANITY_API_TOKEN;
const NGROK_URL = 'https://2c2d-190-32-165-59.ngrok-free.app'; // Actualizar con tu URL

// Cliente administrativo
const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2023-05-03',
    token: API_TOKEN,
    useCdn: false,
});

async function setupWebhook() {
    console.log('🚀 Configurando webhooks de Sanity...\n');

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
        name: 'Next.js Revalidation - Pledge4Peace',
        url: `${NGROK_URL}/api/revalidate?secret=${REVALIDATE_SECRET}`,
        dataset: DATASET,
        trigger: {
            types: ['homePage', 'campaign', 'article', 'conference', 'aboutPage', 'volunteerPage'],
            includeDrafts: false,
        },
        httpMethod: 'POST',
        apiVersion: '2023-05-03',
    };

    try {
        console.log(`📡 URL del webhook: ${webhookConfig.url}`);
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
                console.log(`  ${index + 1}. ${webhook.name} - ${webhook.url}`);
            });
            console.log('');
        } else {
            console.log('No se encontraron webhooks existentes.\n');
        }

        // Crear el webhook
        console.log('⚡ Creando webhook...');
        const newWebhook = await client.request({
            url: '/hooks',
            method: 'POST',
            body: webhookConfig,
        });

        console.log('✅ ¡Webhook creado exitosamente!');
        console.log(`🆔 ID del webhook: ${newWebhook.id}`);
        console.log(`📛 Nombre: ${newWebhook.name}`);
        console.log(`🔗 URL: ${newWebhook.url}\n`);

        console.log('🎉 ¡Configuración completada!');
        console.log('💡 Los cambios en Sanity ahora se reflejarán automáticamente en tu sitio web.');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Haz un cambio en Sanity Studio');
        console.log('2. Verifica que el webhook se ejecute en los logs de Next.js');
        console.log('3. Confirma que el contenido se actualice en tu sitio web');

    } catch (error) {
        console.error('❌ Error creando webhook:', error);

        if (error.statusCode === 401) {
            console.log('\n💡 Consejos para resolver el error:');
            console.log('- Verifica que SANITY_API_TOKEN tenga permisos de administrador');
            console.log('- Obtén un nuevo token en: https://manage.sanity.io/');
        } else if (error.statusCode === 409) {
            console.log('\n💡 Un webhook con esta configuración ya existe.');
            console.log('Considera eliminar el webhook existente o usar una URL diferente.');
        }

        process.exit(1);
    }
}

async function testRevalidation() {
    const testUrl = `${NGROK_URL}/api/test-revalidate?secret=${REVALIDATE_SECRET}`;

    console.log('\n🧪 Probando endpoint de revalidación...');
    console.log(`📡 URL de prueba: ${testUrl}`);

    try {
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Test de revalidación exitoso!');
            console.log(`📄 Respuesta:`, result);
        } else {
            console.log('❌ Test de revalidación falló');
            console.log(`📄 Error:`, result);
        }
    } catch (error) {
        console.log('❌ Error en test de revalidación:', error.message);
        console.log('💡 Asegúrate de que el servidor de Next.js esté corriendo');
    }
}

// Ejecutar script
async function main() {
    await setupWebhook();
    await testRevalidation();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} 