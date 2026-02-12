// 404 page
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-8">Sayfa Bulunamadı</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded font-bold hover:from-blue-700 hover:to-purple-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
