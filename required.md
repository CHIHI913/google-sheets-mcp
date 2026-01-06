# 社内用 Google Sheets MCPサーバー 要件定義書

| 項目 | 内容 |
| --- | --- |
| **プロジェクト名** | Internal Google Sheets MCP Server |
| **バージョン** | 1.0.0 |
| **ステータス** | 確定 (Final) |
| **作成日** | 2026-01-06 |
| **認証方式** | Service Account (Server-to-Server) |

---

## 1. プロジェクト概要

### 1.1 背景と目的

Google Workspace向けの「純正」MCPサーバーが存在しない現状において、サードパーティ製ツールのセキュリティリスク（サプライチェーン攻撃等）を回避するため、Google公式のMCP SDKおよびGoogle APIクライアントを用いた、社内独自の「純正」MCPサーバーを構築する。
本サーバーはClaude Code等のAIエージェントから利用され、業務のスプレッドシート操作をセキュアに自動化することを目的とする。

### 1.2 スコープ

* **対象:** Google Sheets API v4
* **範囲:** 指定されたスプレッドシートの読み書き、新規作成
* **除外:** Google Drive全体の検索（セキュリティ担保のため、ID/URL指定を必須とする）

---

## 2. システムアーキテクチャ

### 2.1 構成図

AIエージェント(Host)とGoogle APIの間に位置し、標準入出力(stdio)を介して通信を行う。

### 2.2 技術スタック

* **Runtime:** Node.js (v18以上)
* **Language:** TypeScript
* **SDK:**
* MCP Protocol: `@modelcontextprotocol/sdk` (Google推奨の公式SDK)
* Google API: `googleapis` (Google純正クライアント)


* **Validation:** `zod` (スキーマ定義・バリデーション)
* **Package Manager:** `npm`

---

## 3. 機能要件 (Functional Requirements)

### 3.1 ツール定義 (Tools)

AIモデルに対して公開する関数（ツール）の一覧。

| ツール名 | 機能概要 | 入力パラメータ | 目的/備考 |
| --- | --- | --- | --- |
| `get_sheet_metadata` | シート構成の取得 | `spreadsheetId` | タブ名一覧を取得し、構造を把握する。 |
| `read_values` | データの読み込み | `spreadsheetId`, `range` | 書式は無視し、計算後の「値」のみを取得する。 |
| `append_values` | データの追記 | `spreadsheetId`, `range`, `values` | 指定範囲の末尾に行を追加する。 |
| `update_values` | データの更新 | `spreadsheetId`, `range`, `values` | 特定のセル範囲を上書き保存する。 |
| `create_spreadsheet` | 新規作成 | `title` | 新規ファイルを作成し、IDとURLを返す。 |

### 3.2 データ処理仕様

* **フォーマット:** `FORMATTED_VALUE` を採用。セルの色やフォント情報は取得せず、表示されている値（文字列・数値）のみを扱う。
* **数式:** `read` 時は計算結果を返す。`write` 時は数式文字列（`=SUM(...)`等）の入力を許容する。
* **入力モード:** `USER_ENTERED` を採用。入力された文字列（例: "100"）は、Google Sheets側で自動的に数値として解釈させる。

---

## 4. 非機能要件 (Non-Functional Requirements)

### 4.1 セキュリティと認証

* **Service Account認証:**
* OAuth 2.0（ユーザーログイン）は使用しない。
* GCPプロジェクトで発行されたService Accountキー（JSON）を使用する。
* キーファイルへのパスは環境変数 `GOOGLE_APPLICATION_CREDENTIALS` で注入する。


* **アクセス境界:**
* Service Accountのメールアドレスに対し、ユーザーが明示的に「共有」したシートのみアクセス可能とする。
* 意図しないファイルへのアクセスを防ぐため、Drive全体のリスト権限は持たせない。



### 4.2 実行環境

* ローカルマシン（Mac/Linux/Windows）上のNode.jsプロセスとして動作。
* Docker等のコンテナ化は必須としない（`uvx` または `node` コマンドでの直接実行を想定）。

---

## 5. インターフェース詳細設計 (Schema)

各ツールの入出力定義（Zod Schema）。

### 5.1 `get_sheet_metadata`

* **Input:**
```json
{ "spreadsheetId": "string (必須)" }

```


* **Output:** シートタイトルと、各タブ（Sheet）のタイトル一覧を含むJSON。

### 5.2 `read_values`

* **Input:**
```json
{
  "spreadsheetId": "string (必須)",
  "range": "string (必須, 例: 'Sheet1!A1:C10')"
}

```


* **Output:** 2次元配列 `string[][]`。

### 5.3 `append_values` / `update_values`

* **Input:**
```json
{
  "spreadsheetId": "string (必須)",
  "range": "string (必須)",
  "values": "string[][] (必須, 書き込むデータ)"
}

```


* **Output:** 更新されたセル数、更新範囲などのステータス情報。

### 5.4 `create_spreadsheet`

* **Input:**
```json
{ "title": "string (必須)" }

```


* **Output:** `spreadsheetId` および `spreadsheetUrl`。

---

## 6. 制約事項 (Constraints)

以下の機能は、セキュリティおよび複雑性排除の観点から**実装しない**。

1. **Drive検索機能:** ファイル名によるあいまい検索（`list_files`等）は実装しない。ユーザーは必ずURLまたはIDを提供する必要がある。
2. **書式設定機能:** セルの色変更、太字、罫線などのデザイン操作機能は提供しない。
3. **シート操作:** タブの追加・削除・リネーム機能は今回のスコープ外とする（必要であればv1.1以降で検討）。

---

## 7. 開発・導入フロー

1. **GCP設定:**
* Google Cloud Consoleにてプロジェクト作成。
* Google Sheets API 有効化。
* Service Account作成＆キー(JSON)ダウンロード。


2. **実装:**
* TypeScriptによるサーバーコーディング。
* `npm run build` によるビルド。


3. **配備:**
* Claude Code設定ファイル (`claude.json`) への登録。
* 対象スプレッドシートへのService Accountメールアドレス招待。



---