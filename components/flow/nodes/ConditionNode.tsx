import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { OntologyNodeData } from '../../../lib/types';

export const ConditionNode = React.memo(({ data, selected }: NodeProps<OntologyNodeData>) => {
  if (data.kind !== 'condition') return null;

  return (
    <div className={`w-64 bg-slate-900 border-2 rounded-lg shadow-2xl transition-all ${selected ? 'border-amber-400 ring-4 ring-amber-500/20' : 'border-amber-500/50'}`}>
      <div className="bg-amber-900/40 p-2 border-b border-amber-500/30 flex justify-between items-center">
        <span className="font-mono text-[10px] font-bold text-amber-400 uppercase">Condition [{data.logic}]</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold">LOGIC_GATE</span>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-bold text-slate-100 mb-2 font-mono italic truncate">{data.label}</h4>
        <div className="space-y-2 max-h-32 overflow-hidden">
          {data.rules.slice(0, 3).map((rule, idx) => (
            <div key={idx} className="p-2 bg-amber-950/20 border border-amber-500/20 rounded text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-slate-400">{rule.field}</span>
              <span className="text-amber-500 font-bold mx-1">{rule.operator}</span>
              <span className="text-slate-100 font-bold">{rule.value}</span>
            </div>
          ))}
          {data.rules.length > 3 && (
            <div className="text-[9px] text-slate-500 text-center">
              +{data.rules.length - 3} reglas
            </div>
          )}
        </div>
      </div>
      {/* Condition Nodes take input from left, output to right */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-amber-500 !border-4 !border-slate-950"
        style={{ left: '-8px' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 bg-amber-500 !border-4 !border-slate-950"
        style={{ right: '-8px' }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
