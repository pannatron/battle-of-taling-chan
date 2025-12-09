export interface Deck {
  _id: string;
  name: string;
  author: string;
  archetype: string;
  wins: number;
  views: number;
  likes: number;
  favoriteCount: number;
  favoritedBy: string[];
  userId?: string;
  gradient: string;
  description?: string;
  cardIds: string[];
  sideDeckIds?: string[];
  lifeCardIds?: string[];
  coverCardId?: string;
  coverCardId2?: string;
  createdAt?: string;
  updatedAt?: string;
}
