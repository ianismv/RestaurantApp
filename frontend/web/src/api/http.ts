export const api = async (url: string, options: RequestInit = {}) => {
    const base = import.meta.env.VITE_API_URL;
  
    const res = await fetch(base + url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
  
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Error en la solicitud");
    }
  
    return res.json().catch(() => ({}));
  };
  