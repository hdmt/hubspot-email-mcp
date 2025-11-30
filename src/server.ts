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

  constructor(accessToken: string) {
    this.hubspot = new HubSpotClient(accessToken);
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
    // ツール一覧
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_emails',
          description: 'HubSpotのマーケティングメール一覧を取得',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: '取得件数（デフォルト: 20）' },
              offset: { type: 'number', description: 'オフセット（デフォルト: 0）' },
              sort: { type: 'string', description: 'ソート項目 (name, createdAt, updatedAt, createdBy, updatedBy)。降順は -createdAt のように - を付ける' },
            },
          },
        },
        {
          name: 'get_email',
          description: '特定のメールの詳細情報を取得',
          inputSchema: {
            type: 'object',
            properties: {
              emailId: { type: 'string', description: 'メールID' },
            },
            required: ['emailId'],
          },
        },
        {
          name: 'create_draft_email',
          description: 'メールの下書きを作成。既存メールを複製する場合はget_emailで取得したcontent等を渡す',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'キャンペーン名' },
              subject: { type: 'string', description: 'メール件名' },
              htmlBody: { type: 'string', description: 'HTML本文（シンプルなメール用）' },
              content: { type: 'object', description: 'メールコンテンツ構造（flexAreas, widgets等を含む詳細設定）' },
              from: { type: 'object', description: '送信者情報 { fromName, replyTo }' },
              subscriptionDetails: { type: 'object', description: '配信設定 { officeLocationId }' },
              to: { type: 'object', description: '送信先設定 { contactIlsLists, suppressGraymail }' },
            },
            required: ['name', 'subject'],
          },
        },
        {
          name: 'update_email',
          description: 'メールを更新',
          inputSchema: {
            type: 'object',
            properties: {
              emailId: { type: 'string', description: 'メールID' },
              name: { type: 'string', description: 'キャンペーン名' },
              subject: { type: 'string', description: 'メール件名' },
              htmlBody: { type: 'string', description: 'HTML本文（シンプルなメール用）' },
              content: { type: 'object', description: 'メールコンテンツ構造（flexAreas, widgets等を含む詳細設定）' },
            },
            required: ['emailId'],
          },
        },
              ],
    }));

    // ツール実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_emails': {
            const args = ListEmailsSchema.parse(request.params.arguments);
            const result = await this.hubspot.listEmails(args.limit, args.offset, args.sort);
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
                  text: `✅ メール下書きを作成しました\nID: ${result.id}\n名前: ${args.name}\n件名: ${args.subject}`,
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
                { type: 'text', text: `✅ メールを更新しました\n${JSON.stringify(result, null, 2)}` },
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
              text: `❌ エラー: ${error instanceof Error ? error.message : String(error)}`,
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
