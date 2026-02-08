import { assembleSuggestions } from './suggestionAssembler';
import { CopilotContext, CopilotQuery, CopilotScope, CopilotSession, CopilotSuggestion } from './copilotTypes';
import { logCopilot } from './copilotSessionLog';

export interface CopilotEngineState {
  session: CopilotSession;
  suggestions: CopilotSuggestion[];
}

function startSession(scope: CopilotScope, context: CopilotContext): CopilotSession {
  const session: CopilotSession = {
    sessionId: `cps-${Date.now()}`,
    startedAt: new Date().toISOString(),
    context,
    scope,
  };
  logCopilot('session', 'Copilot session started', { sessionId: session.sessionId, scope, tenant: context.tenantId });
  return session;
}

export function runCopilot(query: CopilotQuery): CopilotEngineState {
  const session = startSession(query.scope, query.context);
  const suggestions = assembleSuggestions({ query });
  logCopilot('query', 'Copilot query processed', { sessionId: session.sessionId, text: query.text, suggestions: suggestions.length });
  return { session, suggestions };
}
