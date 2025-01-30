export type UserInfo = {
  name: string;
  dob: string;
  email: string;
  phone: string;
  profession: string;
  about_me: string;
  children: string;
  recommended: string;
  openToOtherCities: {
    cityVisit1: string;
    cityVisit2: string;
    cityVisit3: string;
  };
  openToOtherDestinations: boolean;
};

export type HomeInfo = {
  title: string;
  property: string;
  description: string;
  locatedIn: string;
  bathrooms: string;
  area: string;
  mainOrSecond: string;
  address: string;
  city: string;
  howManySleep: string;
};

export type Amenities = {
  bike: boolean;
  car: boolean;
  tv: boolean;
  dishwasher: boolean;
  pingpong: boolean;
  billiards: boolean;
  washer: boolean;
  dryer: boolean;
  wifi: boolean;
  elevator: boolean;
  terrace: boolean;
  scooter: boolean;
  bbq: boolean;
  computer: boolean;
  wcAccess: boolean;
  pool: boolean;
  playground: boolean;
  babyGear: boolean;
  ac: boolean;
  fireplace: boolean;
  parking: boolean;
  hotTub: boolean;
  sauna: boolean;
  other: boolean;
  doorman: boolean;
  cleaningService: boolean;
  videoGames: boolean;
  tennisCourt: boolean;
  gym: boolean;
};

export type FormValues = {
  userInfo: UserInfo;
  homeInfo: HomeInfo;
  amenities: Amenities;
  privacyPolicy: boolean;
}; 