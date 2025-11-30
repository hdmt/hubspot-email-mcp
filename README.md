# HubSpot Email MCP Server

A Model Context Protocol (MCP) server for the HubSpot Marketing Email API. Manage HubSpot marketing emails from Claude Desktop.

[日本語版 README](README.ja.md)

## Features

- List marketing emails
- Get email details
- Create email drafts
- Update emails

**Note:** This server does not include email sending functionality to prevent accidental sends.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get HubSpot Access Token

1. Log in to your HubSpot account
2. Go to Development > Legacy Apps (開発 > 旧アプリ)
3. Create a new app
4. Set the required scopes: `content` (for Marketing Emails)
5. Copy the Access Token (`pat-na1-...` format)

### 3. Build

```bash
npm run build
```

### 4. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hubspot-email": {
      "command": "npx",
      "args": ["-y", "/path/to/hubspot-email-mcp"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

### 5. Restart Claude Desktop

Restart Claude Desktop completely to apply the settings.

## Usage

You can use it in Claude Desktop like this:

```
"Create a newsletter draft in HubSpot.
Subject: New Product Announcement
Body: We have released a new version of Product A"

"Show me the list of emails created last week"

"Check the content of email ID 12345"
```

## Development

### Testing with MCP Inspector

You can test the MCP server using the official inspector tool:

```bash
npx @modelcontextprotocol/inspector npx -y /path/to/hubspot-email-mcp
```

Set the `HUBSPOT_ACCESS_TOKEN` environment variable in the inspector UI to test with your HubSpot account.

### Local Testing

```bash
npm run dev
```

### Build

```bash
npm run build
```

## License

MIT
