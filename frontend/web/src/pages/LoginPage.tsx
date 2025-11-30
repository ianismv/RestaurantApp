import { useState } from 'react';
import { Button } from "../components/ui/Button";
import React from 'react';
import { authApi } from '../api/auth.api';
import type { LoginRequest } from '../types/api.types';

export function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga

// El botón estará deshabilitado si alguno de los campos está vacío o si está cargando
const isButtonDisabled = !email || !password || isLoading; 

const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
e.preventDefault(); 
if (isButtonDisabled) return; // Protección adicional

setIsLoading(true); // Iniciar carga

try {
// Usamos authApi.login para llamar al endpoint, 
// aprovechando la configuración de Axios del cliente
const loginData: LoginRequest = { email, password };
const data = await authApi.login(loginData);

// Login exitoso
console.log('Login exitoso:', data);

// En una aplicación real, aquí guardarías data.accessToken y data.refreshToken 
// y redirigirías al usuario a la página principal.

} catch (error) {
// client.ts (Axios Interceptor) ya maneja y muestra los errores específicos (404, 401, 500, etc.) 
// usando 'toast'. Aquí solo registramos el error interno.
console.error('Fallo en el intento de login:', error);
} finally {
setIsLoading(false); // Detener carga, ya sea éxito o fallo
}
};

return (
<div className="h-screen flex items-center justify-center bg-gray-100">
<div className="bg-white p-6 shadow-xl rounded-lg w-full max-w-sm transform transition-all duration-300 hover:shadow-2xl">
<h1 className="text-2xl mb-6 font-bold text-gray-800 text-center">Iniciar Sesión</h1>

<form onSubmit={handleLogin}>

<div className="mb-4">
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
<input 
id="email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="border border-gray-300 p-3 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
placeholder="tu.correo@ejemplo.com" 
disabled={isLoading}
/>
</div>

<div className="mb-6">
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
<input 
id="password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="border border-gray-300 p-3 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
placeholder="••••••••" 
disabled={isLoading}
/>
</div>

<Button 
type="submit" 
className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
disabled={isButtonDisabled}
>
{isLoading ? 'Cargando...' : 'Ingresar'}
</Button>

</form>
</div>
</div>
);
}