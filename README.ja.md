# HubSpot Email MCP Server

HubSpot Marketing Email API用のModel Context Protocol (MCP) サーバーです。Claude DesktopからHubSpotのマーケティングメールを管理できます。

## 機能

- メール一覧の取得
- メール詳細の取得
- メール下書きの作成
- メールの更新

**注意:** 誤送信防止のため、メール送信機能は実装していません。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. HubSpot Access Token の取得

1. HubSpotアカウントにログイン
2. 開発 > 旧アプリ に移動
3. 新しいアプリを作成
4. スコープを設定: `content`（Marketing Emails用）
5. Access Tokenをコピー（`pat-na1-...` 形式）

### 3. ビルド

```bash
npm run build
```

### 4. Claude Desktopの設定

`~/Library/Application Support/Claude/claude_desktop_config.json` を編集：

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

### 5. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを完全に再起動してください。

## 使用方法

Claude Desktopで以下のように使用できます：

```
「HubSpotでメルマガの下書きを作成して。
件名: 新製品のご案内
本文: 製品Aの新バージョンをリリースしました」

「先週作成したメール一覧を見せて」

「メールID 12345 の内容を確認して」
```

## 開発

### MCP Inspectorでのテスト

公式のinspectorツールでMCPサーバーをテストできます：

```bash
npx @modelcontextprotocol/inspector npx -y /path/to/hubspot-email-mcp
```

Inspector UIで `HUBSPOT_ACCESS_TOKEN` 環境変数を設定して、HubSpotアカウントでテストしてください。

### ローカルテスト

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

## ライセンス

MIT
