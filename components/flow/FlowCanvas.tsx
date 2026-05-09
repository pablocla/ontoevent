'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  Edge,
  Connection,
  useReactFlow,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFlowStore } from '../../lib/store/flowStore';
import { EntityNode } from './nodes/EntityNode';
import { ConditionNode } from './nodes/ConditionNode';
import { EventNode } from './nodes/EventNode';
import { OntologyNodeData } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  condition: ConditionNode,
  event: EventNode,
};

const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, removeNode, setSelectedNode } = useFlowStore();
  const { project, setNodes } = useReactFlow();
  
  const [menu, setMenu] = useState<{ id?: string, top: number, left: number, right: number, bottom: number, type: 'pane' | 'node' } | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as 'entity' | 'condition' | 'event';

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let data: OntologyNodeData;

      if (type === 'entity') {
        data = { kind: 'entity', label: 'Nueva Entidad', description: '', fields: [] };
      } else if (type === 'condition') {
        data = { kind: 'condition', label: 'Nueva Condición', logic: 'AND', rules: [] };
      } else {
        data = { kind: 'event', label: 'Nuevo Evento', channels: [], message: '' };
      }

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data,
      };

      addNode(newNode);
    },
    [project, addNode]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setMenu({
        top: event.clientY,
        left: event.clientX,
        right: 0,
        bottom: 0,
        type: 'pane',
      });
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
        right: 0,
        bottom: 0,
        type: 'node',
      });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    window.addEventListener('click', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
    };
  }, [closeMenu]);

  const addNodeFromMenu = (type: 'entity' | 'condition' | 'event' | 'n8n') => {
    if (!menu) return;
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = project({
      x: menu.left - reactFlowBounds.left,
      y: menu.top - reactFlowBounds.top,
    });

    let data: OntologyNodeData;

    if (type === 'entity') {
      data = { kind: 'entity', label: 'Nueva Entidad', description: '', fields: [] };
    } else if (type === 'condition') {
      data = { kind: 'condition', label: 'Nueva Condición', logic: 'AND', rules: [] };
    } else if (type === 'event') {
      data = { kind: 'event', label: 'Nuevo Evento', channels: [], message: '' };
    } else if (type === 'n8n') {
      data = { kind: 'event', label: 'n8n Trigger (Webhook)', channels: ['webhook'], message: 'Enviar payload a n8n' };
    } else {
      return;
    }

    addNode({
      id: uuidv4(),
      type: type === 'n8n' ? 'event' : type,
      position,
      data,
    });
  };

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      >
        <MiniMap 
          className="bg-slate-900 border border-slate-800 rounded-md shadow-2xl opacity-80"
          maskColor="rgba(15, 23, 42, 0.7)"
          nodeColor={(n) => {
            if (n.type === 'entity') return 'rgba(59, 130, 246, 0.2)';
            if (n.type === 'condition') return 'rgba(245, 158, 11, 0.2)';
            if (n.type === 'event') return 'rgba(16, 185, 129, 0.2)';
            return '#fff';
          }}
          nodeStrokeColor={(n) => {
            if (n.type === 'entity') return 'rgba(59, 130, 246, 0.4)';
            if (n.type === 'condition') return 'rgba(245, 158, 11, 0.4)';
            if (n.type === 'event') return 'rgba(16, 185, 129, 0.4)';
            return '#fff';
          }}
          nodeBorderRadius={4}
        />
        <Controls className="bg-slate-900 border-slate-800 fill-slate-400 [&>button]:border-b-slate-800 hover:[&>button]:bg-slate-800" />
      </ReactFlow>

      {menu && (
        <div
          className="absolute z-50 bg-slate-800 border border-slate-700 shadow-2xl rounded-lg py-1 w-56 font-sans text-sm"
          style={{ top: menu.top, left: menu.left }}
        >
          {menu.type === 'pane' && (
            <>
              <button className="flex items-center w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => addNodeFromMenu('entity')}>
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                Añadir Entidad
              </button>
              <button className="flex items-center w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => addNodeFromMenu('condition')}>
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                Añadir Condición
              </button>
              <button className="flex items-center w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => addNodeFromMenu('event')}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                Añadir Evento
              </button>
              <div className="h-px bg-slate-700 my-1 mx-2"></div>
              <button className="flex items-center w-full px-4 py-2 text-left text-orange-400 font-semibold hover:bg-slate-700 hover:text-orange-300 transition-colors" onClick={() => addNodeFromMenu('n8n')}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                Añadir n8n Webhook
              </button>
            </>
          )}
          {menu.type === 'node' && (
            <>
              <button className="flex items-center w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => {
                if (menu.id) {
                  const node = nodes.find(n => n.id === menu.id);
                  if (node) setSelectedNode(node);
                }
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Editar
              </button>
              <button className="flex items-center w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors" onClick={() => menu.id && removeNode(menu.id)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Eliminar nodo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const FlowCanvas = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex-1 h-full w-full bg-slate-950" />;
  }

  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};
