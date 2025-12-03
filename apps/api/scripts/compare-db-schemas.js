#!/usr/bin/env node
/**
 * Script to compare database schemas between preview and production D1 databases
 * Usage: node scripts/compare-db-schemas.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..');

function executeQuery(dbName, env, query) {
    try {
        const command = `cd ${API_DIR} && wrangler d1 execute ${dbName} --env ${env} --remote --command "${query.replace(/"/g, '\\"')}"`;
        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
        // Extract JSON from output (wrangler adds emoji and other text)
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error(`No JSON found in output for ${dbName} (${env})`);
            return [];
        }
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed[0]?.results || [];
    } catch (error) {
        console.error(`Error executing query on ${dbName} (${env}):`, error.message);
        return [];
    }
}

function getTableNames(dbName, env) {
    const results = executeQuery(
        dbName,
        env,
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;"
    );
    return results.map(r => r.name);
}

function getTableSchema(dbName, env, tableName) {
    const results = executeQuery(dbName, env, `PRAGMA table_info(${tableName});`);
    return results.map(col => ({
        cid: col.cid,
        name: col.name,
        type: col.type,
        notnull: col.notnull,
        dflt_value: col.dflt_value,
        pk: col.pk
    }));
}

function compareSchemas() {
    console.log('🔍 Comparing database schemas...\n');

    const previewTables = getTableNames('preview-pledge4peace-db', 'preview');
    const prodTables = getTableNames('pledge4peace-db', 'production');

    console.log(`📊 Preview has ${previewTables.length} tables`);
    console.log(`📊 Production has ${prodTables.length} tables\n`);

    // Find tables in one but not the other
    const onlyInPreview = previewTables.filter(t => !prodTables.includes(t));
    const onlyInProd = prodTables.filter(t => !previewTables.includes(t));

    if (onlyInPreview.length > 0) {
        console.log('⚠️  Tables only in PREVIEW:');
        onlyInPreview.forEach(t => console.log(`   - ${t}`));
        console.log();
    }

    if (onlyInProd.length > 0) {
        console.log('⚠️  Tables only in PRODUCTION:');
        onlyInProd.forEach(t => console.log(`   - ${t}`));
        console.log();
    }

    // Compare common tables
    const commonTables = previewTables.filter(t => prodTables.includes(t));
    const differences = [];

    console.log(`🔍 Comparing ${commonTables.length} common tables...\n`);

    for (const tableName of commonTables) {
        const previewSchema = getTableSchema('preview-pledge4peace-db', 'preview', tableName);
        const prodSchema = getTableSchema('pledge4peace-db', 'production', tableName);

        const previewCols = new Map(previewSchema.map(c => [c.name, c]));
        const prodCols = new Map(prodSchema.map(c => [c.name, c]));

        // Find columns in one but not the other
        const onlyInPreviewCols = Array.from(previewCols.keys()).filter(n => !prodCols.has(n));
        const onlyInProdCols = Array.from(prodCols.keys()).filter(n => !previewCols.has(n));

        // Find columns with different definitions
        const differentCols = [];
        for (const [colName, previewCol] of previewCols) {
            if (prodCols.has(colName)) {
                const prodCol = prodCols.get(colName);
                if (
                    previewCol.type !== prodCol.type ||
                    previewCol.notnull !== prodCol.notnull ||
                    previewCol.dflt_value !== prodCol.dflt_value ||
                    previewCol.pk !== prodCol.pk
                ) {
                    differentCols.push({
                        name: colName,
                        preview: previewCol,
                        prod: prodCol
                    });
                }
            }
        }

        if (onlyInPreviewCols.length > 0 || onlyInProdCols.length > 0 || differentCols.length > 0) {
            differences.push({
                table: tableName,
                onlyInPreview: onlyInPreviewCols,
                onlyInProd: onlyInProdCols,
                different: differentCols
            });
        }
    }

    if (differences.length === 0) {
        console.log('✅ All tables are in sync!');
    } else {
        console.log(`\n⚠️  Found differences in ${differences.length} table(s):\n`);
        differences.forEach(diff => {
            console.log(`📋 Table: ${diff.table}`);
            if (diff.onlyInPreview.length > 0) {
                console.log(`   Columns only in PREVIEW: ${diff.onlyInPreview.join(', ')}`);
            }
            if (diff.onlyInProd.length > 0) {
                console.log(`   Columns only in PRODUCTION: ${diff.onlyInProd.join(', ')}`);
            }
            if (diff.different.length > 0) {
                console.log(`   Columns with different definitions:`);
                diff.different.forEach(col => {
                    console.log(`     - ${col.name}:`);
                    console.log(`       Preview: type=${col.preview.type}, notnull=${col.preview.notnull}, default=${col.preview.dflt_value}`);
                    console.log(`       Prod:    type=${col.prod.type}, notnull=${col.prod.notnull}, default=${col.prod.dflt_value}`);
                });
            }
            console.log();
        });
    }

    return differences.length === 0;
}

if (require.main === module) {
    const isSynced = compareSchemas();
    process.exit(isSynced ? 0 : 1);
}

module.exports = { compareSchemas };

