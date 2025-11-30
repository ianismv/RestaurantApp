// ============================================================================
// AUTH TYPES
// ============================================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  role: 'User' | 'Admin';
  createdAt: string;
}

// ============================================================================
// RESERVATION TYPES
// ============================================================================
export interface Reservation {
  id: number;
  userId: number;
  tableId: number;
  date: string; // DateOnly como string ISO
  startTime: string; // TimeOnly como string "HH:mm"
  endTime: string;
  guests: number;
  status: ReservationStatus;
  notes: string;
  userEmail: string;
  tableName: string;
  createdAt: string;
}

export type ReservationStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Cancelled' 
  | 'Completed' 
  | 'NoShow';

export interface CreateReservationRequest {
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
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
// TABLE TYPES
// ============================================================================
export interface Table {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
  location: string;
}

export interface UpdateTableRequest extends CreateTableRequest {
  isActive: boolean;
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