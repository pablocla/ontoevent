import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { OntologyNodeData } from '../../../lib/types';

export const EntityNode = React.memo(({ data, selected }: NodeProps<OntologyNodeData>) => {
  if (data.kind !== 'entity') return null;

  return (
    <div className={`w-56 bg-slate-900 border-2 rounded-lg shadow-2xl transition-all ${selected ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-blue-500/50'}`}>
      <div className="bg-blue-900/40 p-2 border-b border-blue-500/30 flex justify-between items-center">
        <span className="font-mono text-[10px] font-bold text-blue-400 uppercase">Entity</span>
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-bold text-slate-100 mb-1 truncate">{data.label}</h4>
        <p className="text-[10px] text-slate-400 mb-3 truncate">{data.description || 'Sin descripción'}</p>
        <div className="space-y-1">
          {data.fields.slice(0, 3).map((field, idx) => (
            <div key={idx} className="flex justify-between text-[10px] bg-slate-950/50 p-1 rounded">
              <span className="text-slate-500 truncate mr-2">{field.name}</span>
              <span className="text-blue-300">{field.type}</span>
            </div>
          ))}
          {data.fields.length > 3 && (
            <div className="text-[9px] text-slate-500 text-center mt-1">
              +{data.fields.length - 3} campos
            </div>
          )}
        </div>
      </div>
      {/* Entity Nodes output right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 bg-blue-500 !border-4 !border-slate-950" 
        style={{ right: '-8px' }}
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
