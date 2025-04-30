import type { NextApiRequest, NextApiResponse } from 'next';
import { incrementSoldTickets } from '../../lib/sheets';
import { generateTicketPDF } from '../../utils/pdf';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { eventId, quantity, name, email } = req.body;
  try {
    const newSold = await incrementSoldTickets(eventId, parseInt(quantity, 10));
    const ticketId = `${eventId}-${Date.now()}`;
    const pdfBytes = await generateTicketPDF({ name, eventTitle: event.title, eventDate: event.date, venue: event.venue, ticketId });
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: 'tickets@daoud.shop',
      to: email,
      subject: 'Votre billet pour ' + event.title,
      html: `<p>Merci pour votre achat, ${name}!</p>`,
      attachments: [{
        name: 'billet.pdf',
        data: pdfBytes,
        contentType: 'application/pdf'
      }]
    });
    // Meta Pixel Purchase event (client-side triggers separately)
    return res.status(200).json({ success: true, sold: newSold });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
