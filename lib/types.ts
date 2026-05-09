export type NodeKind = 'entity' | 'condition' | 'event';

export type EntityField = {
  name: string;       // ej: "stockActual"
  type: 'number' | 'string' | 'boolean';
  defaultValue?: string | number | boolean;
};

export type ConditionRule = {
  field: string;      // ej: "stockActual"
  operator: '<' | '>' | '==' | '!=' | '<=' | '>=';
  value: number | string;
};

export type EventChannel = 'webhook' | 'email' | 'slack';

export type OntologyNodeData =
  | { kind: 'entity'; label: string; description: string; fields: EntityField[] }
  | { kind: 'condition'; label: string; rules: ConditionRule[]; logic: 'AND' | 'OR' }
  | { kind: 'event'; label: string; message: string; channels: EventChannel[] };

export type OntologyEdgeData = {
  label?: string;     // ej: "tiene", "afecta"
};

export type SimulatedEvent = {
  id: string;
  ontologyId: string;
  timestamp: string;
  triggeredBy: string;   // id del nodo EventNode
  eventName: string;
  context: Record<string, unknown>;
};
