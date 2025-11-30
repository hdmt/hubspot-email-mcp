import { z } from 'zod';

export const ListEmailsSchema = z.object({
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  sort: z.string().optional().describe('ソート項目 (name, createdAt, updatedAt, createdBy, updatedBy)。降順は -createdAt のように - を付ける'),
});

export const GetEmailSchema = z.object({
  emailId: z.string(),
});

export const CreateDraftEmailSchema = z.object({
  name: z.string().describe('メールキャンペーンの名前'),
  subject: z.string().describe('メールの件名'),
  htmlBody: z.string().optional().describe('HTMLメール本文（シンプルなメール用）'),
  content: z.any().optional().describe('メールコンテンツ構造（flexAreas, widgets等を含む詳細設定）'),
  from: z.any().optional().describe('送信者情報 { fromName, replyTo }'),
  subscriptionDetails: z.any().optional().describe('配信設定 { officeLocationId }'),
  to: z.any().optional().describe('送信先設定 { contactIlsLists, suppressGraymail }'),
});

export const UpdateEmailSchema = z.object({
  emailId: z.string(),
  name: z.string().optional(),
  subject: z.string().optional(),
  htmlBody: z.string().optional().describe('HTMLメール本文（シンプルなメール用）'),
  content: z.any().optional().describe('メールコンテンツ構造（flexAreas, widgets等を含む詳細設定）'),
});

