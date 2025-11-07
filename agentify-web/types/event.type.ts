export interface IEvent {
  id: number;
  customerName: string;
  customerRank: 'prime' | 'diamond' | 'platinum';
  eventName: string;
  lastContact: string;
  contacted: boolean;
  contactedTime?: string;
}
