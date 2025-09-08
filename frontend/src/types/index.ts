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

export interface Contract {
  id: string;
  brand_id: string;
  title: string;
  description?: string;
  cpm_rate: number;
  max_payout: number;
  min_views: number;
  target_audience?: string;
  content_requirements?: string;
  platform: "tiktok" | "instagram" | "youtube_shorts";
  status: "active" | "paused" | "completed" | "cancelled";
  expires_at?: string;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    company_name?: string;
    first_name: string;
    last_name: string;
  };
  campaigns?: Campaign[];
}

export interface Campaign {
  id: string;
  contract_id: string;
  creator_id: string;
  content_url?: string;
  views_tracked: number;
  amount_earned: number;
  status: "accepted" | "content_created" | "tracking" | "completed" | "paid";
  content_submitted_at?: string;
  last_tracked_at?: string;
  createdAt: string;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateContractData {
  title: string;
  description?: string;
  cpm_rate: number;
  max_payout: number;
  min_views?: number;
  target_audience?: string;
  content_requirements?: string;
  platform?: "tiktok" | "instagram" | "youtube_shorts";
  expires_at?: string;
}
