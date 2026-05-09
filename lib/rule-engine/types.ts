import { AppNode } from '../store/flowStore';
import { Edge } from 'reactflow';
import { EventChannel } from '../types';

export type OntologyGraph = {
  nodes: AppNode[];
  edges: Edge[];
};

export type SimulationResult = {
  firedEvents: Array<{
    eventNodeId: string;
    eventName: string;
    channels: EventChannel[];
    message: string;
    evaluatedPath: string[];
    contextSnapshot: Record<string, unknown>;
  }>;
  skippedConditions: Array<{
    conditionNodeId: string;
    reason: string;
  }>;
};

export type ValidationResult = {
  valid: boolean;
  errors: Array<{
    nodeId: string | null;
    code: 'CYCLE' | 'ORPHAN_EVENT' | 'ORPHAN_CONDITION' | 'EMPTY_RULES' | 'ISOLATED_NODE';
    message: string;
  }>;
};
