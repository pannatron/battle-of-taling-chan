import { Card } from '@/types/card';
import { Deck } from '@/types/deck';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAllCards(): Promise<Card[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export async function getCardsBySeries(series: string): Promise<Card[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/series/${series}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cards for series ${series}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching cards for series ${series}:`, error);
    return [];
  }
}

export async function getCardByPrint(print: string): Promise<Card | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/print/${print}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch card with print ${print}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching card with print ${print}:`, error);
    return null;
  }
}

export async function searchCards(params: {
  name?: string;
  type?: string;
  rarity?: string;
  series?: string;
  color?: string;
}): Promise<Card[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.type) queryParams.append('type', params.type);
    if (params.rarity) queryParams.append('rarity', params.rarity);
    if (params.series) queryParams.append('series', params.series);
    if (params.color) queryParams.append('color', params.color);

    const url = `${API_BASE_URL}/cards/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to search cards');
    }

    return response.json();
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}

export async function getDistinctCardValues(
  field: string,
): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/distinct/${field}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch distinct values for ${field}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching distinct values for ${field}:`, error);
    return [];
  }
}

// Deck API functions
export async function getAllDecks(): Promise<Deck[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch decks');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching decks:', error);
    return [];
  }
}

export async function getDeckById(id: string): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deck with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching deck with id ${id}:`, error);
    return null;
  }
}

export async function createDeck(deck: Partial<Deck>): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });

    if (!response.ok) {
      throw new Error('Failed to create deck');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating deck:', error);
    return null;
  }
}

export async function updateDeck(
  id: string,
  deck: Partial<Deck>,
): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deck),
    });

    if (!response.ok) {
      throw new Error(`Failed to update deck with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating deck with id ${id}:`, error);
    return null;
  }
}

export async function deleteDeck(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error(`Error deleting deck with id ${id}:`, error);
    return false;
  }
}

export async function incrementDeckViews(id: string): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${id}/view`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to increment views for deck ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error incrementing views for deck ${id}:`, error);
    return null;
  }
}

export async function incrementDeckLikes(id: string): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${id}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to increment likes for deck ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error incrementing likes for deck ${id}:`, error);
    return null;
  }
}

// Admin Card API functions
export async function updateCardImage(
  id: string,
  imageUrl: string,
): Promise<Card | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${id}/image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update card image for card ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating card image for card ${id}:`, error);
    return null;
  }
}

export async function updateCard(
  id: string,
  updateData: Partial<Card>,
): Promise<Card | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update card ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating card ${id}:`, error);
    return null;
  }
}

export async function getCardById(id: string): Promise<Card | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch card with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching card with id ${id}:`, error);
    return null;
  }
}

// Favorite deck functions
export async function toggleDeckFavorite(deckId: string, userId: string): Promise<Deck | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle favorite for deck ${deckId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error toggling favorite for deck ${deckId}:`, error);
    return null;
  }
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/user/${userId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch decks for user ${userId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching decks for user ${userId}:`, error);
    return [];
  }
}

export async function getUserFavoriteDecks(userId: string): Promise<Deck[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/decks/user/${userId}/favorites`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch favorite decks for user ${userId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching favorite decks for user ${userId}:`, error);
    return [];
  }
}

// Sin Card Management API functions
export async function getSinCardsByStatus(status: string): Promise<Card[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/sin-cards/${status}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sin cards with status ${status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching sin cards with status ${status}:`, error);
    return [];
  }
}

