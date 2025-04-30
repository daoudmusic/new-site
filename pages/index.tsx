import Image from "next/image";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Accueil – Concerts Daoud</title>
        <link rel="icon" href="/logo.png" type="image/png" />
      </Head>

      <header className="p-4 flex justify-between items-center border-b border-black">
        <Image src="/logo.png" alt="Logo Daoud" width={120} height={40} />
        <nav className="uppercase text-sm">prochaines dates</nav>
      </header>

      <main className="p-6">
        <h1 className="text-4xl font-bold text-center my-12">Prochaines dates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="border border-black p-6 rounded-xl hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">02 mai 2025 — Le Metronum, Toulouse</h2>
            <p className="mb-4">Avec l’album “ok”</p>
            <a href="https://daoud.shop" className="underline">Réserver</a>
          </div>
          <div className="border border-black p-6 rounded-xl hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">23 mai 2025 — La Vapeur, Dijon</h2>
            <p className="mb-4">Sortie du titre “dijon”</p>
            <a href="https://daoud.shop" className="underline">Réserver</a>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs uppercase text-gray-500 mt-16 p-4">
        © 2025 Daoud. Tous droits réservés.
      </footer>
    </>
  );
}
