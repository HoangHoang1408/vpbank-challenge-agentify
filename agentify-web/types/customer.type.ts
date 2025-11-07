export type Gender = 'female' | 'male' | 'other';
export type Segment =
  | 'Diamond Elite'
  | 'Diamond'
  | 'Pre-Diamond'
  | 'Champion Prime'
  | 'Rising Prime'
  | 'Uppermega Prime'
  | 'Mega Prime';

export interface ICustomer {
  id: number;
  rmId: number;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  dob: string;
  gender: Gender;
  jobTitle: string;
  segment: Segment;
  state: string;
  zip: string;
  isActive: boolean;
  behaviorDescription: string;
  createdAt: string;
  updatedAt: string;
}
