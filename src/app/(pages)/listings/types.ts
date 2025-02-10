export interface Location {
  lat: number;
  lng: number;
  query: string;
}

export interface Listing {
  id: string;
  status: string;
  created_at: string;
  is_highlighted: boolean;
  slug: string;
  highlight_tag?: string;
  global_order_rank: number;
  home_info: {
    id: string;
    title: string;
    city: string;
    description: string;
    listing_images: string[];
    address: Location;
    property_type: string;
    how_many_sleep: number;
    located_in: string;
    bathrooms: number;
    area: number;
    main_or_second: string;
  };
  user_info: {
    id: string;
    email: string;
    name: string;
    profile_image_url: string;
    profession: string;
  };
  amenities?: {
    pool?: boolean;
    gym?: boolean;
    parking?: boolean;
    ac?: boolean;
    wifi?: boolean;
    washer?: boolean;
    dryer?: boolean;
    dishwasher?: boolean;
    elevator?: boolean;
    terrace?: boolean;
    bike?: boolean;
    car?: boolean;
    tv?: boolean;
    pingpong?: boolean;
    billiards?: boolean;
    scooter?: boolean;
    bbq?: boolean;
    computer?: boolean;
    wc_access?: boolean;
    playground?: boolean;
    baby_gear?: boolean;
    fireplace?: boolean;
    hot_tub?: boolean;
    sauna?: boolean;
    other?: boolean;
    doorman?: boolean;
    cleaning_service?: boolean;
    video_games?: boolean;
    tennis_court?: boolean;
  };
  favorite?: boolean;
} 