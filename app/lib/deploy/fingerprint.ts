export type DeploymentFingerprint = {
  git_commit: string;
  build_timestamp: string;
  migration_version: string;
  architecture_version: string;
  release_channel: string;
  environment: string;
};

export function getDeploymentFingerprint(): DeploymentFingerprint {
  const gitCommit =
    process.env.MYCOMINER_GIT_COMMIT?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    'unknown';

  const buildTimestamp =
    process.env.MYCOMINER_BUILD_TIMESTAMP?.trim() ||
    process.env.VERCEL_DEPLOYMENT_CREATED_AT?.trim() ||
    'unknown';

  return {
    git_commit: gitCommit,
    build_timestamp: buildTimestamp,
    migration_version: process.env.MYCOMINER_MIGRATION_VERSION?.trim() || '008',
    architecture_version:
      process.env.MYCOMINER_ARCHITECTURE_VERSION?.trim() || '1.0',
    release_channel:
      process.env.MYCOMINER_RELEASE_CHANNEL?.trim() || 'release-candidate',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'non-production',
  };
}
