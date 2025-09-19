import type { RegisterData, CreateContractData, Campaign } from "../types";

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

  async getContracts(params?: {
    status?: string;
    platform?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.request(`/contracts${query}`);
  }

  async getContract(id: string) {
    return this.request(`/contracts/${id}`);
  }

  async createContract(contractData: CreateContractData) {
    return this.request("/contracts", {
      method: "POST",
      body: JSON.stringify(contractData),
    });
  }

  async updateContract(id: string, updates: Partial<CreateContractData>) {
    return this.request(`/contracts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async acceptContract(id: string) {
    return this.request(`/contracts/${id}/accept`, {
      method: "POST",
    });
  }

  // Campaigns
  async getMyCampaigns() {
    // For creators and brands, backend filters by user type
    return this.request("/campaigns");
  }

  async getBrandCampaigns() {
    // Same endpoint, backend filters by user type
    return this.request("/campaigns");
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  async getCampaignsByUser(userId: string) {
    return this.request(`/campaigns/user/${userId}`);
  }

  async getMaxPayout() {
    return this.request(`/campaigns/max-payout`);
  }

  async getCurrentPayout() {
    return this.request(`/campaigns/current-payout`);
  }

  async createCampaign(contractId: string) {
    // For creators to accept a contract and create a campaign
    return this.request("/campaigns", {
      method: "POST",
      body: JSON.stringify({ contract_id: contractId }),
    });
  }

  async updateCampaign(id: string, updates: Partial<Campaign>) {
    return this.request(`/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(id: string) {
    return this.request(`/campaigns/${id}`, {
      method: "DELETE",
    });
  }
  async fundDraft(contractDraft: CreateContractData) {
    return this.request("/payments/contracts/fund-draft", {
      method: "POST",
      body: JSON.stringify(contractDraft),
    });
  }

  async getStripeOnboardingLink() {
    return this.request("/user/stripe-onboarding-link");
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

export const api = new ApiService();
