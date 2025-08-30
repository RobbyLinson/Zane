const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  private getAuthHeader(): { Authorization?: string } {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: RegisterData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  // Auth helpers
  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  removeToken() {
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }
}

export interface RegisterData {
  email: string;
  password: string;
  user_type: "creator" | "brand";
  first_name: string;
  last_name: string;
  company_name?: string;
}

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

export const api = new ApiService();
