export interface Deck {
  _id: string;
  name: string;
  author: string;
  archetype: string;
  wins: number;
  views: number;
  likes: number;
  gradient: string;
  description?: string;
  cardIds: string[];
  sideDeckIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
