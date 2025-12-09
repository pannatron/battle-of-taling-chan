import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { searchCards, getDistinctCardValues, createDeck, updateDeck, getAllCards, getDeckById, getCardById } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { isOnlyOneCard } from '@/lib/deckCardUtils';
import { getDeckSinCardWarnings } from '@/lib/sinCardValidation';

export interface DeckCard extends CardType {
  quantity: number;
  isLifeCard?: boolean;
  isSideDeck?: boolean;
}

export function useDeckBuilder() {
  const router = useRouter();
  const { user } = useUser();
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search filters
  const [nameFilter, setNameFilter] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<CardType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');

  // Deck metadata
  const [deckName, setDeckName] = useState('');
  const [deckArchetype, setDeckArchetype] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [coverCardId, setCoverCardId] = useState<string>('');
  const [coverCardId2, setCoverCardId2] = useState<string>('');
  
  // Edit mode state
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);

  // Filter options
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    loadAllCards();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nameFilter, typeFilter, rarityFilter, seriesFilter, colorFilter]);

  const loadFilterOptions = async () => {
    const [typesData, raritiesData, seriesData, colorsData] = await Promise.all([
      getDistinctCardValues('type'),
      getDistinctCardValues('rare'),
      getDistinctCardValues('series'),
      getDistinctCardValues('color'),
    ]);

    setTypes(typesData);
    setRarities(raritiesData);
    setSeries(seriesData);
    setColors(colorsData);
  };

  const loadAllCards = async () => {
    try {
      const cards = await getAllCards();
      setAllCards(cards);
    } catch (error) {
      console.error('Failed to load all cards:', error);
    }
  };

  const loadNameSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = await searchCards({
      name: searchTerm,
      type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
      rarity: rarityFilter && rarityFilter !== 'all' ? rarityFilter : undefined,
      series: seriesFilter && seriesFilter !== 'all' ? seriesFilter : undefined,
      color: colorFilter && colorFilter !== 'all' ? colorFilter : undefined,
    });

    setNameSuggestions(results.slice(0, 10));
    setShowSuggestions(true);
  };

  const performSearch = async () => {
    setLoading(true);
    const results = await searchCards({
      name: nameFilter || undefined,
      type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
      rarity: rarityFilter && rarityFilter !== 'all' ? rarityFilter : undefined,
      series: seriesFilter && seriesFilter !== 'all' ? seriesFilter : undefined,
      color: colorFilter && colorFilter !== 'all' ? colorFilter : undefined,
    });
    setSearchResults(results);
    setLoading(false);
  };

  const clearFilters = () => {
    setNameFilter('');
    setTypeFilter('all');
    setRarityFilter('all');
    setSeriesFilter('all');
    setColorFilter('all');
    performSearch();
  };

  const handleSaveDeck = async () => {
    if (!user) {
      alert('กรุณา login ก่อนสร้างเด็ค');
      return;
    }

    if (!deckName || selectedCards.length === 0) {
      alert('กรุณากรอกชื่อเด็ค และเลือกการ์ดอย่างน้อย 1 ใบ');
      return;
    }

    const lifeCardCount = getLifeCardCount();
    if (lifeCardCount !== 5) {
      alert('กรุณาเลือกไลฟ์การ์ดให้ครบ 5 ใบ');
      return;
    }

    // Check if editing and user owns the deck
    const isEditMode = editingDeckId && originalUserId === user.id;

    setSaving(true);
    const cardIds: string[] = [];
    selectedCards
      .filter((card) => !card.isLifeCard && !card.isSideDeck)
      .forEach((card) => {
        for (let i = 0; i < card.quantity; i++) {
          cardIds.push(card._id);
        }
      });

    const sideDeckIds: string[] = [];
    selectedCards
      .filter((card) => card.isSideDeck)
      .forEach((card) => {
        for (let i = 0; i < card.quantity; i++) {
          sideDeckIds.push(card._id);
        }
      });

    const lifeCardIds: string[] = [];
    selectedCards
      .filter((card) => card.isLifeCard)
      .forEach((card) => {
        for (let i = 0; i < card.quantity; i++) {
          lifeCardIds.push(card._id);
        }
      });

    // Get author name from user
    const authorName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'Anonymous';

    const deckData = {
      name: deckName,
      author: authorName,
      archetype: deckArchetype || 'Other',
      description: deckDescription,
      cardIds,
      sideDeckIds,
      lifeCardIds,
      coverCardId: coverCardId && coverCardId !== 'none' ? coverCardId : undefined,
      coverCardId2: coverCardId2 && coverCardId2 !== 'none' ? coverCardId2 : undefined,
      userId: user.id,
    };

    let result;
    if (isEditMode) {
      // Update existing deck
      result = await updateDeck(editingDeckId, deckData);
    } else {
      // Create new deck
      const newDeck = {
        ...deckData,
        wins: 0,
        views: 0,
        likes: 0,
        gradient: 'from-blue-500 to-purple-600',
      };
      result = await createDeck(newDeck);
    }
    
    setSaving(false);

    if (result) {
      alert(isEditMode ? 'แก้ไขเด็คสำเร็จ!' : 'สร้างเด็คสำเร็จ!');
      router.push('/decks?tab=my');
    } else {
      alert(isEditMode ? 'เกิดข้อผิดพลาดในการแก้ไขเด็ค' : 'เกิดข้อผิดพลาดในการสร้างเด็ค');
    }
  };

  const getTotalCardCount = () => {
    return selectedCards
      .filter((card) => !card.isLifeCard && !card.isSideDeck)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getLifeCardCount = () => {
    return selectedCards
      .filter((card) => card.isLifeCard)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getOnlyOneCardCount = () => {
    return selectedCards
      .filter((card) => card.isLifeCard === false && isOnlyOneCard(card.ex) && !card.isSideDeck)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getSideDeckCardCount = () => {
    return selectedCards
      .filter((card) => card.isSideDeck)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getSideDeckOnlyOneCount = () => {
    return selectedCards
      .filter((card) => card.isSideDeck && isOnlyOneCard(card.ex))
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getMaxDeckSize = () => {
    // Deck always has a maximum of 50 cards total
    // (either 50 regular cards OR 1 Only One + 49 regular cards)
    return 50;
  };

  const isMainDeckFull = () => {
    const maxDeckSize = getMaxDeckSize();
    const totalCards = getTotalCardCount();
    return totalCards >= maxDeckSize;
  };

  const getSinCardWarnings = () => {
    return getDeckSinCardWarnings(selectedCards, allCards);
  };

  const loadDeckById = async (deckId: string, isEditMode: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      const deck = await getDeckById(deckId);
      
      if (!deck) {
        alert('ไม่พบเด็คนี้');
        setLoading(false);
        return false;
      }

      // Clear existing cards first
      setSelectedCards([]);
      
      // Load all card details and build DeckCard array
      const deckCardsMap = new Map<string, DeckCard>();

      // Process life cards
      if (deck.lifeCardIds && deck.lifeCardIds.length > 0) {
        for (const cardId of deck.lifeCardIds) {
          const card = await getCardById(cardId);
          if (card) {
            const existingCard = deckCardsMap.get(cardId);
            if (existingCard) {
              existingCard.quantity += 1;
            } else {
              deckCardsMap.set(cardId, {
                ...card,
                quantity: 1,
                isLifeCard: true,
                isSideDeck: false,
              });
            }
          }
        }
      }

      // Process main deck cards
      if (deck.cardIds && deck.cardIds.length > 0) {
        for (const cardId of deck.cardIds) {
          const card = await getCardById(cardId);
          if (card) {
            const existingCard = deckCardsMap.get(cardId);
            if (existingCard && !existingCard.isLifeCard && !existingCard.isSideDeck) {
              existingCard.quantity += 1;
            } else if (!existingCard) {
              deckCardsMap.set(cardId, {
                ...card,
                quantity: 1,
                isLifeCard: false,
                isSideDeck: false,
              });
            }
          }
        }
      }

      // Process side deck cards
      if (deck.sideDeckIds && deck.sideDeckIds.length > 0) {
        for (const cardId of deck.sideDeckIds) {
          const card = await getCardById(cardId);
          if (card) {
            const key = `${cardId}-side`;
            const existingCard = Array.from(deckCardsMap.values()).find(
              c => c._id === cardId && c.isSideDeck
            );
            if (existingCard) {
              existingCard.quantity += 1;
            } else {
              deckCardsMap.set(key, {
                ...card,
                quantity: 1,
                isLifeCard: false,
                isSideDeck: true,
              });
            }
          }
        }
      }

      const loadedCards = Array.from(deckCardsMap.values());
      setSelectedCards(loadedCards);

      // Set deck metadata - only add (Copy) if not in edit mode
      setDeckName(isEditMode ? deck.name : deck.name + ' (Copy)');
      setDeckArchetype(deck.archetype);
      setDeckDescription(deck.description || '');
      setCoverCardId(deck.coverCardId || '');
      setCoverCardId2(deck.coverCardId2 || '');
      
      // Set edit mode state
      if (isEditMode) {
        setEditingDeckId(deck._id);
        setOriginalUserId(deck.userId || null);
      } else {
        setEditingDeckId(null);
        setOriginalUserId(null);
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading deck:', error);
      alert('เกิดข้อผิดพลาดในการโหลดเด็ค');
      setLoading(false);
      return false;
    }
  };

  return {
    searchResults,
    selectedCards,
    setSelectedCards,
    loading,
    saving,
    nameFilter,
    setNameFilter,
    nameSuggestions,
    showSuggestions,
    setShowSuggestions,
    typeFilter,
    setTypeFilter,
    rarityFilter,
    setRarityFilter,
    seriesFilter,
    setSeriesFilter,
    colorFilter,
    setColorFilter,
    deckName,
    setDeckName,
    deckArchetype,
    setDeckArchetype,
    deckDescription,
    setDeckDescription,
    coverCardId,
    setCoverCardId,
    coverCardId2,
    setCoverCardId2,
    types,
    rarities,
    series,
    colors,
    loadNameSuggestions,
    performSearch,
    clearFilters,
    handleSaveDeck,
    getTotalCardCount,
    getLifeCardCount,
    getOnlyOneCardCount,
    getSideDeckCardCount,
    getSideDeckOnlyOneCount,
    getMaxDeckSize,
    isMainDeckFull,
    allCards,
    getSinCardWarnings,
    loadDeckById,
    editingDeckId,
    originalUserId,
  };
}
