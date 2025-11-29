export class HubSpotClient {
  private accessToken: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // メール一覧取得
  async listEmails(limit = 20, offset = 0) {
    return this.request(`/marketing/v3/emails?limit=${limit}&offset=${offset}`);
  }

  // メール詳細取得
  async getEmail(emailId: string) {
    return this.request(`/marketing/v3/emails/${emailId}`);
  }

  // メール作成
  async createEmail(data: any) {
    return this.request('/marketing/v3/emails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // メール更新
  async updateEmail(emailId: string, data: any) {
    return this.request(`/marketing/v3/emails/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // メール複製
  async cloneEmail(emailId: string, newName: string) {
    const original = await this.getEmail(emailId);
    return this.createEmail({
      name: newName,
      subject: original.subject,
      emailBody: original.emailBody,
      emailType: original.emailType || 'BATCH_EMAIL',
      state: 'DRAFT',
    });
  }

  // メール下書き作成（よく使う簡易版）
  async createDraftEmail(name: string, subject: string, htmlBody: string) {
    return this.createEmail({
      name,
      subject,
      emailBody: htmlBody,
      emailType: 'BATCH_EMAIL',
      state: 'DRAFT',
    });
  }
}
