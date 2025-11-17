export interface GameCard {
  cardId: string;
  id: string;
}

export interface GamePlayer {
  userId: string;
  username: string;
  seat: 1 | 2;
  deckId: string | null;
  isReady: boolean;
  hand: GameCard[];
  deck: string[];
  lifeCards: string[];
  field: GameCard[];
  hell: GameCard[];
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
