import { expect, test, describe } from 'vitest';
import { evaluate } from '../index';
import { validateOntology } from '../validation';
import { OntologyGraph } from '../types';

describe('OntoEvent MVP Engine', () => {
  const getGraph = (): OntologyGraph => ({
    nodes: [
      {
        id: 'N1',
        type: 'entity',
        position: { x: 0, y: 0 },
        data: {
          kind: 'entity',
          label: 'Producto',
          description: '',
          fields: [
            { name: 'stockActual', type: 'number' },
            { name: 'umbralMinimo', type: 'number' },
            { name: 'demandaDiaria', type: 'number' }
          ]
        }
      },
      {
        id: 'N2',
        type: 'condition',
        position: { x: 200, y: 0 },
        data: {
          kind: 'condition',
          label: 'Stock Crítico',
          logic: 'AND',
          rules: [
            { field: 'stockActual', operator: '<', value: 'umbralMinimo' },
            { field: 'demandaDiaria', operator: '>', value: 100 }
          ]
        }
      },
      {
        id: 'N3',
        type: 'event',
        position: { x: 400, y: 0 },
        data: {
          kind: 'event',
          label: 'REPOSICION_URGENTE',
          message: 'Stock critico',
          channels: ['webhook', 'slack']
        }
      }
    ],
    edges: [
      { id: 'E1', source: 'N1', target: 'N2' },
      { id: 'E2', source: 'N2', target: 'N3' }
    ]
  });

  test('test 1: stockActual=30, umbralMinimo=50, demandaDiaria=150 -> debe disparar', () => {
    const graph = getGraph();
    const result = evaluate(graph, {
      stockActual: 30,
      umbralMinimo: 50,
      demandaDiaria: 150
    });
    expect(result.firedEvents.length).toBe(1);
    expect(result.firedEvents[0].eventName).toBe('REPOSICION_URGENTE');
  });

  test('test 2: stockActual=80, umbralMinimo=50 -> NO debe disparar', () => {
    const graph = getGraph();
    const result = evaluate(graph, {
      stockActual: 80,
      umbralMinimo: 50,
      demandaDiaria: 150
    });
    expect(result.firedEvents.length).toBe(0);
    expect(result.skippedConditions.length).toBe(1);
  });

  test('test 3: grafo con ciclo artificial -> validate return CYCLE', () => {
    const graph = getGraph();
    graph.edges.push({ id: 'E3', source: 'N3', target: 'N1' });
    const validation = validateOntology(graph);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.code === 'CYCLE')).toBe(true);
  });
});
