import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDeploymentFingerprint } from '../app/lib/deploy/fingerprint.ts';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('deployment fingerprint', () => {
  beforeEach(() => {
    process.env.MYCOMINER_GIT_COMMIT = 'abc123';
    process.env.MYCOMINER_BUILD_TIMESTAMP = '2026-06-16T00:00:00.000Z';
    process.env.MYCOMINER_MIGRATION_VERSION = '008';
    process.env.MYCOMINER_ARCHITECTURE_VERSION = '1.0';
    process.env.MYCOMINER_RELEASE_CHANNEL = 'release-candidate';
    process.env.NODE_ENV = 'production';
  });

  it('returns configured build metadata', () => {
    const fp = getDeploymentFingerprint();
    assert.equal(fp.git_commit, 'abc123');
    assert.equal(fp.build_timestamp, '2026-06-16T00:00:00.000Z');
    assert.equal(fp.migration_version, '008');
    assert.equal(fp.architecture_version, '1.0');
    assert.equal(fp.release_channel, 'release-candidate');
    assert.equal(fp.environment, 'production');
  });

  it('defaults migration version and release channel', () => {
    delete process.env.MYCOMINER_MIGRATION_VERSION;
    delete process.env.MYCOMINER_ARCHITECTURE_VERSION;
    delete process.env.MYCOMINER_RELEASE_CHANNEL;
    const fp = getDeploymentFingerprint();
    assert.equal(fp.migration_version, '008');
    assert.equal(fp.architecture_version, '1.0');
    assert.equal(fp.release_channel, 'release-candidate');
  });
});
