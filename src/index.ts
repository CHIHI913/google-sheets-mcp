#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getSheetMetadata,
  getSheetMetadataSchema,
  readValues,
  readValuesSchema,
  appendValues,
  appendValuesSchema,
  updateValues,
  updateValuesSchema,
  addSheet,
  addSheetSchema,
  deleteSheet,
  deleteSheetSchema,
  renameSheet,
  renameSheetSchema,
} from "./tools/index.js";

const server = new McpServer({
  name: "google-sheets-mcp",
  version: "1.0.0",
});

// Helper for error handling
async function handleToolCall<T>(
  fn: () => Promise<T>
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  try {
    const result = await fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
}

// ツール登録
server.registerTool(
  "get_sheet_metadata",
  {
    description: "スプレッドシートのタイトルとシート（タブ）一覧を取得",
    inputSchema: getSheetMetadataSchema,
  },
  async ({ spreadsheetId }) => handleToolCall(() => getSheetMetadata(spreadsheetId))
);

server.registerTool(
  "read_values",
  {
    description: "指定範囲のデータを読み込み（計算結果を取得、数式は取得しない）",
    inputSchema: readValuesSchema,
  },
  async ({ spreadsheetId, range }) => handleToolCall(() => readValues(spreadsheetId, range))
);

server.registerTool(
  "append_values",
  {
    description: "指定範囲の末尾にデータを追記",
    inputSchema: appendValuesSchema,
  },
  async ({ spreadsheetId, range, values }) =>
    handleToolCall(() => appendValues(spreadsheetId, range, values))
);

server.registerTool(
  "update_values",
  {
    description: "指定範囲のデータを上書き更新",
    inputSchema: updateValuesSchema,
  },
  async ({ spreadsheetId, range, values }) =>
    handleToolCall(() => updateValues(spreadsheetId, range, values))
);

server.registerTool(
  "add_sheet",
  {
    description: "新しいシート（タブ）を追加",
    inputSchema: addSheetSchema,
  },
  async ({ spreadsheetId, title }) => handleToolCall(() => addSheet(spreadsheetId, title))
);

server.registerTool(
  "delete_sheet",
  {
    description: "シート（タブ）を削除",
    inputSchema: deleteSheetSchema,
  },
  async ({ spreadsheetId, sheetId }) => handleToolCall(() => deleteSheet(spreadsheetId, sheetId))
);

server.registerTool(
  "rename_sheet",
  {
    description: "シート（タブ）の名前を変更",
    inputSchema: renameSheetSchema,
  },
  async ({ spreadsheetId, sheetId, newTitle }) =>
    handleToolCall(() => renameSheet(spreadsheetId, sheetId, newTitle))
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Sheets MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
