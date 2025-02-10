import { Amenities } from "@/app/(pages)/become-member/types";

export interface UserInfo {
  id?: string;
  profile_image_url: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  age: number;
  profession: string;
  about_me: string;
  children: string;
  recommended: string;
  open_to_other_cities: {
    cityVisit1: string;
    cityVisit2: string;
    cityVisit3: string;
  };
  open_to_other_destinations: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  query?: string;
}

export interface HomeInfo {
  id?: string;
  title: string;
  address: GeoPoint;
  description: string;
  listing_images: string[];
  property_type: string;
  how_many_sleep: number;
  located_in: string;
  city: string;
  main_or_second: string;
  bathrooms: number;
  area: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListingFormData {
  user_info: UserInfo;
  home_info: HomeInfo;
  amenities: Amenities;
}

export interface Listing {
  id: string;
  created_at: string;
  updated_at: string;
  status: "pending" | "approved" | "archived" | "published";
  home_info: HomeInfo;
  user_info: UserInfo;
  amenities: Amenities & { id: string };
} 