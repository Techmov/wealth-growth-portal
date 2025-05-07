
export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  priority: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  start_date?: Date;
  end_date?: Date;
  image_url?: string;
  is_active: boolean;
  priority: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  is_active: boolean;
  priority: number;
  created_at?: Date;
  updated_at?: Date;
}
