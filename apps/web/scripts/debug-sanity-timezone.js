/**
 * 🔍 SCRIPT DE DEBUG PARA INVESTIGAR TIMEZONE CORRUPTO
 * 
 * Este script hace consultas directas a la API de Sanity para investigar
 * dónde se originan los caracteres invisibles corruptos.
 */

async function debugTimezoneData() {
    console.log('🔍 === INVESTIGACIÓN DE TIMEZONE CORRUPTO ===\n');

    try {
        // Consulta directa a la API de Sanity
        const query = `*[_type == "conference"]{_id, title, timezone}`;
        const apiUrl = `https://f5zk7i1f.api.sanity.io/v2023-05-03/data/query/production?query=${encodeURIComponent(query)}`;

        console.log('📡 Consultando directamente la API de Sanity...');
        console.log(`URL: ${apiUrl}\n`);

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.error) {
            console.error('❌ Error de API:', result.error);
            return;
        }

        const conferences = result.result;
        console.log(`📊 Encontradas ${conferences.length} conferences\n`);

        conferences.forEach((conf, index) => {
            console.log(`Conference ${index + 1}:`);
            console.log(`  Title: ${conf.title}`);
            console.log(`  Timezone: "${conf.timezone}"`);
            console.log(`  Timezone Length: ${conf.timezone?.length || 0}`);

            if (conf.timezone && conf.timezone.length > 50) {
                console.log('  🚨 TIMEZONE CORRUPTO DETECTADO!');
                console.log(`  Primeros 20 char codes: [${Array.from(conf.timezone).slice(0, 20).map(c => c.charCodeAt(0)).join(', ')}...]`);

                // Intentar limpiar para ver el valor original
                const cleaned = conf.timezone.replace(/[\u200B-\u200D\uFEFF\u2060\u180E\u00AD\u0000-\u001F\u007F-\u009F\u2000-\u206F\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');
                console.log(`  Valor limpio: "${cleaned}"`);

                // Analizar tipos de caracteres invisibles
                const invisibleChars = Array.from(conf.timezone).filter(c => {
                    const code = c.charCodeAt(0);
                    return (code >= 0x200B && code <= 0x200D) || code === 0xFEFF ||
                        (code >= 0x2060 && code <= 0x206F) ||
                        (code >= 0x0000 && code <= 0x001F) ||
                        (code >= 0x007F && code <= 0x009F);
                });

                console.log(`  Caracteres invisibles: ${invisibleChars.length}`);
                console.log(`  Códigos únicos: ${[...new Set(invisibleChars.map(c => c.charCodeAt(0)))].join(', ')}`);

            } else {
                console.log('  ✅ Timezone parece normal');
            }
            console.log('');
        });

        // Analizar la respuesta JSON cruda
        console.log('\n📝 Analizando respuesta JSON cruda...');
        const rawResponse = await fetch(apiUrl);
        const rawText = await rawResponse.text();

        // Buscar el primer timezone en el JSON crudo
        const timezoneMatch = rawText.match(/"timezone":"([^"]+)"/);
        if (timezoneMatch) {
            const rawTimezone = timezoneMatch[1];
            console.log(`Timezone en JSON crudo: "${rawTimezone}"`);
            console.log(`Longitud en JSON crudo: ${rawTimezone.length}`);

            if (rawTimezone.length > 50) {
                console.log('🚨 La corrupción está en la respuesta JSON de Sanity!');
                console.log('Esto sugiere que el problema está en:');
                console.log('  - Los datos almacenados en Sanity');
                console.log('  - Un procesamiento en el lado del servidor de Sanity');
                console.log('  - Un problema con la serialización JSON');
            } else {
                console.log('✅ Los datos en JSON crudo se ven normales');
                console.log('El problema podría estar en:');
                console.log('  - El cliente de Sanity');
                console.log('  - Middleware de Next.js');
                console.log('  - Caché o transformaciones');
            }
        }

    } catch (error) {
        console.error('❌ Error durante la investigación:', error);
    }
}

// Ejecutar el debug
debugTimezoneData(); 