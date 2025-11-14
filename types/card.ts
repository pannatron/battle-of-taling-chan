export interface Card {
  _id: string;
  name: string;
  type: string;
  cost: string;
  gem: string;
  power: string;
  symbol: string;
  color: string;
  ex: string;
  soi: string;
  print: string;
  rare: string;
  dropRate: string;
  mainEffect?: string;
  favorText?: string;
  series: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  
  // Sin Card Management Fields
  sinCardStatus?: 'normal' | 'banned' | 'limited' | 'conditional';
  sinCardReason?: string;
  sinCardDate?: string;
  sinCardLimit?: number;
  sinCardPreviousLimit?: number;
  sinCardCondition?: string;
}

export interface CardListResponse {
  cards: Card[];
  total: number;
}
