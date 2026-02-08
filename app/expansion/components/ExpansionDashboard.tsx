import { AuditRecord, ClusterGeneratorReport, DiffChunk, GeneratedContent, MetadataAuditReport, TagSuggestionReport } from '../engine/expansionTypes';
import { ContentPreviewCard } from './ContentPreviewCard';
import { MetadataAuditPanel } from './MetadataAuditPanel';
import { TagSuggestionPanel } from './TagSuggestionPanel';
import { ClusterSuggestionPanel } from './ClusterSuggestionPanel';
import { DiffViewer } from './DiffViewer';

interface ExpansionDashboardProps {
  contents: GeneratedContent[];
  metadataReports: MetadataAuditReport[];
  tagReports: TagSuggestionReport[];
  clusterReport: ClusterGeneratorReport;
  auditRecords: AuditRecord[];
  diffs: DiffChunk[];
}

export function ExpansionDashboard({ contents, metadataReports, tagReports, clusterReport, auditRecords, diffs }: ExpansionDashboardProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contents.map((content) => (
          <ContentPreviewCard key={content.slug} content={content} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metadataReports.map((report, idx) => (
          <MetadataAuditPanel key={`meta-${idx}`} report={report} />
        ))}
        {tagReports.map((report, idx) => (
          <TagSuggestionPanel key={`tags-${idx}`} report={report} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClusterSuggestionPanel report={clusterReport} />
        <DiffViewer diff={diffs} />
      </section>

      <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Log</h3>
        <div className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-200">
          {auditRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded border border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-semibold">{record.targetPath}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{record.summary}</p>
              </div>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">{record.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
