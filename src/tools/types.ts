import { z } from 'zod';

export const ListEmailsSchema = z.object({
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
});

export const GetEmailSchema = z.object({
  emailId: z.string(),
});

export const CreateDraftEmailSchema = z.object({
  name: z.string().describe('メールキャンペーンの名前'),
  subject: z.string().describe('メールの件名'),
  htmlBody: z.string().describe('HTMLメール本文'),
});

export const UpdateEmailSchema = z.object({
  emailId: z.string(),
  name: z.string().optional(),
  subject: z.string().optional(),
  htmlBody: z.string().optional(),
});

export const CloneEmailSchema = z.object({
  emailId: z.string().describe('複製元のメールID'),
  newName: z.string().describe('複製後のキャンペーン名'),
});
