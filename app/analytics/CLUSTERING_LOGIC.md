# Phase 39: Clustering Logic & Pattern Derivation
## Technical Deep Dive

---

## Clustering Architecture

### Deterministic Grouping vs. ML Clustering
Traditional ML clustering uses distance metrics and probabilistic assignment:
- **Problem**: "Why did incident X group with incident Y?" → Requires math explanation
- **Risk**: Hallucination if model finds spurious correlations

Phase 39 uses **exact-match grouping**:
- Group incidents by **identical** characteristic property
- No threshold, no probability, no distance metric
- Every group has a clear, auditable reason

---

## Clustering Strategies

### 1. Event Sequence Clustering
**Concept**: Group incidents with identical event type progression

**Example**:
```
Incident A: [environmentalException, deviation, SOPChange, CAPAAction, complianceEvent]
Incident B: [environmentalException, deviation, SOPChange, CAPAAction, complianceEvent]
Incident C: [resourceAllocationEvent, workflowExecutionEvent, SOPChange]

Cluster 1: "Environmental spike → deviation → SOP → CAPA → compliance"
  - Members: Incident A, B
  - Frequency: 2
  - Events: 5

Cluster 2: "Resource allocation → workflow → SOP update"
  - Members: Incident C
  - Frequency: 1
  - Events: 3
```

**Extraction Logic**:
```typescript
function extractEventSequence(events: TimelineEvent[]): string[] {
  return events
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((e) => e.type);
}

// Result: ['environmentalException', 'deviation', 'SOPChange', ...]
```

**Clustering**:
```
Group incidents by sequence string:
  'environmentalException→deviation→SOPChange→CAPAAction→complianceEvent' → [Inc A, Inc B]
  'resourceAllocationEvent→workflowExecutionEvent→SOPChange' → [Inc C]
```

**Why This Works**:
- Captures incident lifecycle progression
- Identical sequences = likely same root cause and remediation
- Fully deterministic and auditable
- No threshold or tuning required

---

### 2. Severity Transition Clustering
**Concept**: Group incidents with identical severity progression

**Example**:
```
Incident A: severity progression [high, high, medium, info]
Incident B: severity progression [high, high, medium, info]
Incident C: severity progression [info, low, low]

Cluster 1: "High → High → Medium → Info"
  - Members: Incident A, B
  - Frequency: 2

Cluster 2: "Info → Low → Low"
  - Members: Incident C
  - Frequency: 1
```

**Extraction Logic**:
```typescript
function extractSeverityTransition(events: TimelineEvent[]): string[] {
  return events
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((e) => e.severity);
}

// Result: ['high', 'high', 'medium', 'info']
```

**Use Cases**:
- Find incidents with similar escalation patterns
- Identify "slow burn" vs. "spike" incidents
- Detect severity trends within incident lifecycle

**Why This Works**:
- Severity transition pattern indicates operational response effectiveness
- Same pattern = similar response strategy was effective
- Reveals whether issues escalate or de-escalate consistently

---

### 3. SOP Reference Clustering
**Concept**: Group incidents referencing the same SOPs

**Example**:
```
Incident A references: [sop-hvac-emergency, sop-thermal-management]
Incident B references: [sop-hvac-emergency, sop-thermal-management]
Incident C references: [sop-resource-sourcing]

Cluster 1: "HVAC Emergency & Thermal Management SOPs"
  - Members: Incident A, B
  - Frequency: 2
  - SOPs: [sop-hvac-emergency, sop-thermal-management]

Cluster 2: "Resource Sourcing SOP"
  - Members: Incident C
  - Frequency: 1
  - SOPs: [sop-resource-sourcing]
```

