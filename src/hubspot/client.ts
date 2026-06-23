export class HubSpotClient {
  private accessToken: string;
  private baseUrl = 'https://api.hubapi.com';
  private portalId?: string;

  constructor(accessToken: string, portalId?: string) {
    this.accessToken = accessToken;
    this.portalId = portalId;
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

  // Build a clickable HubSpot app URL for a marketing email.
  // Pattern: https://app.hubspot.com/email/{portalId}/details/{emailId}
  // Returns undefined when portalId is not configured.
  buildEmailUrl(emailId: string | number): string | undefined {
    if (!this.portalId || emailId === undefined || emailId === null) {
      return undefined;
    }
    return `https://app.hubspot.com/email/${this.portalId}/details/${emailId}`;
  }

  // Decorate an email object (or each item in a paged result) with hubspotUrl.
  private decorate(result: any): any {
    if (!result) return result;
    if (Array.isArray(result.results)) {
      return {
        ...result,
        results: result.results.map((e: any) => ({
          ...e,
          hubspotUrl: this.buildEmailUrl(e?.id),
        })),
      };
    }
    if (result.id !== undefined) {
      return { ...result, hubspotUrl: this.buildEmailUrl(result.id) };
    }
    return result;
  }

  // List marketing emails.
  // HubSpot's /marketing/v3/emails supports limit + after (cursor) pagination
  // and createdAfter / createdBefore ISO-8601 date filters.
  async listEmails(opts: {
    limit?: number;
    after?: string;
    sort?: string;
    createdAfter?: string;
    createdBefore?: string;
  } = {}) {
    const params = new URLSearchParams();
    params.set('limit', String(opts.limit ?? 20));
    if (opts.after) params.set('after', opts.after);
    if (opts.sort) params.set('sort', opts.sort);
    if (opts.createdAfter) params.set('createdAfter', opts.createdAfter);
    if (opts.createdBefore) params.set('createdBefore', opts.createdBefore);
    const result = await this.request(`/marketing/v3/emails?${params.toString()}`);
    return this.decorate(result);
  }

  // Get a single marketing email.
  async getEmail(emailId: string) {
    const result = await this.request(`/marketing/v3/emails/${emailId}`);
    return this.decorate(result);
  }

  // Create a marketing email.
  async createEmail(data: any) {
    return this.decorate(await this.request('/marketing/v3/emails', {
      method: 'POST',
      body: JSON.stringify(data),
    }));
  }

  // Update a marketing email.
  async updateEmail(emailId: string, data: any) {
    return this.decorate(await this.request(`/marketing/v3/emails/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }));
  }

  // Create a draft marketing email.
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
    if (options?.htmlBody) data.emailBody = options.htmlBody;
    if (options?.content) data.content = options.content;
    if (options?.from) data.from = options.from;
    if (options?.subscriptionDetails) data.subscriptionDetails = options.subscriptionDetails;
    if (options?.to) data.to = options.to;
    return this.createEmail(data);
  }
}
