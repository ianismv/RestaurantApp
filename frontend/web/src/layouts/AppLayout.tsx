import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-60 bg-white shadow p-4">
        <h2 className="font-bold text-xl mb-4">RestaurantOptimo</h2>

        <nav className="space-y-2">
          <a href="/" className="block hover:underline">Dashboard</a>
          <a href="/reservas" className="block hover:underline">Reservas</a>
          <a href="/mesas" className="block hover:underline">Mesas</a>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
