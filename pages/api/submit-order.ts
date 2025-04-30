import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getEvents } from '../../lib/sheets';

interface Event {
  event_id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  ticket_price: string;
  reservation_link: string;
  slug: string;
  image_url?: string;
  is_sold_out?: string;
}

interface Props {
  event: Event;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getEvents();
  const paths = events.map((event) => ({ params: { slug: event.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const events = await getEvents();
  const event = events.find((e) => e.slug === params?.slug);
  return { props: { event } };
};

export default function EventPage({ event }: Props) {
  if (!event) return <p>Événement introuvable</p>;

  return (
    <main className="px-4 py-8 max-w-2xl mx-auto">
      <Link href="/">
        <a className="text-blue-600 mb-4 inline-block">← Retour</a>
      </Link>
      <Image
        src={event.image_url || '/default-event.jpg'}
        alt={event.title}
        width={800}
        height={600}
        className="rounded-xl object-cover w-full h-96 mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-gray-600 mb-2">{event.date} — {event.venue}</p>
      <p className="mb-4">{event.description}</p>

      {event.is_sold_out === 'TRUE' ? (
        <p className="text-red-600 font-bold">Complet</p>
      ) : (
        <a
          href={event.reservation_link}
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Réserver — {event.ticket_price}€
        </a>
      )}
    </main>
  );
}
