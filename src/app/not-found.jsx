export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center bg-white">
      <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200">
        <span className="text-lg font-semibold text-black">404</span>
        <span className="text-black">This page could not be found.</span>
      </div>
    </div>
  );
}
