import api from "@/lib/api";

export interface AppUser {
  id: number;
  name: string;
  email: string;
}

export const usersApi = {
  getAll: async (): Promise<AppUser[]> => {
    const response = await api.get("/users");
    return response.data;
  }
};