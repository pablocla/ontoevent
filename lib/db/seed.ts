import { db } from './index';
import { ontologies } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const existing = await db.select().from(ontologies);
  if (existing.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding MVP Ontology...');

  const graph = {
    nodes: [
      {
        id: '1',
        type: 'entity',
        position: { x: 50, y: 150 },
        data: {
          kind: 'entity',
          label: 'Producto',
          description: 'Catálogo de productos e inventario',
          fields: [
            { name: 'stockActual', type: 'number' },
            { name: 'umbralMinimo', type: 'number' },
            { name: 'demandaDiaria', type: 'number' },
          ]
        }
      },
      {
        id: '2',
        type: 'condition',
        position: { x: 350, y: 150 },
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
        id: '3',
        type: 'event',
        position: { x: 700, y: 150 },
        data: {
          kind: 'event',
          label: 'REPOSICION_URGENTE',
          message: 'Stock por debajo del umbral con demanda alta. Generar orden.',
          channels: ['webhook', 'slack']
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'tiene' },
      { id: 'e2-3', source: '2', target: '3', label: 'dispara' }
    ]
  };

  await db.insert(ontologies).values({
    id: uuidv4(),
    name: 'Reposición Urgente Inteligente',
    status: 'published',
    graphJson: JSON.stringify(graph),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('Seed completed.');
}

seed().catch(console.error);
