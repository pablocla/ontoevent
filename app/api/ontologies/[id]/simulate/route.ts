import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { simulatedEvents } from '../../../../../lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const simulateBodySchema = z.object({
  contextInput: z.record(z.string(), z.unknown()),
  resultJson: z.unknown(), // we stringify it
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const body = await req.json();
    const parsed = simulateBodySchema.parse(body);

    const eventId = uuidv4();
    const now = new Date().toISOString();

    await db.insert(simulatedEvents).values({
      id: eventId,
      ontologyId: p.id,
      firedAt: now,
      contextInput: JSON.stringify(parsed.contextInput),
      resultJson: JSON.stringify(parsed.resultJson),
    });

    return NextResponse.json({ id: eventId, message: 'Simulation saved' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
