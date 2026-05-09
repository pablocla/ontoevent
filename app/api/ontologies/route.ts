import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { ontologies } from '../../../lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

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

export async function GET() {
  try {
    const list = await db.select({ id: ontologies.id, name: ontologies.name, updatedAt: ontologies.updatedAt }).from(ontologies);
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ontologySchema.parse(body);

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(ontologies).values({
      id,
      name: parsed.name,
      status: parsed.status,
      graphJson: JSON.stringify({ nodes: parsed.nodes, edges: parsed.edges }),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id, message: 'Ontology created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