**Extraction Logic**:
```typescript
function extractCommonSOPReferences(events: TimelineEvent[]): string[] {
  const sopRefs: string[] = [];
  for (const event of events) {
    if (event.linkedIds) {
      sopRefs.push(...event.linkedIds.filter((id) => id.startsWith('sop-')));
    }
  }
  return [...new Set(sopRefs)];  // Deduplicate
}

// Result: ['sop-hvac-emergency', 'sop-thermal-management']
```

**Use Cases**:
- Find incidents requiring same procedures
- Identify which SOPs are frequently invoked together
- Detect SOP adequacy issues (same SOP used frequently = incomplete?)

**Why This Works**:
- SOPs are deterministic and auditable
- Shared SOP references indicate similar operational domain
- Links incident patterns to documented procedures

---

### 4. CAPA Pattern Clustering
**Concept**: Group incidents with identical corrective/preventive action themes

**Example**:
```
Incident A: CAPA themes: ["Replace HVAC Filter", "Calibrate Thermostat"]
Incident B: CAPA themes: ["Replace HVAC Filter", "Calibrate Thermostat"]
Incident C: CAPA themes: ["Source Agar Media", "Update Procurement SOP"]

Cluster 1: "HVAC Filter & Thermostat Calibration"
  - Members: Incident A, B
  - Frequency: 2
  - Themes: ["Replace HVAC Filter", "Calibrate Thermostat"]

Cluster 2: "Resource Procurement"
  - Members: Incident C
  - Frequency: 1
  - Themes: ["Source Agar Media", "Update Procurement SOP"]
```

**Extraction Logic**:
```typescript
function extractCommonCAPAThemes(events: TimelineEvent[]): string[] {
  const capaThemes: string[] = [];
  for (const event of events) {
    if (event.type === 'CAPAAction') {
      // Parse "CAPA capa-id: Theme description"
      const match = event.description.match(/CAPA[^:]*:\s*([^(]+)/);
      if (match) capaThemes.push(match[1].trim());
    }
  }
  return [...new Set(capaThemes)];
}

// Result: ["Replace HVAC Filter", "Calibrate Thermostat"]
```

**Use Cases**:
- Identify recurrent remediation approaches
- Detect when same action doesn't prevent recurrence (low effectiveness)
- Find CAPAs that appear in multiple incident patterns

**Why This Works**:
- CAPA themes show human operators' remediation choices
- Identical themes indicate same problem → same solution
- Repeated CAPAs suggest inadequate root cause treatment

---

### 5. Telemetry Anomaly Clustering
**Concept**: Group incidents with identical environmental anomaly types

**Example**:
```
Incident A: Anomalies: ['temp-spike']
Incident B: Anomalies: ['temp-spike']
Incident C: Anomalies: ['humidity-drift', 'pressure-anomaly']

Cluster 1: "Temperature Spike"
  - Members: Incident A, B
  - Frequency: 2
  - Anomalies: ['temp-spike']

Cluster 2: "Humidity & Pressure Anomaly"
  - Members: Incident C
  - Frequency: 1
  - Anomalies: ['humidity-drift', 'pressure-anomaly']
```

**Extraction Logic**:
```typescript
function extractTelemetryAnomalies(events: TimelineEvent[]): string[] {
  const anomalies: string[] = [];
  for (const event of events) {
    if (event.type === 'environmentalException') {
      if (event.description.includes('Temperature')) anomalies.push('temp-spike');
      if (event.description.includes('humidity')) anomalies.push('humidity-drift');
      if (event.description.includes('pressure')) anomalies.push('pressure-anomaly');
    }
  }
  return [...new Set(anomalies)];
}

// Result: ['temp-spike']
```

**Use Cases**:
- Identify facility environmental patterns
- Link specific anomaly types to incident outcomes
- Detect correlation between sensor types and incident severity

**Why This Works**:
- Telemetry anomalies are objective, sensor-derived facts
- Same anomaly type = likely same environmental cause
- Reveals which environmental factors trigger incidents

---

### 6. Facility Context Clustering
**Concept**: Group incidents by facility location

