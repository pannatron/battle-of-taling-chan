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
}

export interface CardListResponse {
  cards: Card[];
  total: number;
}
