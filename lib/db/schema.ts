import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const ontologies = sqliteTable('ontologies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status', { enum: ['draft', 'published'] }).default('draft').notNull(),
  graphJson: text('graph_json').notNull(), // JSON stringified node and edge data
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  ontologyId: text('ontology_id').notNull(),
  timestamp: text('timestamp').notNull(),
  triggeredBy: text('triggered_by').notNull(),
  eventName: text('event_name').notNull(),
  context: text('context').notNull(), // JSON stringified context used during the simulation
});

export const simulatedEvents = sqliteTable('simulatedEvents', {
  id: text('id').primaryKey(),
  ontologyId: text('ontology_id').notNull(),
  firedAt: text('fired_at').notNull(),
  contextInput: text('context_input').notNull(),
  resultJson: text('result_json').notNull(),
});