**Example**:
```
Facility-01 incidents: [Inc A, Inc B, Inc D]
Facility-02 incidents: [Inc C, Inc E]
Facility-03 incidents: [Inc F]

Cluster 1: "Facility-01"
  - Members: Inc A, B, D
  - Frequency: 3
  - Facility: facility-01

Cluster 2: "Facility-02"
  - Members: Inc C, E
  - Frequency: 2
  - Facility: facility-02

Cluster 3: "Facility-03"
  - Members: Inc F
  - Frequency: 1
  - Facility: facility-03
```

**Use Cases**:
- Analyze facility-level operational rhythms
- Identify facilities with higher incident frequency
- Compare incident patterns across locations
- Detect facility-specific issues (e.g., equipment aging)

**Why This Works**:
- Facility context captures environmental and infrastructure factors
- Same facility = shared equipment, trained staff, similar processes
- Reveals whether incidents are facility-specific or systematic

---

## Pattern Derivation

### From Clusters to Patterns

**Step 1: Group Identical Clusters**
```
All clusters generated (from all 6 strategies):
  - Cluster A1 (event-seq): "Environmental spike → ... → stability"
  - Cluster A2 (event-seq): "Environmental spike → ... → stability"
  - Cluster B1 (severity): "high → medium → info"
  - Cluster C1 (sop-ref): [sop-hvac, sop-thermal]

Group by characteristicSequence:
  Group 1: [A1, A2] (identical event sequences)
  Group 2: [B1] (severity patterns)
  Group 3: [C1] (SOP patterns)
```

**Step 2: Derive Pattern Signature**
```
For Group 1 (identical event sequences):
  PatternSignature {
    name: "Environmental spike → deviation → CAPA → stabilization",
    characteristicSequence: ['environmentalException', 'deviation', 'CAPAAction', ...],
    representativeIncidents: [incident-2026-01-15, incident-2026-01-16],
    clusterCount: 2,
    incidentsUnderPattern: 2 (total incidents in both clusters),
    severityProfile: {
      high: 0.5,
      medium: 0.3,
      info: 0.2
    },
    confidence: 2/totalClusters,  // e.g., 0.15 if 13+ clusters exist
    telemetrySignatures: ['temp-spike'],
    commonSOPReferences: ['sop-hvac-emergency'],
    commonCAPAActions: ['Replace HVAC Filter', 'Calibrate Thermostat'],
  }
```

**Step 3: Calculate Confidence Score**
```typescript
function calculateConfidence(group: Cluster[], allClusters: Cluster[]): number {
  return Math.min(
    1,
    Math.max(
      0,
      group.length / Math.max(1, allClusters.length)
    )
  );
}

// If 2 clusters out of 13 match a sequence:
// confidence = 2 / 13 = 0.15 (low confidence, rare pattern)

// If 8 clusters out of 13 match:
// confidence = 8 / 13 = 0.62 (high confidence, common pattern)
```

**Interpretation**:
- **Confidence > 0.5**: Dominant pattern (occurs in >50% of clusters)
- **Confidence 0.3-0.5**: Significant pattern (30-50% recurrence)
- **Confidence < 0.3**: Minority pattern (rare, but documented)

---

## Similarity Metrics (Not Used for Grouping, Reference Only)

For analysis purposes, similarity between two events can be computed:

```typescript
function computeSimilarityScore(event1: TimelineEvent, event2: TimelineEvent): number {
  let score = 0;
  const maxScore = 5;

  if (event1.type === event2.type) score++;               // Event type match
  if (event1.severity === event2.severity) score++;       // Severity match
  if (event1.facilityId === event2.facilityId) score++;   // Facility match
  if (event1.roomId === event2.roomId) score++;           // Room match
  if (event1.sourceSystem === event2.sourceSystem) score++; // Source system match

  return score / maxScore;  // 0-1 score
}

// Example:
// Score = 5/5 = 1.0 (identical events)
// Score = 3/5 = 0.6 (partial match)
// Score = 0/5 = 0.0 (completely different)
```

