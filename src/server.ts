import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HubSpotClient } from './hubspot/client.js';
import {
  ListEmailsSchema,
  GetEmailSchema,
  CreateDraftEmailSchema,
  UpdateEmailSchema,
} from './tools/types.js';

export class HubSpotEmailMCPServer {
  private server: Server;
  private hubspot: HubSpotClient;

  constructor(accessToken: string, portalId?: string) {
    this.hubspot = new HubSpotClient(accessToken, portalId);
    this.server = new Server(
      {
        name: 'hubspot-email-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_emails',
          description: 'List HubSpot marketing emails. Each item includes a clickable hubspotUrl when HUBSPOT_PORTAL_ID is configured. Use createdAfter/createdBefore to narrow by date, then call get_email to read full content.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Number of emails to return (default 20)' },
              after: { type: 'string', description: 'Pagination cursor from a previous response (paging.next.after)' },
              sort: { type: 'string', description: 'Sort field: name, createdAt, updatedAt, createdBy, updatedBy. Prefix with - for descending, e.g. -createdAt' },
              createdAfter: { type: 'string', description: 'Only emails created after this ISO-8601 timestamp, e.g. 2026-01-01T00:00:00Z' },
              createdBefore: { type: 'string', description: 'Only emails created before this ISO-8601 timestamp' },
            },
          },
        },
        {
          name: 'get_email',
          description: 'Get full details for a HubSpot marketing email by ID. Includes content, subject, and hubspotUrl when HUBSPOT_PORTAL_ID is configured.',
          inputSchema: {
            type: 'object',
            properties: {
              emailId: { type: 'string', description: 'HubSpot marketing email ID' },
            },
            required: ['emailId'],
          },
        },
        {
          name: 'create_draft_email',
          description: 'Create a draft marketing email. To clone an existing email, pass content and other fields from get_email.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Campaign name (internal email name in HubSpot)' },
              subject: { type: 'string', description: 'Email subject line' },
              htmlBody: { type: 'string', description: 'HTML body (for simple emails)' },
              content: { type: 'object', description: 'Email content structure (flexAreas, widgets, and other HubSpot editor settings)' },
              from: { type: 'object', description: 'Sender info { fromName, replyTo }' },
              subscriptionDetails: { type: 'object', description: 'Subscription/delivery settings { officeLocationId }' },
              to: { type: 'object', description: 'Recipient settings { contactIlsLists, suppressGraymail }' },
            },
            required: ['name', 'subject'],
          },
        },
        {
          name: 'update_email',
          description: 'Update an existing marketing email (name, subject, htmlBody, or content).',
          inputSchema: {
            type: 'object',
            properties: {
              emailId: { type: 'string', description: 'HubSpot marketing email ID' },
              name: { type: 'string', description: 'Campaign name (internal email name in HubSpot)' },
              subject: { type: 'string', description: 'Email subject line' },
              htmlBody: { type: 'string', description: 'HTML body (for simple emails)' },
              content: { type: 'object', description: 'Email content structure (flexAreas, widgets, and other HubSpot editor settings)' },
            },
            required: ['emailId'],
          },
        },
              ],
    }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_emails': {
            const args = ListEmailsSchema.parse(request.params.arguments);
            const result = await this.hubspot.listEmails({
              limit: args.limit,
              after: args.after,
              sort: args.sort,
              createdAfter: args.createdAfter,
              createdBefore: args.createdBefore,
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'get_email': {
            const args = GetEmailSchema.parse(request.params.arguments);
            const result = await this.hubspot.getEmail(args.emailId);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'create_draft_email': {
            const args = CreateDraftEmailSchema.parse(request.params.arguments);
            const result = await this.hubspot.createDraftEmail(
              args.name,
              args.subject,
              {
                htmlBody: args.htmlBody,
                content: args.content,
                from: args.from,
                subscriptionDetails: args.subscriptionDetails,
                to: args.to,
              }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Draft email created\nID: ${result.id}\nName: ${args.name}\nSubject: ${args.subject}`,
                },
              ],
            };
          }

          case 'update_email': {
            const args = UpdateEmailSchema.parse(request.params.arguments);
            const updateData: any = {};
            if (args.name) updateData.name = args.name;
            if (args.subject) updateData.subject = args.subject;
            if (args.htmlBody) updateData.emailBody = args.htmlBody;
            if (args.content) updateData.content = args.content;

            const result = await this.hubspot.updateEmail(args.emailId, updateData);
            return {
              content: [
                { type: 'text', text: `✅ Email updated\n${JSON.stringify(result, null, 2)}` },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('HubSpot Email MCP Server running on stdio');
  }
}
