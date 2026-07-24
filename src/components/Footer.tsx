export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm">WarehouseOS</p>
          <p className="text-sm text-gray-400">&copy; {currentYear} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
