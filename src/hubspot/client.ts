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
  async listEmails(limit = 20, offset = 0, sort?: string) {
    let url = `/marketing/v3/emails?limit=${limit}&offset=${offset}`;
    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }
    return this.request(url);
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

  // メール下書き作成
  async createDraftEmail(
    name: string,
    subject: string,
    options?: {
      htmlBody?: string;
      content?: any;
      from?: any;
      subscriptionDetails?: any;
      to?: any;
    }
  ) {
    const data: any = {
      name,
      subject,
      emailType: 'BATCH_EMAIL',
      state: 'DRAFT',
    };
    if (options?.htmlBody) {
      data.emailBody = options.htmlBody;
    }
    if (options?.content) {
      data.content = options.content;
    }
    if (options?.from) {
      data.from = options.from;
    }
    if (options?.subscriptionDetails) {
      data.subscriptionDetails = options.subscriptionDetails;
    }
    if (options?.to) {
      data.to = options.to;
    }
    return this.createEmail(data);
  }
}
