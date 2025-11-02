import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { searchCards, getDistinctCardValues, createDeck } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface DeckCard extends CardType {
  quantity: number;
  isLifeCard?: boolean;
  isSideDeck?: boolean;
}

export function useDeckBuilder() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
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
  const [deckAuthor, setDeckAuthor] = useState('');
  const [deckArchetype, setDeckArchetype] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  // Filter options
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
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
    if (!deckName || !deckAuthor || selectedCards.length === 0) {
      alert('กรุณากรอกชื่อเด็ค ชื่อผู้สร้าง และเลือกการ์ดอย่างน้อย 1 ใบ');
      return;
    }

    const lifeCardCount = getLifeCardCount();
    if (lifeCardCount !== 5) {
      alert('กรุณาเลือกไลฟ์การ์ดให้ครบ 5 ใบ');
      return;
    }

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

    const deck = {
      name: deckName,
      author: deckAuthor,
      archetype: deckArchetype || 'Other',
      description: deckDescription,
      cardIds,
      sideDeckIds,
      wins: 0,
      views: 0,
      likes: 0,
      gradient: 'from-blue-500 to-purple-600',
    };

    const result = await createDeck(deck);
    setSaving(false);

    if (result) {
      alert('สร้างเด็คสำเร็จ!');
      router.push('/decks');
    } else {
      alert('เกิดข้อผิดพลาดในการสร้างเด็ค');
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
      .filter((card) => card.isLifeCard === false && card.ex === 'Only #1' && !card.isSideDeck)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getSideDeckCardCount = () => {
    return selectedCards
      .filter((card) => card.isSideDeck)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getSideDeckOnlyOneCount = () => {
    return selectedCards
      .filter((card) => card.isSideDeck && card.ex === 'Only #1')
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getMaxDeckSize = () => {
    const onlyOneCount = getOnlyOneCardCount();
    return onlyOneCount > 0 ? 49 : 50;
  };

  const isMainDeckFull = () => {
    const maxDeckSize = getMaxDeckSize();
    const totalCards = getTotalCardCount();
    return totalCards >= maxDeckSize;
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
    deckAuthor,
    setDeckAuthor,
    deckArchetype,
    setDeckArchetype,
    deckDescription,
    setDeckDescription,
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
  };
}
