/**
 * 🔍 PÁGINA DE DEBUG PARA TIMEZONE CORRUPTO
 *
 * Esta página rastrea el timezone en cada etapa del pipeline
 * para identificar exactamente dónde se corrompe.
 */

import { getConferences } from "@/lib/sanity/queries";
import { client } from "@/lib/sanity/client";
import { debugTimezone } from "@/lib/utils/clean-timezone";

// Componente para debuggear en el cliente
function ClientSideDebug({ conferences }: { conferences: any[] }) {
  console.log(
    "🖥️ CLIENT-SIDE: Conferences recibidas:",
    conferences.map((c) => ({
      title: c.title,
      timezone: c.timezone,
      timezoneLength: c.timezone?.length,
    }))
  );

  return (
    <div className="bg-blue-50 p-4 rounded">
      <h3 className="font-bold text-blue-800">🖥️ Client-Side Data</h3>
      {conferences.map((conf, i) => (
        <div key={i} className="mt-2">
          <p>
            <strong>Conference:</strong> {conf.title}
          </p>
          <p>
            <strong>Timezone:</strong> "{conf.timezone}"
          </p>
          <p>
            <strong>Length:</strong> {conf.timezone?.length || 0}
          </p>
          {conf.timezone && conf.timezone.length > 50 && (
            <p className="text-red-600 font-bold">
              🚨 CORRUPTO EN CLIENT-SIDE!
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function DebugTimezonePage() {
  console.log("🏗️ SERVER-SIDE: Iniciando debug del timezone...");

  // 1. Test directo con cliente de Sanity
  console.log("📡 SERVER-SIDE: Consultando con cliente directo...");
  const directQuery = await client.fetch(
    `*[_type == "conference"]{_id, title, timezone}`,
    {},
    { cache: "no-store" } // Sin caché para test puro
  );

  console.log(
    "📡 SERVER-SIDE: Resultado directo:",
    directQuery.map((c) => ({
      title: c.title,
      timezone: c.timezone,
      timezoneLength: c.timezone?.length,
    }))
  );

  // 2. Test con función de queries
  console.log("🔄 SERVER-SIDE: Consultando con getConferences...");
  const conferencesfromQuery = await getConferences();

  console.log(
    "🔄 SERVER-SIDE: Resultado de getConferences:",
    conferencesfromQuery.map((c) => ({
      title: c.title,
      timezone: c.timezone,
      timezoneLength: c.timezone?.length,
    }))
  );

  // 3. Serialización JSON manual
  const serialized = JSON.parse(JSON.stringify(conferencesfromQuery));
  console.log(
    "📦 SERVER-SIDE: Después de serialización JSON:",
    serialized.map((c: any) => ({
      title: c.title,
      timezone: c.timezone,
      timezoneLength: c.timezone?.length,
    }))
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Timezone Corrupto</h1>

      <div className="grid gap-6">
        {/* Server-side results */}
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold text-green-800">🏗️ Server-Side Data</h3>

          <div className="mt-4">
            <h4 className="font-semibold">📡 Cliente Directo de Sanity:</h4>
            {directQuery.map((conf, i) => (
              <div key={i} className="ml-4">
                <p>
                  <strong>Conference:</strong> {conf.title}
                </p>
                <p>
                  <strong>Timezone:</strong> "{conf.timezone}"
                </p>
                <p>
                  <strong>Length:</strong> {conf.timezone?.length || 0}
                </p>
                {conf.timezone && conf.timezone.length > 50 && (
                  <p className="text-red-600 font-bold">
                    🚨 CORRUPTO EN CLIENTE DIRECTO!
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">🔄 getConferences() Function:</h4>
            {conferencesfromQuery.map((conf, i) => (
              <div key={i} className="ml-4">
                <p>
                  <strong>Conference:</strong> {conf.title}
                </p>
                <p>
                  <strong>Timezone:</strong> "{conf.timezone}"
                </p>
                <p>
                  <strong>Length:</strong> {conf.timezone?.length || 0}
                </p>
                {conf.timezone && conf.timezone.length > 50 && (
                  <p className="text-red-600 font-bold">
                    🚨 CORRUPTO EN getConferences!
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Client-side hydration test */}
        <ClientSideDebug conferences={conferencesfromQuery} />
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h3 className="font-bold text-yellow-800">📋 Análisis de Resultados</h3>
        <p className="mt-2">
          Revisa la consola del navegador y del servidor para ver dónde aparece
          la corrupción.
        </p>

        <div className="mt-4">
          <h4 className="font-semibold">🔍 Posibles Causas:</h4>
          <ul className="list-disc ml-6 mt-2">
            <li>
              Si está corrupto en "Cliente Directo": El problema está en Sanity
              o next-sanity
            </li>
            <li>
              Si se corrompe en "getConferences": El problema está en nuestras
              queries
            </li>
            <li>
              Si se corrompe en "Client-Side": El problema está en la
              serialización o hydration
            </li>
            <li>
              Si aparece solo en algunos casos: Problema de caché o condiciones
              específicas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