**Note**: This similarity metric is **informational only**. Clustering uses exact-match grouping, not similarity thresholds.

---

## Cluster Filtering by Scope

### Scope Definition
```typescript
interface AnalyticsScope {
  tenantId: string;              // Required: MUST match
  facilityId?: string;           // Optional: filter by facility
  roomId?: string;               // Optional: filter by room
  timeRange?: {                  // Optional: filter by timestamp range
    startTime: string;
    endTime: string;
  };
  severity?: string[];           // Optional: filter by severity levels
  eventTypes?: string[];         // Optional: filter by event types
}
```

### Filtering Logic
```typescript
function filterClustersByScope(clusters: IncidentCluster[], scope: AnalyticsScope): IncidentCluster[] {
  return clusters.filter((cluster) => {
    // Tenant match REQUIRED
    if (cluster.tenantId !== scope.tenantId) return false;

    // Facility filter (optional)
    if (scope.facilityId && cluster.facilityId !== scope.facilityId) return false;

    // Severity filter (optional) - cluster must contain at least one severity in filter
    if (scope.severity && scope.severity.length > 0) {
      const hasSeverity = cluster.severityTransitionPattern.some((sev) =>
        scope.severity!.includes(sev)
      );
      if (!hasSeverity) return false;
    }

    return true;
  });
}
```

**Examples**:
```typescript
// Query 1: All clusters for a tenant
scope: { tenantId: 'tenant-alpha' }
// Returns: All clusters

// Query 2: High-severity clusters only
scope: {
  tenantId: 'tenant-alpha',
  severity: ['high', 'critical']
}
// Returns: Clusters with at least one high/critical event

// Query 3: Specific facility only
scope: {
  tenantId: 'tenant-alpha',
  facilityId: 'facility-01'
}
// Returns: Clusters from facility-01
```

---

## Trend Analysis from Clusters

### Incident Frequency Trend
```typescript
function computeIncidentFrequency(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  aggregationLevel: 'daily' | 'weekly' | 'monthly'
): TrendDataPoint[] {
  // Group clusters by date
  const dateMap: Map<string, number> = new Map();

  for (const cluster of clusters) {
    const date = new Date(cluster.createdAt);
    let key = '';

    if (aggregationLevel === 'daily') {
      key = date.toISOString().split('T')[0];  // 'YYYY-MM-DD'
    } else if (aggregationLevel === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0] + '-w';
    } else if (aggregationLevel === 'monthly') {
      key = date.toISOString().slice(0, 7);  // 'YYYY-MM'
    }

    // Count incidents in this cluster
    dateMap.set(key, (dateMap.get(key) || 0) + cluster.frequencyInDataset);
  }

  // Convert to sorted trend data points
  return Array.from(dateMap.entries())
    .map(([timestamp, value]) => ({
      timestamp,
      value,
      label: `${timestamp}: ${value} incidents`
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

// Result:
// [
//   { timestamp: '2026-01-15', value: 2 },
//   { timestamp: '2026-01-16', value: 2 },
//   { timestamp: '2026-01-17', value: 1 }
// ]
```

### Cross-Facility Comparison
```typescript
function computeCrossFacilityComparison(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  metric: 'incident-frequency' | 'capa-density' | 'sop-reference-density'
): TrendDataPoint[] {
  const facilityMap: Map<string, number> = new Map();

  for (const cluster of clusters) {
    const facilityId = cluster.facilityId || 'unknown-facility';

    let value = 0;
    if (metric === 'incident-frequency') {
      value = cluster.frequencyInDataset;
    } else if (metric === 'capa-density') {
      value = cluster.commonCAPAThemes.length;
    } else if (metric === 'sop-reference-density') {
      value = cluster.commonSOPReferences.length;
    }

    facilityMap.set(facilityId, (facilityMap.get(facilityId) || 0) + value);
  }

  return Array.from(facilityMap.entries())
    .map(([facilityId, value]) => ({
      timestamp: facilityId,
      value,
      label: `${facilityId}: ${value}`
    }))
    .sort((a, b) => b.value - a.value);  // Sorted descending
}

// Result:
// [
//   { timestamp: 'facility-01', value: 5 },
//   { timestamp: 'facility-02', value: 3 },
//   { timestamp: 'facility-03', value: 1 }
// ]
```

