import { NarrativeContext, NarrativeSection, NarrativeTarget } from './narrativeTypes';

interface TemplateResult {
  title: string;
  body: string;
  safetyNote?: string;
}

type TemplateGenerator = (ctx: NarrativeContext) => TemplateResult;

const templates: Record<NarrativeTarget, TemplateGenerator[]> = {
  forecast: [
    (ctx) => ({
      title: 'Forecast Inputs',
      body: `Forecast ${ctx.targetId ?? ''} is grounded in telemetry streams and workflow schedules available to tenant ${ctx.tenantId}. No predictive biology; only scheduled operational data is considered.`.trim(),
    }),
  ],
  sandboxScenario: [
    (ctx) => ({
      title: 'Scenario Summary',
      body: `Sandbox scenario ${ctx.targetId ?? ''} reflects modeled steps and parameters from existing workflows and SOPs. No execution occurs; results are illustrative only.`,
    }),
  ],
  sop: [
    (ctx) => ({
      title: 'SOP Structure',
      body: `SOP ${ctx.targetId ?? ''} is referenced for procedural guidance. All steps map to approved instructions; no automated actions are triggered.`,
    }),
  ],
  complianceEvent: [
    (ctx) => ({
      title: 'Compliance Event Context',
      body: `Compliance event ${ctx.targetId ?? ''} is explained using recorded deviations, CAPA links, and related SOP references under tenant ${ctx.tenantId}.`.
      trim(),
    }),
  ],
  deviation: [
    (ctx) => ({
      title: 'Deviation Context',
      body: `Deviation ${ctx.targetId ?? ''} is linked to associated workflows, equipment, and SOPs for tenant ${ctx.tenantId}. Suggested follow-up references CAPA where present.`,
    }),
  ],
  capa: [
    (ctx) => ({
      title: 'CAPA Context',
      body: `CAPA ${ctx.targetId ?? ''} references its originating deviation and the SOP steps governing remediation for tenant ${ctx.tenantId}.`,
    }),
  ],
  KGNeighborhood: [
    (ctx) => ({
      title: 'Knowledge Graph Neighborhood',
      body: `Neighborhood view for node ${ctx.targetId ?? ''} shows adjacent entities (workflows, SOPs, telemetry, compliance) permitted under scope ${ctx.scope}. No cross-tenant data beyond federation allow-list.`,
    }),
  ],
  KGPath: [
    (ctx) => ({
      title: 'Knowledge Graph Path',
      body: `Path explanation follows deterministic edges between entities reachable under scope ${ctx.scope}. No inferred relationships are added.`,
    }),
  ],
  searchResultSet: [
    (ctx) => ({
      title: 'Search Result Rationale',
      body: `Results reflect deterministic filters (types, facilities, tenants, tags) and knowledge graph matches for tenant ${ctx.tenantId}. Federated items, if any, are read-only.`,
    }),
  ],
  copilotSuggestion: [
    (ctx) => ({
      title: 'Copilot Guidance Rationale',
      body: `Copilot suggestions are sourced from registered playbooks, SOPs, and workflows. No steps are created or executed; all are traceable to existing records for tenant ${ctx.tenantId}.`,
      safetyNote: 'Review safety notes in referenced SOPs before acting.',
    }),
  ],
};

export function getTemplates(target: NarrativeTarget): TemplateGenerator[] {
  return templates[target] ?? [];
}

export function renderTemplates(target: NarrativeTarget, ctx: NarrativeContext): NarrativeSection[] {
  return getTemplates(target).map((fn) => {
    const res = fn(ctx);
    return { title: res.title, body: res.body, safetyNote: res.safetyNote };
  });
}
