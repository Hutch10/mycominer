/**
 * Federation Organization Registration API
 * POST /api/federation/org/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { federationRegistry } from '@/app/federation/services/FederationRegistry';
import { withApiMutationAuth } from '@/app/lib/auth/withApiMutationAuth';

const RegisterOrgSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['grower', 'research', 'supplier', 'government', 'cooperative']),
  country: z.string().length(2),
  region: z.string().min(2).max(50),
  metadata: z.object({
    website: z.string().url().optional(),
    contactEmail: z.string().email(),
    description: z.string().min(10).max(500),
    size: z.enum(['small', 'medium', 'large', 'enterprise']),
    certifications: z.array(z.string()).default([]),
  }),
});

export const POST = withApiMutationAuth(
  async (request: Request) => {
    try {
      const body = await request.json();
      const validated = RegisterOrgSchema.parse(body);

      const organization = await federationRegistry.registerOrganization({
        ...validated,
        verificationStatus: 'pending',
        verificationLevel: 'basic',
      });

      return NextResponse.json(
        {
          success: true,
          organization: {
            id: organization.id,
            name: organization.name,
            type: organization.type,
            verificationStatus: organization.verificationStatus,
            trustScore: organization.trustScore,
            joinedAt: organization.joinedAt,
          },
          message: 'Organization registered successfully. Verification pending.',
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      console.error('[API] Registration error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Registration failed',
        },
        { status: 500 }
      );
    }
  },
  {
    requireOrg: true,
    rateLimit: 'mutation',
    auditEventType: 'federation_org_registered',
    auditPayload: (_req, ctx) => ({ orgId: ctx.orgId }),
  }
);
