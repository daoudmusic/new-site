import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL!,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  SCOPES
);
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RANGE = 'A1:Z1000';

export async function getEvents() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  return rows.slice(1).map(row => {
    const evt: Record<string,string> = {};
    headers.forEach((key,i) => { evt[key] = row[i] || '' });
    return evt;
  });
}

export async function incrementSoldTickets(eventId: string, quantity: number) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  const data = rows.slice(1);
  const idx = data.findIndex(r => r[headers.indexOf('event_id')] === eventId);
  if (idx < 0) throw new Error('Event not found');
  const soldI = headers.indexOf('places_sold');
  const totalI = headers.indexOf('places_total');
  const current = parseInt(data[idx][soldI]||'0',10);
  const total = parseInt(data[idx][totalI]||'0',10);
  if (current + quantity > total) throw new Error('Sold out');
  const rowNum = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `L${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[current+quantity]] }
  });
  return current + quantity;
}