export async function updateCardSinStatus(
  id: string,
  sinCardData: {
    sinCardStatus: string;
    sinCardReason?: string;
    sinCardDate?: Date;
    sinCardLimit?: number;
    sinCardCondition?: string;
  }
): Promise<Card | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${id}/sin-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sinCardData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update sin status for card ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating sin status for card ${id}:`, error);
    return null;
  }
}

export async function updateCardSinStatusByName(
  cardName: string,
  sinCardData: {
    sinCardStatus: string;
    sinCardReason?: string;
    sinCardDate?: Date;
    sinCardLimit?: number;
    sinCardCondition?: string;
    sinCardConditionType?: string;
    sinCardChooseOneGroup?: string[];
    sinCardRequiredAvatars?: string[];
    sinCardRequiredSymbols?: string[];
    sinCardSharedNameGroup?: string;
  }
): Promise<{ modifiedCount: number; cards: Card[]; relatedCards?: Card[] } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/by-name/${encodeURIComponent(cardName)}/sin-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sinCardData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update sin status for cards named ${cardName}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating sin status for cards named ${cardName}:`, error);
    return null;
  }
}

// Game Room API functions
export async function createGameRoom(data: {
  roomName: string;
  userId: string;
  username: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create game room');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating game room:', error);
    throw error;
  }
}

export async function getGameRooms(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch game rooms');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching game rooms:', error);
    return [];
  }
}

export async function getGameRoom(roomId: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching game room ${roomId}:`, error);
    return null;
  }
}

export async function joinGameRoom(roomId: string, data: {
  userId: string;
  username: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to join game room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error joining game room ${roomId}:`, error);
    throw error;
  }
}

export async function takeSeat(roomId: string, data: {
  userId: string;
  seat: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/take-seat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to take seat in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error taking seat in room ${roomId}:`, error);
    throw error;
  }
}

export async function selectDeck(roomId: string, data: {
  userId: string;
  deckId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/select-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to select deck in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error selecting deck in room ${roomId}:`, error);
    throw error;
  }
}

export async function setPlayerReady(roomId: string, data: {
  userId: string;
  isReady?: boolean;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/ready`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to set ready in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error setting ready in room ${roomId}:`, error);
    throw error;
  }
}

export async function leaveGameRoom(roomId: string, data: {
  userId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to leave game room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error leaving game room ${roomId}:`, error);
    throw error;
  }
}

export async function drawCard(roomId: string, data: {
  userId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/draw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to draw card in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error drawing card in room ${roomId}:`, error);
    throw error;
  }
}

export async function playCard(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
  zone?: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to play card in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error playing card in room ${roomId}:`, error);
    throw error;
  }
}

export async function discardCard(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/discard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to discard card in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error discarding card in room ${roomId}:`, error);
    throw error;
  }
}

export async function moveFieldCardToHell(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/field-to-hell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to move field card to hell in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error moving field card to hell in room ${roomId}:`, error);
    throw error;
  }
}

export async function moveFieldCardToHand(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/field-to-hand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to move field card to hand in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error moving field card to hand in room ${roomId}:`, error);
    throw error;
  }
}

export async function moveFieldCardToDeck(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/field-to-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to move field card to deck in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error moving field card to deck in room ${roomId}:`, error);
    throw error;
  }
}

export async function searchCardFromDeck(roomId: string, data: {
  userId: string;
  cardId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/search-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to search card from deck in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error searching card from deck in room ${roomId}:`, error);
    throw error;
  }
}

export async function searchCardFromHell(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/search-hell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to search card from hell in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error searching card from hell in room ${roomId}:`, error);
    throw error;
  }
}

export async function shuffleDeck(roomId: string, data: {
  userId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/shuffle-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to shuffle deck in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error shuffling deck in room ${roomId}:`, error);
    throw error;
  }
}

export async function flipLifeCard(roomId: string, data: {
  userId: string;
  lifeCardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/flip-life-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to flip life card in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error flipping life card in room ${roomId}:`, error);
    throw error;
  }
}

export async function moveAvatarToOpponentField(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/move-avatar-to-opponent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to move avatar to opponent field in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error moving avatar to opponent field in room ${roomId}:`, error);
    throw error;
  }
}

export async function toggleCardRotation(roomId: string, data: {
  userId: string;
  cardInstanceId: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms/${roomId}/toggle-rotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to toggle card rotation in room ${roomId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error toggling card rotation in room ${roomId}:`, error);
    throw error;
  }
}
