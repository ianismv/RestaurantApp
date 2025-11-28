import { Button } from "../components/ui/Button";

export function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 shadow-md rounded-lg w-80">
        <h1 className="text-xl mb-4 font-semibold">Iniciar Sesión</h1>
        <input className="border p-2 w-full mb-3" placeholder="Email" />
        <input className="border p-2 w-full mb-4" placeholder="Password" />
        <Button className="w-full">Ingresar</Button>
      </div>
    </div>
  );
}
