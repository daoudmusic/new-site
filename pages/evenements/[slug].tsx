import type { NextApiRequest, NextApiResponse } from 'next';
import { getEvents, incrementSoldTickets } from '../../lib/sheets';
import { generateTicketPDF } from '../../utils/pdf';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { eventId, quantity, name, email } = req.body;
  if (!eventId || typeof quantity !== 'number' || !name || !email) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    // 1) Load the event
    const events = await getEvents();
    const event = events.find(e => e.event_id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const { title, date: eventDate, venue } = event;

    // 2) Reserve stock
    const qty = Math.min(quantity, 8);
    const newSold = await incrementSoldTickets(eventId, qty);
    const ticketId = `${eventId}-${Date.now()}`;

    // 3) Build PDF
    const pdfBytes = await generateTicketPDF({ name, eventTitle: title, eventDate, venue, ticketId });
    const pdfBuffer = Buffer.from(pdfBytes);

    // 4) Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY!);
    // @ts-ignore attachments typing
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

    return res.status(200).json({ success: true, sold: newSold });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
