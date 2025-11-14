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

  // New Conditional Sin Card Fields
  sinCardConditionType?: 'none' | 'choose_one' | 'requires_avatar_symbol' | 'shared_name_limit';
  sinCardChooseOneGroup?: string[];
  sinCardRequiredAvatars?: string[];
  sinCardRequiredSymbols?: string[];
  sinCardSharedNameGroup?: string;
}

export interface CardListResponse {
  cards: Card[];
  total: number;
}