---

## Example End-to-End Analysis

### Input: 13 Timeline Events
```
evt-1: WF start
evt-2: Telemetry (normal)
evt-3: Environmental exception (TEMP HIGH)
evt-4: Deviation logged
evt-5: SOP reference
evt-6: CAPA logged
evt-7: Telemetry (normal)
...
(Similar events repeat at different facilities/times)
```

### Step 1: Group into Incidents
```
incident-thread-1: [evt-1, evt-2, evt-3, evt-4, evt-5, evt-6, evt-7]
incident-thread-2: [evt-8, evt-9, evt-10, evt-11, evt-12]
incident-thread-3: [evt-13]
```

### Step 2: Cluster by Event Sequence
```
Cluster 1 (event-seq):
  archetype: "Environmental spike → deviation → SOP → CAPA → stabilization"
  members: [incident-thread-1, incident-thread-2]
  frequency: 2

Cluster 2 (event-seq):
  archetype: "Resource allocation → workflow delay"
  members: [incident-thread-3]
  frequency: 1
```

### Step 3: Derive Patterns
```
Pattern 1:
  name: "Environmental spike → deviation → CAPA → stabilization"
  characteristicSequence: ['environmentalException', 'deviation', 'SOPChange', 'CAPAAction', 'complianceEvent']
  clusterCount: 1
  incidentsUnderPattern: 2
  confidence: 1/2 = 0.5 (50%)
  commonSOPReferences: ['sop-hvac-emergency']
  commonCAPAActions: ['Replace HVAC Filter', 'Calibrate Thermostat']
```

### Step 4: Analyze Trends
```
Trend 1 - Incident Frequency (daily):
  dataPoints: [
    { timestamp: '2026-01-15', value: 1 },
    { timestamp: '2026-01-16', value: 1 },
    { timestamp: '2026-01-17', value: 1 }
  ]
  insights: [
    "Average incident frequency: 1.0",
    "Peak: 1",
    "Lowest: 1",
    "Recent trend: stable"
  ]

Trend 2 - Facility Comparison:
  dataPoints: [
    { timestamp: 'facility-01', value: 2 },
    { timestamp: 'facility-02', value: 1 }
  ]
  insights: ["Facility-01 has 2x incident rate of Facility-02"]
```

### Output: AnalyticsResult
```typescript
{
  resultId: 'result-...',
  clusters: [Cluster1, Cluster2],
  patterns: [Pattern1],
  trends: [TrendFreq, TrendFacility],
  referenceIndex: {
    incidentIds: ['incident-thread-1', 'incident-thread-2', 'incident-thread-3'],
    deviationIds: ['dev-alpha-1', 'dev-alpha-2'],
    capaIds: ['capa-alpha-1', 'capa-alpha-2'],
    sopIds: ['sop-hvac-emergency', 'sop-alpha-template'],
    facilityIds: ['facility-01', 'facility-02']
  },
  executionTimeMs: 45
}
```

---

**End of Technical Deep Dive**

This clustering architecture ensures:
✅ **Full Auditability**: Every cluster has a clear, deterministic reason for existence
✅ **No Hallucination**: Only groups real incidents, never invents
✅ **Operator-Friendly**: Archetype names are human-readable
✅ **Scalable**: Linear time in number of incidents
✅ **Flexible**: 6 different clustering strategies for different analysis needs
