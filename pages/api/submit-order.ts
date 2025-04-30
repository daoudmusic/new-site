import type { NextApiRequest, NextApiResponse } from 'next';
import { getEvents, incrementSoldTickets } from '../../lib/sheets';
import { generateTicketPDF } from '../../utils/pdf';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { eventId, quantity, name, email } = req.body;
  if (!eventId || !quantity || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch event details
    const events = await getEvents();
    const event = events.find(e => e.event_id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Destructure for TS safety
    const { title, date: eventDate, venue } = event;

    // Increment tickets sold
    const newSoldCount = await incrementSoldTickets(eventId, parseInt(quantity, 10));
    const ticketId = `${eventId}-${Date.now()}`;

    // Generate ticket PDF using destructured values
    const pdfBytes = await generateTicketPDF({
      name,
      eventTitle: title,
      eventDate,
      venue,
      ticketId,
    });

    // Convert to Buffer for Resend
    const pdfBuffer = Buffer.from(pdfBytes);

    // Send email with PDF ticket
    const resend = new Resend(process.env.RESEND_API_KEY!);
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
    return res.status(400).json({ error: error.message });
  }
}
