import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL!,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\n/g, '\n'),
  SCOPES
);

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RANGE = 'A1:Z1000';

export async function getEvents() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = response.data.values || [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const event: Record<string, string> = {};
    headers.forEach((key, i) => event[key] = row[i] || '');
    return event;
  });
}

export async function incrementSoldTickets(eventId: string, quantity: number) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);
  const eventIndex = data.findIndex(row => row[headers.indexOf('event_id')] === eventId);
  if (eventIndex === -1) throw new Error('Événement introuvable');

  const soldIndex = headers.indexOf('places_sold');
  const totalIndex = headers.indexOf('places_total');

  const current = parseInt(data[eventIndex][soldIndex] || '0', 10);
  const total = parseInt(data[eventIndex][totalIndex] || '0', 10);

  if (current + quantity > total) throw new Error('Événement complet');

  const newSold = current + quantity;
  const rowNumber = eventIndex + 2; // +2 for header row

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `L${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newSold.toString()]],
    },
  });

  return newSold;
}
