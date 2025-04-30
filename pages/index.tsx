import Link from 'next/link';
import Image from 'next/image';
import { GetStaticProps } from 'next';
import { getEvents } from '../lib/sheets';

interface Event {
  event_id: string;
  title: string;
  date: string;
  city: string;
  slug: string;
  image_url?: string;
  is_sold_out?: string;
}

interface Props {
  events: Event[];
}

export const getStaticProps: GetStaticProps = async () => {
  const events = await getEvents();
  return { props: { events } };
};

export default function Home({ events }: Props) {
  return (
    <main className="px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase">Prochains concerts</h1>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {events.map((event) => (
          <Link key={event.event_id} href={`/evenements/${event.slug}`}>
            <div className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
              <Image
                src={event.image_url || '/default-event.jpg'}
                alt={event.title}
                width={600}
                height={600}
                className="object-cover w-full h-64"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-gray-500">{event.date} — {event.city}</p>
                {event.is_sold_out === 'TRUE' && (
                  <p className="text-red-600 font-bold mt-2">Complet</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
}
