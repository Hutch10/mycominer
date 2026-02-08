import { SOPDocument, SOPVersion } from './sopTypes';
import { addSopLog } from './sopLog';

export function createNewVersion(doc: SOPDocument, changeSummary: SOPVersion['changeSummary'], lifecycle: SOPVersion['lifecycle']): SOPDocument {
  const version: SOPVersion = {
    versionId: `v${Date.now()}`,
    createdAt: new Date().toISOString(),
    author: 'system',
    lifecycle,
    changeSummary,
  };
  const updated: SOPDocument = { ...doc, version };
  addSopLog({ category: 'version', message: `Version created ${version.versionId}`, context: { sopId: doc.sopId, versionId: version.versionId }, details: changeSummary });
  return updated;
}

export function promoteLifecycle(doc: SOPDocument, lifecycle: SOPVersion['lifecycle']): SOPDocument {
  const changeSummary = { summary: `Lifecycle updated to ${lifecycle}`, highlights: [] };
  return createNewVersion(doc, changeSummary, lifecycle);
}

export function rollbackVersion(current: SOPDocument, previous: SOPDocument): SOPDocument {
  addSopLog({ category: 'rollback', message: `Rollback to ${previous.version.versionId}`, context: { sopId: current.sopId, versionId: previous.version.versionId } });
  return { ...previous };
}
