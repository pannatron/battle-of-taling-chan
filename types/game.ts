export interface GameCard {
  cardId: string;
  id: string;
  rotated?: boolean;
  currentPower?: number;
}

export interface LifeCard {
  cardId: string;
  id: string;
  faceUp: boolean;
}

export interface GamePlayer {
  userId: string;
  username: string;
  seat: 1 | 2;
  deckId: string | null;
  isReady: boolean;
  hand: GameCard[];
  deck: string[];
  lifeCards: LifeCard[];
  field: GameCard[];
  hell: GameCard[];
  magicZone?: GameCard[];
  avatarZone?: GameCard[];
  landZone?: GameCard[];
  constructZone?: GameCard[];
}

export interface Spectator {
  userId: string;
  username: string;
}

export interface GameRoom {
  _id?: string;
  roomId: string;
  roomName: string;
  status: 'waiting' | 'ready' | 'in_progress' | 'finished';
  players: GamePlayer[];
  spectators: Spectator[];
  maxSpectators: number;
  hostUserId: string;
  gameStartedAt?: Date;
  gameEndedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameRoomEvent {
  type: 'room-update' | 'player-joined' | 'player-left' | 'seat-taken' | 'deck-selected' | 'player-ready' | 'game-start';
  data: any;
}
