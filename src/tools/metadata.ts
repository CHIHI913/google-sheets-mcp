import { z } from "zod";
import { getSheetsClient } from "../client.js";

export const getSheetMetadataSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
};

export async function getSheetMetadata(spreadsheetId: string) {
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
