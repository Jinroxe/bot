export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <header className="bg-blue-700 text-white shadow-lg py-6 px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide">Panel Fidélité Discord</h1>
      </header>
      <main className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
        {children}
      </main>
      <footer className="text-center text-gray-500 mt-10 mb-2">
        &copy; {new Date().getFullYear()} Paleto Custom - Fidélité Discord
      </footer>
    </div>
  );
}