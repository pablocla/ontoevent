'use client';

import React, { useState, useEffect } from 'react';
import { FlowCanvas } from '../../components/flow/FlowCanvas';
import { NodeSidebar } from '../../components/flow/NodeSidebar';
import { InspectorPanel } from '../../components/flow/InspectorPanel';
import { SimulationModal } from '../../components/flow/SimulationModal';
import { useFlowStore } from '../../lib/store/flowStore';
import { validateOntology } from '../../lib/rule-engine/validation';
import { ValidationResult } from '../../lib/rule-engine/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const [showSimulate, setShowSimulate] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [ontologyName, setOntologyName] = useState('Nueva Ontología');
  const [ontologyId, setOntologyId] = useState<string | null>(null);

  useEffect(() => {
    // Load first ontology for DEMO
    if (nodes.length === 0) {
      fetch('/api/ontologies')
        .then(res => res.json())
        .then(list => {
          if (list.length > 0) {
            fetch(`/api/ontologies/${list[0].id}`)
              .then(res => res.json())
              .then(ont => {
                setOntologyId(ont.id);
                setOntologyName(ont.name);
                setNodes(ont.nodes);
                setEdges(ont.edges);
              });
          }
        });
    }
  }, []);

  const handleValidate = () => {
    const result = validateOntology({ nodes, edges });
    setValidation(result);
  };
  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header Navigation */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-slate-950 rotate-45"></div>
            </div>
            <span className="font-bold tracking-tight text-lg">OntoEvent <span className="text-emerald-500 text-xs font-mono">ERP v1.0</span></span>
          </div>
          <nav className="hidden md:flex space-x-4 text-sm font-medium text-slate-400">
            <span className="text-emerald-500">Editor</span>
            <a href="#" className="hover:text-slate-100">Ontologías</a>
            <Link href="/events" className="hover:text-slate-100">Historial de Eventos</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleValidate} className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors text-slate-200">Validar</button>
          <button onClick={() => setShowSimulate(true)} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-lg shadow-emerald-900/20 transition-colors">Ejecutar Simulación</button>
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold">JD</div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <NodeSidebar />
        <FlowCanvas />
        <InspectorPanel />
        
        {/* Validation Toast / Panel */}
        {validation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            {validation.valid ? (
               <div className="bg-emerald-900 border border-emerald-500/50 text-emerald-100 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2">
                 <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 <span className="text-sm font-bold">Ontología válida</span>
                 <button onClick={() => setValidation(null)} className="ml-4 text-emerald-200 hover:text-white">✕</button>
               </div>
            ) : (
               <div className="bg-slate-900 border border-red-500/50 rounded-lg shadow-2xl overflow-hidden w-96 flex flex-col">
                 <div className="bg-red-950/40 border-b border-red-900/30 p-2 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Errores de Validación</h3>
                   <button onClick={() => setValidation(null)} className="text-slate-400 hover:text-slate-100 text-sm">✕</button>
                 </div>
                 <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                   {validation.errors.map((e, i) => (
                     <div key={i} className="text-xs bg-slate-950 border border-slate-800 p-2 rounded flex flex-col gap-1">
                       <span className="text-slate-200 font-semibold">{e.message}</span>
                       <span className="text-[10px] text-slate-500 font-mono">CODE: {e.code}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showSimulate && <SimulationModal ontologyId={ontologyId} onClose={() => setShowSimulate(false)} />}


      {/* Status Footer */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>Motor de reglas: Activo</span>
          </div>
          <span>|</span>
          <span>{nodes.length} Nodos configurados</span>
          <span>|</span>
          <span>Ontología: {ontologyName} {ontologyId && `(${ontologyId})`}</span>
        </div>
        <div className="font-mono">
          JSON: Ready for Sync
        </div>
      </footer>
    </div>
  );
}
