'use client';

import React, { useState, useMemo } from 'react';
import { useFlowStore } from '../../lib/store/flowStore';
import { evaluate } from '../../lib/rule-engine';
import { SimulationResult } from '../../lib/rule-engine/types';

interface SimulationModalProps {
  ontologyId: string | null;
  onClose: () => void;
}

export const SimulationModal = ({ ontologyId, onClose }: SimulationModalProps) => {
  const { nodes, edges } = useFlowStore();
  const [context, setContext] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Get all unique fields from EntityNodes
  const allFields = useMemo(() => {
    const fields = new Set<string>();
    nodes.filter(n => n.data.kind === 'entity').forEach(n => {
      if (n.data.kind === 'entity' && n.data.fields) {
        n.data.fields.forEach(f => fields.add(f.name));
      }
    });
    return Array.from(fields);
  }, [nodes]);

  const handleContextChange = (field: string, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  const handleSimulate = () => {
    // We pass the entire graph
    const res = evaluate({ nodes, edges }, context);
    setResult(res);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await fetch(`/api/ontologies/${ontologyId || 'draft-ontology'}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextInput: context,
          resultJson: result,
        }),
      });
      setSaved(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-lg font-bold text-slate-100">Simulación del Modelo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4">1. Contexto Inicial</h3>
            {allFields.length === 0 ? (
              <p className="text-sm text-slate-400">No hay campos en las entidades para simular.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFields.map(field => (
                  <div key={field} className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-300 font-medium">{field}</label>
                    <input 
                      type="text" 
                      value={context[field] || ''}
                      onChange={e => handleContextChange(field, e.target.value)}
                      placeholder="Valor..."
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
               <button 
                onClick={handleSimulate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded shadow-lg shadow-emerald-900/20 transition-colors"
               >
                 Ejecutar Evaluación
               </button>
            </div>
          </div>

          {result && (
            <div className="border-t border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold">2. Resultados Obtenidos</h3>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                  {result.firedEvents.length} Eventos | {result.skippedConditions.length} Ignorados
                </span>
              </div>
              
              {result.firedEvents.length > 0 ? (
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3">Evento</th>
                        <th className="px-4 py-3">Mensaje</th>
                        <th className="px-4 py-3">Canales</th>
                        <th className="px-4 py-3">Ruta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {result.firedEvents.map((evt, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-semibold text-emerald-400">{evt.eventName}</td>
                          <td className="px-4 py-3 truncate max-w-xs" title={evt.message}>{evt.message}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {evt.channels.map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">#{c}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                            {evt.evaluatedPath.length} nodos
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-lg text-amber-400 text-sm">
                  Ninguna condición se cumplió para disparar eventos.
                </div>
              )}
            </div>
          )}
        </div>
        
        {result && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3 rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded transition-colors">
              Cerrar
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving || saved}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded shadow-lg transition-colors"
            >
              {saved ? 'Guardado ✓' : (isSaving ? 'Guardando...' : 'Guardar Simulación')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
