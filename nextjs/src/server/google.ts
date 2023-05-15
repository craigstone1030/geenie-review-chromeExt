/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

export function getGoogleDrive() {
  const jsonDir = path.join(process.cwd(), "json");
  const credentials = path.join(jsonDir, "credentials.json");
  const authClient = new GoogleAuth({
    keyFile: credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth: authClient });
}

export async function getFileId(
  drive: ReturnType<typeof getGoogleDrive>,
  asin: string
) {
  const file = await drive.files.list({
    q: `name = '${asin}.json' and '13OFCt9ijeowKRwHcRv8yWWvKbTJwm2KE' in parents`,
  });
  if (file?.data?.files?.length) {
    return file?.data?.files?.[0]?.id ?? undefined;
  }
}

export async function getFileContent<T = any>(
  drive: ReturnType<typeof getGoogleDrive>,
  fileId: string
): Promise<T> {
  const file = await drive.files.get({
    fileId,
    alt: "media",
  });
  return file.data as any;
}
