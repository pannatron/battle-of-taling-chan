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
