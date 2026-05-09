import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { OntologyNodeData } from '../types';

export type AppNode = Node<OntologyNodeData>;

interface FlowState {
  nodes: AppNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<OntologyNodeData>) => void;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    // Basic validation: Entity -> Condition -> Event can be added later
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node: AppNode) => {
    set({ nodes: [...get().nodes, node] });
  },
  removeNode: (id: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    });
  },
  updateNodeData: (id: string, data: Partial<OntologyNodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          // It's important to merge properly based on kind, but for now we do a shallow merge
          // Assuming the caller passes the full updated data or valid partials.
          return { ...node, data: { ...node.data, ...data } as OntologyNodeData };
        }
        return node;
      }),
    });
  },
  setNodes: (nodes: AppNode[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
}));
