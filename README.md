# Google Spreadsheet MCP Server

Google スプレッドシートを操作するための MCP (Model Context Protocol) サーバーです。
Claude Code などの AI エージェントからスプレッドシートの読み書きが可能になります。

## 機能

### データ操作

| ツール | 説明 |
|--------|------|
| `get_sheet_metadata` | スプレッドシートのタイトルとシート（タブ）一覧を取得 |
| `read_values` | 指定範囲のデータを読み込み |
| `append_values` | 指定範囲の末尾にデータを追記 |
| `update_values` | 指定範囲のデータを上書き更新 |

### シート管理

| ツール | 説明 |
|--------|------|
| `add_sheet` | 新しいシート（タブ）を追加 |
| `delete_sheet` | シート（タブ）を削除 |
| `rename_sheet` | シート（タブ）の名前を変更 |

### 行列操作

| ツール | 説明 |
|--------|------|
| `insert_rows` | 指定位置に空の行を挿入 |
| `insert_columns` | 指定位置に空の列を挿入 |
| `delete_rows` | 指定範囲の行を削除 |
| `delete_columns` | 指定範囲の列を削除 |

## セットアップ

### 1. GCP プロジェクト設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **Google Sheets API** を有効化
   ```
   APIs & Services → Enable APIs → 「Google Sheets API」を検索 → 有効化
   ```

### 2. Service Account 作成

1. IAM & Admin → Service Accounts → Create Service Account
2. 名前を入力（例: `sheets-mcp`）→ Create → Done
3. 作成した Service Account をクリック → Keys → Add Key → Create new key → JSON
4. ダウンロードした JSON ファイルを安全な場所に保存

### 3. ビルド

```bash
pnpm install
pnpm run build
```

### 4. Claude Code 設定

`.mcp.json` をプロジェクトルートに作成:

```json
{
  "mcpServers": {
    "google-spreadsheet": {
      "command": "node",
      "args": ["/path/to/google-spreadsheet-mcp/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

### 5. スプレッドシートへのアクセス許可

操作したいスプレッドシートを Service Account のメールアドレスに共有してください。

```
例: sheets-mcp@your-project.iam.gserviceaccount.com
```

- 読み取りのみ → 閲覧者
- 編集も行う → 編集者

## 使用例

### シート情報を取得

```
スプレッドシート ID: 1eAlelv1TxTOtwEv3ux24x8Whhgm7MfpV9fnjq6N_Hz8 の情報を取得して
```

### データを読み込み

```
シート1 の A1:C10 を読み込んで
```

### データを追記

```
シート1 に以下のデータを追加して:
- 山田, 25, エンジニア
- 佐藤, 30, デザイナー
```

### データを更新

```
A1:B2 を以下に更新して:
- 名前, 年齢
- 田中, 28
```

### シートを追加

```
「売上データ」という名前のシートを追加して
```

### シートの名前を変更

```
シート1 を「顧客リスト」に名前変更して
```

## スプレッドシート ID の取得方法

URL から取得できます:

```
https://docs.google.com/spreadsheets/d/【この部分がID】/edit
```

## 制限事項

- 新規スプレッドシートの作成は非対応（Service Account の制限）
- 書式設定（フォント、色など）は非対応

## ライセンス

MIT
