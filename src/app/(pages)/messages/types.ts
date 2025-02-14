export interface Message {
  id: string;
  content: string;
  type?: string;
  created_at: string;
  attachments?: FileAttachment[];
  proposal?: SwomProposal;
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
  isTyping: boolean;
  name: string;
  userId: string;
}

export interface FileAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
}

export interface SwomProposal {
  exchange_type: 'simultaneous' | 'non_simultaneous';
  initiator_dates: {
    startDate: string | null;
    endDate: string | null;
  };
  partner_dates?: {
    startDate: string | null;
    endDate: string | null;
  };
  initiator_details: {
    numberOfPeople: number;
    carExchange: boolean;
  };
  partner_details: {
    numberOfPeople: number;
    carExchange: boolean;
  };
  status: 'pending' | 'accepted' | 'rejected';
} 