'use client';

import React from 'react';
import { useFlowStore } from '../../lib/store/flowStore';

export const InspectorPanel = () => {
  const { nodes, updateNodeData, removeNode } = useFlowStore();

  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <aside className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center text-slate-500">
        <p className="text-xs">Selecciona un nodo para inspeccionar</p>
      </aside>
    );
  }

  const { kind, label } = selectedNode.data;

  // Render form based on kind
  return (
    <aside className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
        <div>
          <h2 className="text-xs font-bold">Inspector de Nodo</h2>
          <p className="text-[10px] text-slate-500">ID: {selectedNode.id}</p>
        </div>
        <button className="text-slate-400 hover:text-slate-100">
          <svg className="w-4 h-4" transform="rotate(45)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Nombre</label>
          <input 
            type="text" 
            value={label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {kind === 'entity' && (
          <>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Descripción</label>
              <textarea 
                value={(selectedNode.data as any).description || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
            {/* Minimal fields editor for MVP */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Campos (Schema)</label>
                <button 
                  className="text-[10px] text-emerald-500 font-bold underline"
                  onClick={() => {
                    const fields = [...(selectedNode.data as any).fields, { name: 'nuevoCampo', type: 'string' }];
                    updateNodeData(selectedNode.id, { fields });
                  }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {((selectedNode.data as any).fields || []).map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={f.name}
                      onChange={(e) => {
                        const fields = [...(selectedNode.data as any).fields];
                        fields[idx].name = e.target.value;
                        updateNodeData(selectedNode.id, { fields });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <select 
                      value={f.type}
                      onChange={(e) => {
                        const fields = [...(selectedNode.data as any).fields];
                        fields[idx].type = e.target.value as any;
                        updateNodeData(selectedNode.id, { fields });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[10px] focus:outline-none focus:border-emerald-500"
                    >
                      <option value="number">number</option>
                      <option value="string">string</option>
                      <option value="boolean">boolean</option>
                    </select>
                    <button 
                      onClick={() => {
                        const fields = [...(selectedNode.data as any).fields];
                        fields.splice(idx, 1);
                        updateNodeData(selectedNode.id, { fields });
                      }}
                      className="text-[10px] text-red-500 hover:text-red-400 font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {kind === 'condition' && (
          <>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Lógica</label>
              <select 
                value={(selectedNode.data as any).logic || 'AND'}
                onChange={(e) => updateNodeData(selectedNode.id, { logic: e.target.value as 'AND' | 'OR' })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="AND">AND (Todas las reglas)</option>
                <option value="OR">OR (Alguna regla)</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Reglas</label>
                <button 
                  className="text-[10px] text-emerald-500 font-bold underline"
                  onClick={() => {
                    const rules = [...(selectedNode.data as any).rules, { field: 'campo', operator: '==', value: 'valor' }];
                    updateNodeData(selectedNode.id, { rules });
                  }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {((selectedNode.data as any).rules || []).map((r: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 p-2 bg-slate-950 border border-slate-800 rounded">
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={r.field}
                        onChange={(e) => {
                          const rules = [...(selectedNode.data as any).rules];
                          rules[idx].field = e.target.value;
                          updateNodeData(selectedNode.id, { rules });
                        }}
                        placeholder="campo"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px]"
                      />
                      <select 
                        value={r.operator}
                        onChange={(e) => {
                          const rules = [...(selectedNode.data as any).rules];
                          rules[idx].operator = e.target.value;
                          updateNodeData(selectedNode.id, { rules });
                        }}
                        className="bg-slate-900 border border-slate-800 rounded px-1 py-1 text-[10px]"
                      >
                        <option value="<">&lt;</option>
                        <option value=">">&gt;</option>
                        <option value="==">==</option>
                        <option value="!=">!=</option>
                        <option value="<=">&lt;=</option>
                        <option value=">=">&gt;=</option>
                      </select>
                      <input 
                        type="text" 
                        value={r.value}
                        onChange={(e) => {
                          const rules = [...(selectedNode.data as any).rules];
                          rules[idx].value = e.target.value;
                          updateNodeData(selectedNode.id, { rules });
                        }}
                        placeholder="valor"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px]"
                      />
                      <button 
                        onClick={() => {
                          const rules = [...(selectedNode.data as any).rules];
                          rules.splice(idx, 1);
                          updateNodeData(selectedNode.id, { rules });
                        }}
                        className="text-[10px] text-red-500 hover:text-red-400 font-bold ml-1"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {kind === 'event' && (
          <>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Mensaje</label>
              <textarea 
                value={(selectedNode.data as any).message || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Canales</label>
              <div className="flex flex-col gap-2">
                {['webhook', 'slack', 'email'].map((ch) => {
                  const channels = (selectedNode.data as any).channels || [];
                  const active = channels.includes(ch);
                  return (
                    <label key={ch} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={active}
                        onChange={(e) => {
                          let newChannels = [...channels];
                          if (e.target.checked) newChannels.push(ch);
                          else newChannels = newChannels.filter((c: string) => c !== ch);
                          updateNodeData(selectedNode.id, { channels: newChannels });
                        }}
                        className="rounded border-slate-800 bg-slate-950 text-emerald-500"
                      />
                      <span className="text-xs">#{ch}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <button className="w-full py-2 bg-slate-800 text-[11px] font-bold rounded border border-slate-700 hover:bg-slate-700">Exportar JSON Node</button>
        <button onClick={() => removeNode(selectedNode.id)} className="w-full py-2 bg-red-950/30 text-red-400 text-[11px] font-bold rounded border border-red-900/50 hover:bg-red-950/50 transition-colors">Eliminar Nodo</button>
      </div>
    </aside>
  );
};
