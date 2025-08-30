export interface User {
  id: string;
  email: string;
  user_type: "creator" | "brand";
  first_name: string;
  last_name: string;
  company_name?: string;
  email_verified: boolean;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  user_type: "creator" | "brand";
  first_name: string;
  last_name: string;
  company_name?: string;
}
