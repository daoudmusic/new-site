import type { NextApiRequest, NextApiResponse } from 'next';
import { getEvents, incrementSoldTickets } from '../../lib/sheets';
import { generateTicketPDF } from '../../utils/pdf';
import { Resend } from 'resend';

// Ensure critical environment variables are set
const { RESEND_API_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID, STRIPE_SECRET_KEY, NEXT_PUBLIC_META_PIXEL_ID } = process.env;
if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY environment variable');
if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) throw new Error('Missing Google Sheets configuration environment variables');
if (!STRIPE_SECRET_KEY) console.warn('Warning: STRIPE_SECRET_KEY is not set');
if (!NEXT_PUBLIC_META_PIXEL_ID) console.warn('Warning: NEXT_PUBLIC_META_PIXEL_ID is not set');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { eventId, quantity, name, email } = req.body;
  if (!eventId || typeof quantity !== 'number' || !name || !email) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    // Fetch event details safely
    const events = await getEvents();
    const event = events.find(e => e.event_id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Extract known properties for TS safety
    const { title, date: eventDate, venue } = event;

    // Ensure numeric quantity and stock limit
    const qty = Math.min(quantity, 8);
    const newSoldCount = await incrementSoldTickets(eventId, qty);

    // Generate unique ticket ID and PDF
    const ticketId = `${eventId}-${Date.now()}`;
    const pdfBytes = await generateTicketPDF({ name, eventTitle: title, eventDate, venue, ticketId });
    const pdfBuffer = Buffer.from(pdfBytes.buffer || pdfBytes);

    // Send email with ticket
    const resend = new Resend(RESEND_API_KEY!);
    // @ts-ignore: Resend Attachment typing may differ
    await resend.emails.send({
      from: 'tickets@daoud.shop',
      to: email,
      subject: `Your ticket for ${title}`,
      html: `<p>Thank you for your purchase, ${name}!</p>`,
      attachments: [
        {
          filename: 'ticket.pdf',
          data: pdfBuffer,
          type: 'application/pdf',
        },
      ],
    });

    return res.status(200).json({ success: true, sold: newSoldCount });
  } catch (error: any) {
    console.error('submit-order error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
