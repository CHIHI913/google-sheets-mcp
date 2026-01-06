#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { google, sheets_v4 } from "googleapis";
import { z } from "zod";

// Initialize Google Sheets API client
async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Tool implementations
async function getSheetMetadata(spreadsheetId: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties.title,sheets.properties.title,sheets.properties.sheetId",
  });

  return {
    title: response.data.properties?.title,
    sheets: response.data.sheets?.map((sheet) => ({
      sheetId: sheet.properties?.sheetId,
      title: sheet.properties?.title,
    })),
  };
}

async function readValues(spreadsheetId: string, range: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
  });

  return {
    range: response.data.range,
    values: response.data.values || [],
  };
}

async function appendValues(spreadsheetId: string, range: string, values: string[][]) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return {
    updatedRange: response.data.updates?.updatedRange,
    updatedRows: response.data.updates?.updatedRows,
    updatedColumns: response.data.updates?.updatedColumns,
    updatedCells: response.data.updates?.updatedCells,
  };
}

async function updateValues(spreadsheetId: string, range: string, values: string[][]) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return {
    updatedRange: response.data.updatedRange,
    updatedRows: response.data.updatedRows,
    updatedColumns: response.data.updatedColumns,
    updatedCells: response.data.updatedCells,
  };
}

async function createSpreadsheet(title: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title,
      },
    },
  });

  return {
    spreadsheetId: response.data.spreadsheetId,
    spreadsheetUrl: response.data.spreadsheetUrl,
  };
}

// MCP Server setup
const server = new McpServer({
  name: "google-sheets-mcp",
  version: "1.0.0",
});

// Register tools
server.registerTool(
  "get_sheet_metadata",
  {
    description: "Get the structure of a spreadsheet including title and list of sheet tabs",
    inputSchema: {
      spreadsheetId: z.string().describe("The ID of the spreadsheet"),
    },
  },
  async ({ spreadsheetId }) => {
    try {
      const result = await getSheetMetadata(spreadsheetId);
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
);

server.registerTool(
  "read_values",
  {
    description: "Read values from a specified range in a spreadsheet. Returns formatted values (calculation results, not formulas).",
    inputSchema: {
      spreadsheetId: z.string().describe("The ID of the spreadsheet"),
      range: z.string().describe("The A1 notation range to read (e.g., 'Sheet1!A1:C10')"),
    },
  },
  async ({ spreadsheetId, range }) => {
    try {
      const result = await readValues(spreadsheetId, range);
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
);

server.registerTool(
  "append_values",
  {
    description: "Append rows of data to the end of a specified range in a spreadsheet",
    inputSchema: {
      spreadsheetId: z.string().describe("The ID of the spreadsheet"),
      range: z.string().describe("The A1 notation range where data will be appended (e.g., 'Sheet1!A:C')"),
      values: z.array(z.array(z.string())).describe("2D array of values to append"),
    },
  },
  async ({ spreadsheetId, range, values }) => {
    try {
      const result = await appendValues(spreadsheetId, range, values);
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
);

server.registerTool(
  "update_values",
  {
    description: "Update (overwrite) values in a specified range in a spreadsheet",
    inputSchema: {
      spreadsheetId: z.string().describe("The ID of the spreadsheet"),
      range: z.string().describe("The A1 notation range to update (e.g., 'Sheet1!A1:C10')"),
      values: z.array(z.array(z.string())).describe("2D array of values to write"),
    },
  },
  async ({ spreadsheetId, range, values }) => {
    try {
      const result = await updateValues(spreadsheetId, range, values);
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
);

server.registerTool(
  "create_spreadsheet",
  {
    description: "Create a new spreadsheet with the given title",
    inputSchema: {
      title: z.string().describe("The title of the new spreadsheet"),
    },
  },
  async ({ title }) => {
    try {
      const result = await createSpreadsheet(title);
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
