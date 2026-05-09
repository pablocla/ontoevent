import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { OntologyNodeData } from '../../../lib/types';

export const EventNode = React.memo(({ data, selected }: NodeProps<OntologyNodeData>) => {
  if (data.kind !== 'event') return null;

  return (
    <div className={`w-48 bg-slate-900 border-2 rounded-lg shadow-2xl opacity-90 transition-all ${selected ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-emerald-500/50'}`}>
      <div className="bg-emerald-900/40 p-2 border-b border-emerald-500/30">
        <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase">Event Trigger</span>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-bold text-slate-100 mb-2 truncate">{data.label}</h4>
        <div className="flex gap-1 flex-wrap">
          {data.channels.map(channel => {
            let colors = '';
            switch(channel) {
              case 'slack': colors = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'; break;
              case 'webhook': colors = 'bg-blue-500/10 text-blue-500 border border-blue-500/20'; break;
              case 'email': colors = 'bg-amber-500/10 text-amber-500 border border-amber-500/20'; break;
            }
            return (
              <span key={channel} className={`px-2 py-1 text-[9px] rounded-full ${colors}`}>
                #{channel}
              </span>
            )
          })}
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-emerald-500 !border-4 !border-slate-950"
        style={{ left: '-8px' }}
      />
    </div>
  );
});

EventNode.displayName = 'EventNode';
