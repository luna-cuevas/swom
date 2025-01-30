export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  listing_id: string | null;
  participants: Array<{
    user_id: string;
    last_read_at: string | null;
    user: {
      id: string;
      name: string;
      profileImage?: string;
      email: string;
    };
  }>;
}

export interface ListingInfo {
  id: string;
  title: string;
  image: string;
  bathrooms: number;
  bedrooms: number;
  city: string;
}

export interface Host {
  id: string;
  name: string;
  profileImage?: string;
  email: string;
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
  timestamp: number;
} 