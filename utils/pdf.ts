import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateTicketPDF({
  name,
  eventTitle,
  eventDate,
  venue,
  ticketId,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketId: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('🎟️ Billet pour :', { x: 40, y: 550, size: 16, font });
  page.drawText(eventTitle, { x: 40, y: 530, size: 14, font });
  page.drawText(`Date : ${eventDate}`, { x: 40, y: 500, size: 12, font });
  page.drawText(`Lieu : ${venue}`, { x: 40, y: 480, size: 12, font });
  page.drawText(`Nom : ${name}`, { x: 40, y: 460, size: 12, font });
  page.drawText(`Numéro billet : ${ticketId}`, { x: 40, y: 440, size: 12, font });

  page.drawText('Merci pour votre réservation !', { x: 40, y: 400, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
