
export interface Promotion {
  id: string;
  title: string; // Required field
  description: string; // Required field
  image_url?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  is_active: boolean;
  priority: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Offer {
  id: string;
  title: string; // Required field
  description: string; // Required field
  discount_percentage?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  is_active: boolean;
  priority: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Feature {
  id: string;
  title: string; // Required field
  description: string; // Required field
  icon_name: string; // Required field
  is_active: boolean;
  priority: number;
  created_at?: string | null;
  updated_at?: string | null;
}
