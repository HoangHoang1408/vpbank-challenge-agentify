export interface IEvent {
  id: number;
  customerName: string;
  customerRank: 'gold' | 'diamond' | 'platinum';
  eventName: string;
  lastContact: string;
  contacted: boolean;
}
