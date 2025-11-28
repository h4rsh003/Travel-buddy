export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-600 font-medium animate-pulse">Loading Travel Buddy...</span>
      </div>
    </div>
  );
}
