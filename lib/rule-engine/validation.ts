import { OntologyGraph, ValidationResult } from './types';

export function validateOntology(graph: OntologyGraph): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  
  const adjacencyList = new Map<string, string[]>();
  graph.nodes.forEach(n => adjacencyList.set(n.id, []));
  graph.edges.forEach(e => {
    if (adjacencyList.has(e.source)) {
      adjacencyList.get(e.source)!.push(e.target);
    }
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  let cycleNodeId: string | null = null;

  function detectCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      cycleNodeId = nodeId;
      return true;
    }
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (detectCycle(neighbor)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of graph.nodes) {
    if (detectCycle(node.id)) {
      errors.push({ nodeId: cycleNodeId, code: 'CYCLE', message: 'Se detectó un ciclo en el grafo' });
      break; 
    }
  }

  graph.nodes.forEach(node => {
    const isSource = graph.edges.some(e => e.source === node.id);
    const isTarget = graph.edges.some(e => e.target === node.id);
    if (!isSource && !isTarget && graph.nodes.length > 1) {
      errors.push({ nodeId: node.id, code: 'ISOLATED_NODE', message: `Nodo aislado: ${node.data.label}` });
    }

    if (node.data.kind === 'event') {
      const hasUpstreamCondition = graph.edges.some(e => {
        if (e.target !== node.id) return false;
        const sourceNode = graph.nodes.find(n => n.id === e.source);
        return sourceNode?.data.kind === 'condition';
      });
      if (!hasUpstreamCondition) {
        errors.push({ nodeId: node.id, code: 'ORPHAN_EVENT', message: `El evento "${node.data.label}" no tiene condición upstream` });
      }
    }

    if (node.data.kind === 'condition') {
      const hasUpstreamEntity = graph.edges.some(e => {
        if (e.target !== node.id) return false;
        const sourceNode = graph.nodes.find(n => n.id === e.source);
        return sourceNode?.data.kind === 'entity';
      });
      if (!hasUpstreamEntity) {
        errors.push({ nodeId: node.id, code: 'ORPHAN_CONDITION', message: `La condición "${node.data.label}" no tiene entidad upstream` });
      }

      if (node.data.rules.length === 0) {
        errors.push({ nodeId: node.id, code: 'EMPTY_RULES', message: `La condición "${node.data.label}" no tiene reglas` });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
