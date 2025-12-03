// ============================================================================
// AUTH TYPES
// ============================================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  name?: string;
  email: string;
  role: 'User' | 'Admin';
  createdAt: string;
}

// ============================================================================
// RESERVATION TYPES (Actualizar/Agregar)
// ============================================================================

export interface Reservation {
  id: number;
  userId: number;
  tableId: number;
  date: string; // DateOnly como string ISO (YYYY-MM-DD)
  startTime: string; // TimeOnly como string (HH:mm)
  endTime: string; // TimeOnly como string (HH:mm)
  guests: number;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  // Relations
  user?: User;
  table?: Table;
}

export type ReservationStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Cancelled' 
  | 'Completed' 
  | 'NoShow';

export interface CreateReservationRequest {
  tableId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  guests: number;
  notes?: string;
}

export interface UpdateReservationRequest {
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  notes?: string;
}

// ============================================================================
// TABLE TYPES (Actualizar/Agregar)
// ============================================================================

export interface Table {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

export interface TableAvailability {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isAvailable: boolean;
}

export interface AvailabilityQuery {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  guests?: number;
}

// ============================================================================
// API COMMON TYPES
// ============================================================================
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}