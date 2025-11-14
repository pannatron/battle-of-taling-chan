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
  coverCardId?: string;
  createdAt?: string;
  updatedAt?: string;
}
