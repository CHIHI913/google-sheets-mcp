import { z } from "zod";
import { getSheetsClient } from "../client.js";

export const addSheetSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  title: z.string().describe("新しいシートの名前"),
};

export const deleteSheetSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("削除するシートのID（get_sheet_metadataで取得可能）"),
};

export const renameSheetSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("名前変更するシートのID（get_sheet_metadataで取得可能）"),
  newTitle: z.string().describe("新しいシート名"),
};

export async function addSheet(spreadsheetId: string, title: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title,
            },
          },
        },
      ],
    },
  });

  const addedSheet = response.data.replies?.[0]?.addSheet?.properties;
  return {
    sheetId: addedSheet?.sheetId,
    title: addedSheet?.title,
  };
}

export async function deleteSheet(spreadsheetId: string, sheetId: number) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteSheet: {
            sheetId,
          },
        },
      ],
    },
  });

  return { deleted: true, sheetId };
}

export async function renameSheet(spreadsheetId: string, sheetId: number, newTitle: string) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: newTitle,
            },
            fields: "title",
          },
        },
      ],
    },
  });

  return { sheetId, title: newTitle };
}
