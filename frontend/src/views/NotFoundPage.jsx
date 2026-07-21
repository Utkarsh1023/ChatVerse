import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="rounded-2xl bg-white/70 backdrop-blur border border-border shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">Page not found.</p>
        <Link to="/login" className="inline-block mt-4 text-primary font-medium hover:underline">
          Go to Login
        </Link>
      </div>
    </div>
  );
}

