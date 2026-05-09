import { OntologyGraph, SimulationResult } from './types';
import { AppNode } from '../store/flowStore';

export function evaluate(graph: OntologyGraph, context: Record<string, number | string>): SimulationResult {
  const result: SimulationResult = {
    firedEvents: [],
    skippedConditions: []
  };

  const entities = graph.nodes.filter(n => n.data.kind === 'entity');
  
  const getChildren = (nodeId: string) => {
    return graph.edges
      .filter(e => e.source === nodeId)
      .map(e => graph.nodes.find(n => n.id === e.target))
      .filter((n): n is AppNode => n !== undefined);
  };

  for (const entity of entities) {
    const conditions = getChildren(entity.id).filter(n => n.data.kind === 'condition');
    
    for (const condition of conditions) {
      if (condition.data.kind !== 'condition') continue;
      
      const data = condition.data;
      const rules = data.rules;
      
      if (rules.length === 0) {
        result.skippedConditions.push({ conditionNodeId: condition.id, reason: 'Empty rules' });
        continue;
      }

      const evaluatedRules = rules.map(rule => {
        const ctxValue = context[rule.field];
        if (ctxValue === undefined) return false;
        
        let rv = rule.value;
        if (typeof rv === 'string' && context[rv] !== undefined) {
          rv = context[rv];
        }
        
        const numCtx = Number(ctxValue);
        const numVal = Number(rv);
        const isNum = !isNaN(numCtx) && !isNaN(numVal) && String(rv).trim() !== '' && String(ctxValue).trim() !== '';
        
        switch (rule.operator) {
          case '<': return isNum ? numCtx < numVal : ctxValue < rv;
          case '>': return isNum ? numCtx > numVal : ctxValue > rv;
          case '==': return String(ctxValue) === String(rv);
          case '!=': return String(ctxValue) !== String(rv);
          case '<=': return isNum ? numCtx <= numVal : ctxValue <= rv;
          case '>=': return isNum ? numCtx >= numVal : ctxValue >= rv;
          default: return false;
        }
      });

      let conditionResult = false;
      if (data.logic === 'AND') {
        conditionResult = evaluatedRules.every(r => r === true);
      } else {
        conditionResult = evaluatedRules.some(r => r === true);
      }

      if (conditionResult) {
        const events = getChildren(condition.id).filter(n => n.data.kind === 'event');
        for (const event of events) {
          if (event.data.kind !== 'event') continue;
          
          result.firedEvents.push({
            eventNodeId: event.id,
            eventName: event.data.label,
            channels: event.data.channels,
            message: event.data.message,
            evaluatedPath: [entity.id, condition.id, event.id],
            contextSnapshot: context,
          });
        }
      } else {
        result.skippedConditions.push({
          conditionNodeId: condition.id,
          reason: `Evaluated to false (Logic: ${data.logic})`
        });
      }
    }
  }

  return result;
}
