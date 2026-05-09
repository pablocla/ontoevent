import React from 'react';
import { db } from '../../lib/db';
import { simulatedEvents, ontologies } from '../../lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const allEvents = await db
    .select({
      id: simulatedEvents.id,
      ontologyId: simulatedEvents.ontologyId,
      ontologyName: ontologies.name,
      firedAt: simulatedEvents.firedAt,
      contextInput: simulatedEvents.contextInput,
      resultJson: simulatedEvents.resultJson,
    })
    .from(simulatedEvents)
    .leftJoin(ontologies, eq(simulatedEvents.ontologyId, ontologies.id))
    .orderBy(desc(simulatedEvents.firedAt));

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-950 text-slate-100 font-sans">
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-slate-950 rotate-45"></div>
            </div>
            <span className="font-bold tracking-tight text-lg">OntoEvent <span className="text-emerald-500 text-xs font-mono">ERP v1.0</span></span>
          </div>
          <nav className="hidden md:flex space-x-4 text-sm font-medium text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-100">Editor</Link>
            <a href="#" className="hover:text-slate-100">Ontologías</a>
            <span className="text-emerald-500">Historial de Eventos</span>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Historial de Simulaciones</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Ontología</th>
                <th className="px-6 py-4 font-semibold">Contexto</th>
                <th className="px-6 py-4 font-semibold">Resultados</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No hay simulaciones registradas aún.
                  </td>
                </tr>
              ) : (
                allEvents.map((evt) => {
                  const d = new Date(evt.firedAt);
                  const result = JSON.parse(evt.resultJson);
                  const eventsCount = result?.firedEvents?.length || 0;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {d.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-200">{evt.ontologyName || evt.ontologyId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 font-mono">
                          {evt.contextInput.length > 50 ? evt.contextInput.substring(0, 50) + '...' : evt.contextInput}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${eventsCount > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {eventsCount} eventos
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-500 hover:text-emerald-400 text-xs font-semibold">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
