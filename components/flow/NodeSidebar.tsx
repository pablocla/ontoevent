'use client';

import React from 'react';

export const NodeSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-60 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col space-y-6">
      <div>
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Librería de Nodos</h3>
        <div className="space-y-3">
          
          <div 
            className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-grab hover:border-blue-500 group"
            onDragStart={(event) => onDragStart(event, 'entity')}
            draggable
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold">Entidad de Negocio</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Modelo de datos base del ERP (ej. Producto, Pedido)</p>
          </div>
          
          <div 
            className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-grab hover:border-amber-500"
            onDragStart={(event) => onDragStart(event, 'condition')}
            draggable
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-semibold">Condición Lógica</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Evaluador de umbrales y reglas comparativas</p>
          </div>
          
          <div 
            className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-grab hover:border-emerald-500"
            onDragStart={(event) => onDragStart(event, 'event')}
            draggable
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold">Evento de Salida</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Disparador de notificaciones o webhooks</p>
          </div>
          
        </div>
      </div>
    </aside>
  );
};
