import { z } from 'zod';

export const ListEmailsSchema = z.object({
  limit: z.number().optional().default(20).describe('Number of emails to return (default 20)'),
  after: z.string().optional().describe('Pagination cursor from the previous response (paging.next.after)'),
  sort: z.string().optional().describe('Sort field: name, createdAt, updatedAt, createdBy, updatedBy. Prefix with - for descending, e.g. -createdAt'),
  createdAfter: z.string().optional().describe('Only emails created after this ISO-8601 timestamp, e.g. 2026-01-01T00:00:00Z'),
  createdBefore: z.string().optional().describe('Only emails created before this ISO-8601 timestamp'),
});

export const GetEmailSchema = z.object({
  emailId: z.string(),
});

export const CreateDraftEmailSchema = z.object({
  name: z.string().describe('Campaign name (internal email name in HubSpot)'),
  subject: z.string().describe('Email subject line'),
  htmlBody: z.string().optional().describe('HTML body (for simple emails)'),
  content: z.any().optional().describe('Email content structure (flexAreas, widgets, and other HubSpot editor settings)'),
  from: z.any().optional().describe('Sender info { fromName, replyTo }'),
  subscriptionDetails: z.any().optional().describe('Subscription/delivery settings { officeLocationId }'),
  to: z.any().optional().describe('Recipient settings { contactIlsLists, suppressGraymail }'),
});

export const UpdateEmailSchema = z.object({
  emailId: z.string(),
  name: z.string().optional(),
  subject: z.string().optional(),
  htmlBody: z.string().optional().describe('HTML body (for simple emails)'),
  content: z.any().optional().describe('Email content structure (flexAreas, widgets, and other HubSpot editor settings)'),
});

