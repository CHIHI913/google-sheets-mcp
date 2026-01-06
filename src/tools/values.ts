import { z } from "zod";
import { getSheetsClient } from "../client.js";

export const readValuesSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  range: z.string().describe("A1表記の範囲（例: 'シート1!A1:C10'）"),
};

export const appendValuesSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  range: z.string().describe("追記先のA1表記の範囲（例: 'シート1!A:C'）"),
  values: z.array(z.array(z.string())).describe("追記するデータの2次元配列"),
};

export const updateValuesSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  range: z.string().describe("更新先のA1表記の範囲（例: 'シート1!A1:C10'）"),
  values: z.array(z.array(z.string())).describe("書き込むデータの2次元配列"),
};

export async function readValues(spreadsheetId: string, range: string) {
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

export async function appendValues(spreadsheetId: string, range: string, values: string[][]) {
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

export async function updateValues(spreadsheetId: string, range: string, values: string[][]) {
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
