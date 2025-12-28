export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-travel-bg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-travel-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="text-travel-text font-medium animate-pulse text-lg">
          Loading Travel Buddy...
        </span>
      </div>
    </div>
  );
}