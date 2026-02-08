import { CopilotContext, CopilotQuery, CopilotSuggestion } from './copilotTypes';
import { findPlaybooksByTags, listPlaybooks } from './playbookLibrary';
import { logCopilot } from './copilotSessionLog';

export interface SuggestionAssemblerInput {
  query: CopilotQuery;
}

function determineTags(query: CopilotQuery): string[] {
  const tags = new Set<string>();
  const text = query.text.toLowerCase();
  if (text.includes('temperature') || text.includes('over temp')) tags.add('temperature');
  if (text.includes('telemetry')) tags.add('telemetry');
  if (text.includes('deviation')) tags.add('deviation');
  if (text.includes('capa')) tags.add('capa');
  if (text.includes('cleaning') || text.includes('sanitize')) tags.add('cleaning');
  if (text.includes('maintenance')) tags.add('maintenance');
  if (text.includes('autoclave')) tags.add('autoclave');
  if (text.includes('resource') || text.includes('shortage')) tags.add('resource');
  query.context.tags?.forEach((t) => tags.add(t));
  return Array.from(tags);
}

function scopeFilter<T extends { tenantId: string }>(items: T[], ctx: CopilotContext): T[] {
  const allowed = new Set([ctx.tenantId, ...(ctx.federatedTenantIds ?? [])]);
  return items.filter((i) => allowed.has(i.tenantId));
}

export function assembleSuggestions(input: SuggestionAssemblerInput): CopilotSuggestion[] {
  const tags = determineTags(input.query);
  const candidates = tags.length
    ? findPlaybooksByTags(tags, input.query.context.tenantId, input.query.context.federatedTenantIds)
    : listPlaybooks(input.query.context.tenantId, input.query.context.federatedTenantIds);

  const scoped = scopeFilter(candidates, input.query.context);
  const suggestions: CopilotSuggestion[] = scoped.map((pb) => ({
    suggestionId: `cs-${pb.playbookId}-${Date.now()}`,
    playbookId: pb.playbookId,
    title: pb.title,
    steps: pb.steps,
    scope: input.query.scope,
    tenantId: input.query.context.tenantId,
    federated: pb.tenantId !== input.query.context.tenantId,
    reason: tags.length ? `Matched tags: ${tags.join(', ')}` : 'Tenant-scoped playbook',
  }));

  logCopilot('suggestion', 'Suggestions assembled', { query: input.query.text, count: suggestions.length });
  return suggestions;
}
