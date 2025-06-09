// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <div className="flex items-center justify-center space-x-2">
          <div className="text-2xl animate-bounce">☕</div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
