export type PlaceType = 'food' | 'cafe' | 'drink';
export type Budget = 'low' | 'mid' | 'high';
export type Distance = 'near' | 'medium' | 'far';
export type Mood = 'quick' | 'cozy' | 'trendy';
export type Group = 'solo' | 'friend' | 'team';

export type Place = {
  name: string;
  placeType: PlaceType;
  address: string;
  budget: Budget;
  distance: Distance;
  mood: Mood;
  group: Group;
  menu: string;
  walk: string;
  price: string;
  tags: string[];
  reason: string;
};

