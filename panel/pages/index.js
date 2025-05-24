import Layout from '../components/layout'

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Bienvenue sur votre panel de gestion de la carte fidélité Discord !</h2>
        <a
          href="/config"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-800 transition"
        >
          Configurer le rôle staff et l’embed
        </a>
      </div>
    </Layout>
  );
}