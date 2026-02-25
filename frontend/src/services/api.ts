import type { RegisterData, CreateContractData, Campaign } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // ── Auth ────────────────────────────────────────────────────────────────────

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

  // ── Contracts ───────────────────────────────────────────────────────────────

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

  /** Returns { count } — number of active contracts still open to creators */
  async getAvailableContractCount() {
    return this.request("/contracts/available/count");
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

  /** Creator accepts a contract — creates and returns a Campaign */
  async acceptContract(id: string) {
    return this.request(`/contracts/${id}/accept`, {
      method: "POST",
    });
  }

  // ── Campaigns ───────────────────────────────────────────────────────────────

  /**
   * Returns campaigns scoped to the current user.
   * Creators receive their own campaigns; brands receive campaigns under their contracts.
   */
  async getCampaigns() {
    return this.request("/campaigns");
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
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

  // ── User / Earnings ─────────────────────────────────────────────────────────

  /** Returns { maxPayout, currentPayout } for the logged-in creator */
  async getEarnings() {
    return this.request("/user/earnings");
  }

  async withdrawUserBalance(amount: number) {
    return this.request("/user/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  async getStripeOnboardingLink() {
    return this.request("/user/stripe-onboarding-link");
  }

  // ── Payments ────────────────────────────────────────────────────────────────

  async fundDraft(contractDraft: CreateContractData) {
    return this.request("/payments/contracts/fund-draft", {
      method: "POST",
      body: JSON.stringify(contractDraft),
    });
  }

  // ── TikTok ──────────────────────────────────────────────────────────────────

  async authenticateTiktokAccount() {
    return this.request("/tiktok/auth");
  }

  /** Submit a TikTok video URL for a campaign */
  async submitTikTokContent(campaignId: string, tiktokUrl: string) {
    return this.request(`/tiktok/campaigns/${campaignId}/content`, {
      method: "POST",
      body: JSON.stringify({ tiktokUrl }),
    });
  }

  /** Sync view counts for all of the creator's active TikTok campaigns */
  async syncAllTikTokViews() {
    return this.request("/tiktok/campaigns/views/sync", {
      method: "POST",
    });
  }

  // ── Token helpers ───────────────────────────────────────────────────────────

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
