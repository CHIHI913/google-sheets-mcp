import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "./handler.js";
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
  deleteRows,
  deleteRowsSchema,
  deleteColumns,
  deleteColumnsSchema,
  insertRows,
  insertRowsSchema,
  insertColumns,
  insertColumnsSchema,
} from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "google-sheets-mcp",
    version: "1.0.0",
    description: "Googleスプレッドシートの読み書き・シート管理を行う",
  });

  registerTools(server);

  return server;
}

function registerTools(server: McpServer): void {
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

  server.registerTool(
    "delete_rows",
    {
      description: "指定範囲の行を削除",
      inputSchema: deleteRowsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, endIndex }) =>
      handleToolCall(() => deleteRows(spreadsheetId, sheetId, startIndex, endIndex))
  );

  server.registerTool(
    "delete_columns",
    {
      description: "指定範囲の列を削除",
      inputSchema: deleteColumnsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, endIndex }) =>
      handleToolCall(() => deleteColumns(spreadsheetId, sheetId, startIndex, endIndex))
  );

  server.registerTool(
    "insert_rows",
    {
      description: "指定位置に空の行を挿入",
      inputSchema: insertRowsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, numRows }) =>
      handleToolCall(() => insertRows(spreadsheetId, sheetId, startIndex, numRows))
  );

  server.registerTool(
    "insert_columns",
    {
      description: "指定位置に空の列を挿入",
      inputSchema: insertColumnsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, numColumns }) =>
      handleToolCall(() => insertColumns(spreadsheetId, sheetId, startIndex, numColumns))
  );
}
