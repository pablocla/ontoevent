import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { ontologies } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ontologySchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(['draft', 'published']).default('draft'),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['entity', 'condition', 'event']),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.string(), z.unknown())
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional()
  }))
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    
    const [ontology] = await db.select().from(ontologies).where(eq(ontologies.id, id));
    
    if (!ontology) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const graph = JSON.parse(ontology.graphJson);
    return NextResponse.json({
      id: ontology.id,
      name: ontology.name,
      status: ontology.status,
      nodes: graph.nodes,
      edges: graph.edges,
      createdAt: ontology.createdAt,
      updatedAt: ontology.updatedAt
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    
    const body = await req.json();
    const parsed = ontologySchema.parse(body);

    const now = new Date().toISOString();

    await db.update(ontologies).set({
      name: parsed.name,
      status: parsed.status,
      graphJson: JSON.stringify({ nodes: parsed.nodes, edges: parsed.edges }),
      updatedAt: now,
    }).where(eq(ontologies.id, id));

    return NextResponse.json({ message: 'Ontology updated' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    
    await db.delete(ontologies).where(eq(ontologies.id, id));
    return NextResponse.json({ message: 'Ontology deleted' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
