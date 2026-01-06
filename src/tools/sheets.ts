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

export const deleteRowsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startIndex: z.number().describe("削除開始行（0始まり）"),
  endIndex: z.number().describe("削除終了行（この行は含まない）"),
};

export const deleteColumnsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startIndex: z.number().describe("削除開始列（0始まり、A=0）"),
  endIndex: z.number().describe("削除終了列（この列は含まない）"),
};

export const insertRowsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startIndex: z.number().describe("挿入位置（0始まり）"),
  numRows: z.number().describe("挿入する行数"),
};

export const insertColumnsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startIndex: z.number().describe("挿入位置（0始まり、A=0）"),
  numColumns: z.number().describe("挿入する列数"),
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

export async function deleteRows(
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  endIndex: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex,
            },
          },
        },
      ],
    },
  });

  return { deleted: true, rows: endIndex - startIndex };
}

export async function deleteColumns(
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  endIndex: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "COLUMNS",
              startIndex,
              endIndex,
            },
          },
        },
      ],
    },
  });

  return { deleted: true, columns: endIndex - startIndex };
}

export async function insertRows(
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  numRows: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex: startIndex + numRows,
            },
            inheritFromBefore: startIndex > 0,
          },
        },
      ],
    },
  });

  return { inserted: true, rows: numRows };
}

export async function insertColumns(
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  numColumns: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "COLUMNS",
              startIndex,
              endIndex: startIndex + numColumns,
            },
            inheritFromBefore: startIndex > 0,
          },
        },
      ],
    },
  });

  return { inserted: true, columns: numColumns };
}
