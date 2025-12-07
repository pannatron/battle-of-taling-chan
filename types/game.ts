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

export interface MagicQuota {
  used: number;
  max: number;
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
  magicQuota?: {
    normal: MagicQuota;
    react: MagicQuota;
    modification: MagicQuota;
    land: MagicQuota;
    noSecondTime: MagicQuota;
  };
  hasMulliganed?: boolean;
  mulliganCards?: string[];
}

export interface Spectator {
  userId: string;
  username: string;
}

export interface GameRoom {
  _id?: string;
  roomId: string;
  roomName: string;
  status: 'waiting' | 'ready' | 'mulligan' | 'in_progress' | 'finished';
  players: GamePlayer[];
  spectators: Spectator[];
  maxSpectators: number;
  hostUserId: string;
  currentPlayerTurn?: 1 | 2;
  gameStartedAt?: Date;
  gameEndedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiceRollData {
  userId: string;
  username: string;
  result: number;
  timestamp: Date;
}

export interface TurnChangeData {
  previousPlayer: {
    userId: string;
    username: string;
  };
  currentPlayer: {
    userId: string;
    username: string;
  } | null;
  turnNumber: number;
}

export interface GameRoomEvent {
  type: 'room-update' | 'player-joined' | 'player-left' | 'seat-taken' | 'deck-selected' | 'player-ready' | 'game-start' | 'dice-roll' | 'turn-change' | 'game-end' | 'card-discard' | 'card-magic-use' | 'scry-start' | 'scry-resolved';
  data: any;
}
