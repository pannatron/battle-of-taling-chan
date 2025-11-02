'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { searchCards, getDistinctCardValues, createDeck } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Trash2, Save, X, ArrowLeft, Heart, Grid3x3, List, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface DeckCard extends CardType {
  quantity: number;
  isLifeCard?: boolean;
  isSideDeck?: boolean;
}

export default function DeckBuilderPage() {
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
  
  // Visualization mode
  const [visualizationMode, setVisualizationMode] = useState<'compact' | 'grid'>('compact');
  const [exporting, setExporting] = useState(false);

  // Filter options
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce for 300ms

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

    setNameSuggestions(results.slice(0, 10)); // Limit to 10 suggestions
    setShowSuggestions(true);
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameFilter(value);
    if (value.length > 0) {
      loadNameSuggestions(value);
    }
  };

  const selectSuggestion = (cardName: string) => {
    setNameFilter(cardName);
    setShowSuggestions(false);
    setNameSuggestions([]);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
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

  const getMaxSideDeckSize = () => {
    const onlyOneCount = getSideDeckOnlyOneCount();
    return onlyOneCount > 0 ? 11 : 11; // Always 11, but composition varies
  };

  const isMainDeckFull = () => {
    const maxDeckSize = getMaxDeckSize();
    const totalCards = getTotalCardCount();
    return totalCards >= maxDeckSize;
  };

  const getMaxDeckSize = () => {
    const onlyOneCount = getOnlyOneCardCount();
    return onlyOneCount > 0 ? 49 : 50;
  };

  const getCardQuantity = (cardId: string, isLifeCard: boolean = false, isOnlyOne: boolean = false, isSideDeck: boolean = false) => {
    if (isOnlyOne) {
      const card = selectedCards.find(
        (c) => c._id === cardId && c.ex === 'Only #1' && !c.isLifeCard
      );
      return card ? card.quantity : 0;
    }
    if (isSideDeck) {
      const card = selectedCards.find(
        (c) => c._id === cardId && c.isSideDeck
      );
      return card ? card.quantity : 0;
    }
    const card = selectedCards.find(
      (c) => c._id === cardId && c.isLifeCard === isLifeCard
    );
    return card ? card.quantity : 0;
  };

  const addCardToDeck = (card: CardType, targetDeck: 'main' | 'life' | 'side' = 'main') => {
    // Auto-detect if card is a life card based on type
    const isLifeCard = card.type === 'Life' || targetDeck === 'life';
    const isOnlyOne = card.ex === 'Only #1';
    const isSideDeck = targetDeck === 'side';
    
    // Life cards can be added independently of main deck
    if (isLifeCard) {
      const totalLifeCards = getLifeCardCount();
      if (totalLifeCards >= 5) {
        alert('ไลฟ์การ์ดเต็มแล้ว! (จำกัด 5 ใบ)');
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && c.isLifeCard
      );
      if (existingCard) {
        if (existingCard.quantity >= 1) {
          alert('ใส่ไลฟ์การ์ดใบนี้ได้แค่ 1 ใบ');
          return;
        }
      } else {
        setSelectedCards([...selectedCards, { ...card, quantity: 1, isLifeCard: true }]);
      }
      return;
    }
    
    if (isSideDeck) {
      // Check if main deck is full before allowing side deck additions
      if (!isMainDeckFull()) {
        alert('ต้องเติมเด็คหลักให้เต็มก่อน (' + getMaxDeckSize() + ' ใบ) ถึงจะเพิ่มการ์ดในไซด์เด็คได้');
        return;
      }

      const totalSideDeck = getSideDeckCardCount();
      const sideDeckOnlyOneCount = getSideDeckOnlyOneCount();
      const isCardOnlyOne = card.ex === 'Only #1';

      // Check side deck limit: 11 total (1 Only One + 10 regular OR 11 regular)
      if (isCardOnlyOne) {
        // If trying to add Only One card
        if (sideDeckOnlyOneCount >= 1) {
          alert('ไซด์เด็คมี Only One การ์ดได้แค่ 1 ใบ');
          return;
        }
        if (totalSideDeck >= 11) {
          alert('ไซด์เด็คเต็มแล้ว! (จำกัด 11 ใบ)');
          return;
        }
      } else {
        // If trying to add regular card
        const maxRegularCards = sideDeckOnlyOneCount > 0 ? 10 : 11;
        const regularCardsCount = totalSideDeck - sideDeckOnlyOneCount;
        if (regularCardsCount >= maxRegularCards) {
          alert(`ไซด์เด็คมีการ์ดธรรมดาเต็มแล้ว! (จำกัด ${maxRegularCards} ใบ)`);
          return;
        }
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && c.isSideDeck
      );
      if (existingCard) {
        if (isCardOnlyOne) {
          alert('ใส่ Only One การ์ดได้แค่ 1 ใบในไซด์เด็ค');
          return;
        }
        if (existingCard.quantity >= 4) {
          alert('ใส่การ์ดใบนี้ได้สูงสุด 4 ใบในไซด์เด็ค');
          return;
        }
        setSelectedCards(
          selectedCards.map((c) =>
            c._id === card._id && c.isSideDeck
              ? { ...c, quantity: c.quantity + 1 }
              : c
          )
        );
      } else {
        setSelectedCards([...selectedCards, { ...card, quantity: 1, isSideDeck: true }]);
      }
    } else if (isOnlyOne) {
      const totalOnlyOne = getOnlyOneCardCount();
      if (totalOnlyOne >= 1) {
        alert('Only One การ์ดเต็มแล้ว! (จำกัด 1 ใบ)');
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && c.ex === 'Only #1'
      );
      if (existingCard) {
        alert('ใส่ Only One การ์ดได้แค่ 1 ใบ');
        return;
      } else {
        setSelectedCards([...selectedCards, { ...card, quantity: 1, isLifeCard: false }]);
      }
    } else {
      const maxDeckSize = getMaxDeckSize();
      const totalCards = getTotalCardCount();
      if (totalCards >= maxDeckSize) {
        alert(`เด็คเต็มแล้ว! (จำกัด ${maxDeckSize} ใบ)`);
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && !c.isLifeCard
      );
      if (existingCard) {
        if (existingCard.quantity >= 4) {
          alert('ใส่การ์ดใบนี้ได้สูงสุด 4 ใบ');
          return;
        }
        setSelectedCards(
          selectedCards.map((c) =>
            c._id === card._id && !c.isLifeCard
              ? { ...c, quantity: c.quantity + 1 }
              : c
          )
        );
      } else {
        setSelectedCards([
          ...selectedCards,
          { ...card, quantity: 1, isLifeCard: false },
        ]);
      }
    }
  };

  const removeCardFromDeck = (cardId: string, isLifeCard: boolean = false, isOnlyOne: boolean = false, isSideDeck: boolean = false) => {
    if (isOnlyOne) {
      setSelectedCards(
        selectedCards.filter(
          (c) => !(c._id === cardId && c.ex === 'Only #1')
        )
      );
      return;
    }

    if (isSideDeck) {
      const existingCard = selectedCards.find(
        (c) => c._id === cardId && c.isSideDeck
      );
      if (existingCard && existingCard.quantity > 1) {
        setSelectedCards(
          selectedCards.map((c) =>
            c._id === cardId && c.isSideDeck
              ? { ...c, quantity: c.quantity - 1 }
              : c
          )
        );
      } else {
        setSelectedCards(
          selectedCards.filter(
            (c) => !(c._id === cardId && c.isSideDeck)
          )
        );
      }
      return;
    }

    const existingCard = selectedCards.find(
      (c) => c._id === cardId && c.isLifeCard === isLifeCard
    );
    if (existingCard && existingCard.quantity > 1) {
      setSelectedCards(
        selectedCards.map((c) =>
          c._id === cardId && c.isLifeCard === isLifeCard
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
      );
    } else {
      setSelectedCards(
        selectedCards.filter(
          (c) => !(c._id === cardId && c.isLifeCard === isLifeCard)
        )
      );
    }
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
    // Expand card IDs based on quantities (only deck cards, not life cards or side deck)
    const cardIds: string[] = [];
    selectedCards
      .filter((card) => !card.isLifeCard && !card.isSideDeck)
      .forEach((card) => {
        for (let i = 0; i < card.quantity; i++) {
          cardIds.push(card._id);
        }
      });

    // Expand side deck card IDs
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

  const exportDeckAsImage = async () => {
    setExporting(true);
    console.log('🚀 Starting export...');
    
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const deckElement = document.getElementById('deck-visualization');
      if (!deckElement) {
        alert('ไม่สามารถส่งออกรูปภาพได้');
        setExporting(false);
        return;
      }

      console.log('📦 Element found, preparing for capture...');

      // Wait for all images to load
      const images = deckElement.querySelectorAll('img');
      console.log(`🖼️ Found ${images.length} images to load...`);
      
      const imagePromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          // Skip if already loaded or data URL
          if (img.complete || img.src.startsWith('data:')) {
            console.log('✅ Image already loaded or is data URL');
            resolve();
            return;
          }

          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              console.warn('⏱️ Image load timeout:', img.src);
              resolved = true;
              resolve();
            }
          }, 10000); // 10 second timeout per image
          
          img.onload = () => {
            if (!resolved) {
              console.log('✅ Image loaded:', img.src.substring(0, 50) + '...');
              resolved = true;
              clearTimeout(timeout);
              resolve();
            }
          };
          
          img.onerror = () => {
            if (!resolved) {
              console.error('❌ Failed to load image:', img.src);
              resolved = true;
              clearTimeout(timeout);
              resolve();
            }
          };

          // Force reload if needed
          if (!img.complete) {
            const src = img.src;
            img.src = '';
            img.src = src;
          }
        });
      });

      console.log('⏳ Waiting for all images to load...');
      await Promise.all(imagePromises);
      console.log('✅ All images loaded');

      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(deckElement, {
        backgroundColor: '#1a1a1a',
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          console.log('🔧 onclone callback triggered');
          
          // Inject a style tag that overrides all oklch() colors with RGB equivalents
          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = `
            * {
              /* Override all Tailwind/oklch colors with safe RGB fallbacks */
              --background: #fafafa !important;
              --foreground: #1f1f1f !important;
              --card: #ffffff !important;
              --card-foreground: #1f1f1f !important;
              --popover: #fafafa !important;
              --popover-foreground: #1f1f1f !important;
              --primary: #7c3aed !important;
              --primary-foreground: #fafafa !important;
              --secondary: #0ea5e9 !important;
              --secondary-foreground: #fafafa !important;
              --muted: #e5e5e5 !important;
              --muted-foreground: #737373 !important;
              --accent: #d946ef !important;
              --accent-foreground: #fafafa !important;
              --destructive: #ef4444 !important;
              --destructive-foreground: #fafafa !important;
              --border: #d4d4d4 !important;
              --input: #d4d4d4 !important;
              --ring: #7c3aed !important;
            }
            
            /* Force all background colors to be transparent or solid colors */
            .bg-muted, [class*="bg-muted"] {
              background-color: #e5e5e5 !important;
            }
            .bg-background, [class*="bg-background"] {
              background-color: #fafafa !important;
            }
            .bg-white {
              background-color: #ffffff !important;
            }
            
            /* Remove all gradient backgrounds */
            [class*="bg-gradient"],
            [class*="from-"],
            [class*="to-"],
            [class*="via-"] {
              background-image: none !important;
              background-color: #1a1a1a !important;
            }
            
            /* Force text colors */
            .text-white, [class*="text-white"] {
              color: #ffffff !important;
            }
            .text-black, [class*="text-black"] {
              color: #000000 !important;
            }
            .text-muted-foreground {
              color: #737373 !important;
            }
            
            /* Ensure borders are visible */
            .border, [class*="border-"] {
              border-color: #d4d4d4 !important;
            }
            .border-dashed {
              border-style: dashed !important;
            }
            
            /* Ring colors for badges */
            .ring-black {
              --tw-ring-color: #000000 !important;
            }
            .ring-cyan-500 {
              --tw-ring-color: #06b6d4 !important;
            }
            .ring-2 {
              box-shadow: 0 0 0 2px var(--tw-ring-color, #000000) !important;
            }
          `;
          clonedDoc.head.appendChild(styleEl);
          console.log('✅ Injected RGB color overrides');
          
          // Remove problematic classes
          const allElements = clonedDoc.querySelectorAll('*');
          console.log(`🔍 Processing ${allElements.length} elements...`);
          
          let modifiedCount = 0;
          allElements.forEach((element) => {
            const el = element as HTMLElement;
            
            // Remove gradient-related classes
            const classList = Array.from(el.classList);
            classList.forEach(className => {
              if (className.includes('bg-gradient') || 
                  className.includes('text-gradient') || 
                  className.includes('bg-clip-text') ||
                  className.includes('text-transparent')) {
                el.classList.remove(className);
                modifiedCount++;
              }
            });
          });
          
          console.log(`✅ Modified ${modifiedCount} problematic classes`);
        },
      });

      console.log('✨ Canvas created successfully!');

      // Convert canvas to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          console.log('💾 Blob created, downloading...');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${deckName || 'deck'}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('✅ Download complete!');
        } else {
          console.error('❌ Failed to create blob');
          alert('ไม่สามารถสร้างไฟล์รูปภาพได้');
        }
        setExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('❌ Export error:', error);
      console.error('Error stack:', (error as Error).stack);
      alert('เกิดข้อผิดพลาดในการส่งออกรูปภาพ: ' + (error as Error).message);
      setExporting(false);
    }
  };

  const getRarityColor = (rare: string) => {
    switch (rare) {
      case 'UR':
        return 'from-yellow-500 to-orange-500';
      case 'SR':
        return 'from-purple-500 to-pink-500';
      case 'PR':
        return 'from-blue-500 to-cyan-500';
      case 'CBR':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const lifeCards = selectedCards.filter((card) => card.isLifeCard);
  const onlyOneCards = selectedCards.filter((card) => !card.isLifeCard && card.ex === 'Only #1' && !card.isSideDeck);
  const sideDeckCards = selectedCards.filter((card) => card.isSideDeck);
  const sideDeckOnlyOneCards = sideDeckCards.filter((card) => card.ex === 'Only #1');
  const sideDeckRegularCards = sideDeckCards.filter((card) => card.ex !== 'Only #1');
  const deckCards = selectedCards.filter((card) => !card.isLifeCard && card.ex !== 'Only #1' && !card.isSideDeck);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-[1800px]">
        <div className="mb-6">
          <Link
            href="/decks"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Decks
          </Link>
          <h1 className="mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Deck Builder
          </h1>
          <p className="text-muted-foreground">
            Build your deck with 5 life cards, 1 only one card (optional), up to {getMaxDeckSize()} deck cards, and up to 11 side deck cards (1 Only One + 10 regular OR 11 regular)
          </p>
        </div>

        <div className="flex gap-4">
          {/* Left Sidebar - Filters */}
          <div className="w-64 shrink-0">
            <Card className="border-2 sticky top-4">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold">🔍 Filters</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 relative">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Card Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Search..."
                    value={nameFilter}
                    onChange={handleNameInputChange}
                    onFocus={() => {
                      if (nameFilter && nameSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="h-8 text-sm"
                    autoComplete="off"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {nameSuggestions.map((card) => (
                        <div
                          key={card._id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center gap-2 text-sm"
                          onClick={() => selectSuggestion(card.name)}
                        >
                          {card.imageUrl && (
                            <div className="relative w-8 h-12 flex-shrink-0">
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain rounded"
                                sizes="32px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{card.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {card.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1 py-0 bg-gradient-to-r ${getRarityColor(card.rare)} text-white border-0`}
                              >
                                {card.rare}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">
                    Type
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type" className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rarity" className="text-xs font-semibold">
                    Rarity
                  </Label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger id="rarity" className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {rarities.map((rarity) => (
                        <SelectItem key={rarity} value={rarity}>
                          {rarity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="series" className="text-xs font-semibold">
                    Series
                  </Label>
                  <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                    <SelectTrigger id="series" className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {series.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex-1 h-8 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear Filters
                  </Button>
                </div>

                {/* Deck Info in Sidebar */}
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="text-sm font-bold">📝 Deck Info</h3>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="deckName" className="text-xs">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deckName"
                      placeholder="Deck name"
                      value={deckName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckAuthor" className="text-xs">
                      Author <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deckAuthor"
                      placeholder="Your name"
                      value={deckAuthor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckAuthor(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckArchetype" className="text-xs">
                      Archetype
                    </Label>
                    <Input
                      id="deckArchetype"
                      placeholder="e.g. Aggro"
                      value={deckArchetype}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckArchetype(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckDescription" className="text-xs">
                      Description
                    </Label>
                    <Textarea
                      id="deckDescription"
                      placeholder="Deck strategy..."
                      value={deckDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeckDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary via-accent to-secondary font-bold"
                    onClick={handleSaveDeck}
                    disabled={saving || selectedCards.length === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Deck'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-4">
            {/* View Mode Toggle - Top */}
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant={visualizationMode === 'compact' ? 'default' : 'outline'}
                onClick={() => setVisualizationMode('compact')}
              >
                <List className="h-4 w-4 mr-2" />
                Edit Mode
              </Button>
              <Button
                size="sm"
                variant={visualizationMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setVisualizationMode('grid')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                View Mode
              </Button>
              {visualizationMode === 'grid' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportDeckAsImage}
                  disabled={exporting || selectedCards.length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'กำลังส่งออก...' : 'ส่งออกรูป'}
                </Button>
              )}
            </div>

            {visualizationMode === 'grid' ? (
              /* Full Deck Visualization - View Mode (No Card borders, no headings) */
              <div id="deck-visualization" className="space-y-3 p-3 bg-muted/30 rounded-lg">
                {/* Main Deck Grid - 8 cards per row */}
                {deckCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    No cards in main deck
                  </div>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5">
                    {deckCards.map((card) => (
                      <div
                        key={`deck-view-${card._id}`}
                        className="group relative transition-all hover:scale-125 hover:z-10"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-md">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="10vw"
                            />
                            {/* Quantity badge - Center */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-xl ring-2 ring-black">
                              {card.quantity}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Side Deck, Life Cards, and Only One - Bottom Row */}
                <div className="flex items-end justify-between gap-4">
                  {/* Side Deck - Left Side */}
                  <div className="flex items-center gap-2 pb-8">
                    {/* Vertical SIDE text */}
                    <div className="flex items-center justify-center w-6">
                      <div className="text-lg font-bold text-white" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                        SIDE
                      </div>
                    </div>
                    
                    {/* Side Deck Cards */}
                    {sideDeckCards.length === 0 ? (
                      <div className="w-24 py-6 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                        No side deck
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Only One card from side deck */}
                        {sideDeckOnlyOneCards.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {sideDeckOnlyOneCards.map((card) => (
                              <div
                                key={`side-only-view-${card._id}`}
                                className="w-20 transition-all hover:scale-125 hover:z-10"
                              >
                                {card.imageUrl && (
                                  <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                                    <Image
                                      src={card.imageUrl}
                                      alt={card.name}
                                      fill
                                      className="object-contain"
                                      sizes="80px"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                    {/* Regular side deck cards */}
                    {sideDeckRegularCards.length > 0 && (
                      <div className="flex items-end">
                        {sideDeckRegularCards.map((card, index) => (
                          <div
                            key={`side-regular-view-${card._id}`}
                            className="w-20 transition-all hover:scale-125 hover:z-10"
                            style={{ marginLeft: index > 0 ? '-1rem' : '0' }}
                          >
                            {card.imageUrl && (
                              <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.name}
                                  fill
                                  className="object-contain"
                                  sizes="80px"
                                />
                                {/* Quantity badge */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-xl ring-2 ring-cyan-500">
                                  {card.quantity}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                  
                  {/* Life Cards and Only One - Right Side */}
                  <div className="flex items-start gap-4">
                    {/* Life Cards Stack */}
                    {lifeCards.length === 0 ? (
                      <div className="w-24 py-6 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                        No life cards
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="relative w-25" style={{ height: `${8 + (lifeCards.length - 1) * 2.5}rem` }}>
                          {lifeCards.map((card, index) => (
                            <div
                              key={`life-view-${card._id}`}
                              className="absolute left-1/2 -translate-x-1/2 w-19 transition-all hover:scale-125 hover:z-8"
                              style={{ top: `${index * 2.5}rem` }}
                            >
                              {card.imageUrl && (
                                <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    className="object-contain"
                                    sizes="112px"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Only One Card */}
                    {onlyOneCards.length === 0 ? (
                      <div className="w-48 py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        No only one card
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        {onlyOneCards.map((card) => (
                          <div
                            key={`only-view-${card._id}`}
                            className="w-48 transition-all hover:scale-105"
                          >
                            {card.imageUrl && (
                              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted/30 shadow-2xl">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.name}
                                  fill
                                  className="object-contain"
                                  sizes="192px"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode - Original Layout with Cards */
              <>
                {/* Life Cards, Only One, and Side Deck - Compact Layout */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Life Cards & Only One - Combined in One Card, Same Row */}
                  <Card className="border-2">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex gap-4 items-stretch">
                        {/* Life Cards Section */}
                        <div className="flex-1 flex flex-col">
                          <h2 className="text-sm font-bold flex items-center gap-1 leading-6 mb-1.5">
                            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                            Life{' '}
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                              ({getLifeCardCount()}/5)
                            </span>
                          </h2>
                          {lifeCards.length === 0 ? (
                            <div className="py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                              Add life cards
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-1.5 justify-start flex-wrap mb-1.5">
                                {lifeCards.map((card) => (
                                <div
                                  key={`life-${card._id}`}
                                  className="group relative w-16 transition-all hover:scale-[3] hover:z-50"
                                >
                                  {card.imageUrl && (
                                    <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-red-500 bg-muted/30 shadow-lg">
                                      <Image
                                        src={card.imageUrl}
                                        alt={card.name}
                                        fill
                                        className="object-contain"
                                        sizes="64px"
                                      />
                                      {/* Hover overlay with controls */}
                                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                        <div className="flex items-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-6 w-6 p-0 text-xs"
                                            onClick={() => removeCardFromDeck(card._id, true)}
                                          >
                                            -
                                          </Button>
                                          <span className="text-white text-xs font-bold w-4 text-center">
                                            {card.quantity}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            className="h-6 w-6 p-0 text-xs"
                                            onClick={() => addCardToDeck(card)}
                                            disabled={card.quantity >= 1}
                                          >
                                            +
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedCards(selectedCards.filter(c => !c.isLifeCard))}
                                className="h-5 px-1.5 text-[10px] w-fit"
                              >
                                Clear
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Only One Section */}
                        <div className="flex-shrink-0 flex flex-col items-start">
                          <h2 className="text-sm font-bold flex items-center gap-1 leading-6 mb-1.5">
                            <span className="text-base leading-6">⭐</span>
                            Only One{' '}
                            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                              ({getOnlyOneCardCount()}/1)
                            </span>
                          </h2>
                          {onlyOneCards.length === 0 ? (
                            <div className="w-16 py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                              Only #1
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-1.5 mb-1.5">
                                {onlyOneCards.map((card) => (
                                <div
                                  key={`only-${card._id}`}
                                  className="group relative w-16 transition-all hover:scale-[3] hover:z-50"
                                >
                                  {card.imageUrl && (
                                    <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-yellow-500 bg-muted/30 shadow-lg">
                                      <Image
                                        src={card.imageUrl}
                                        alt={card.name}
                                        fill
                                        className="object-contain"
                                        sizes="64px"
                                      />
                                      {/* Hover overlay with controls */}
                                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => removeCardFromDeck(card._id, false, true)}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedCards(selectedCards.filter(c => c.ex !== 'Only #1'))}
                                className="h-5 px-1.5 text-[10px] w-fit"
                              >
                                Clear
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Side Deck Section */}
                  <Card className="border-2">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <h2 className="text-sm font-bold flex items-center gap-1">
                          <span className="text-base">🔄</span>
                          Side Deck{' '}
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            ({getSideDeckCardCount()}/11)
                          </span>
                        </h2>
                        {sideDeckCards.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCards(selectedCards.filter(c => !c.isSideDeck))}
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {sideDeckCards.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                          {isMainDeckFull() ? 'Right-click to add' : 'Fill main deck first'}
                        </div>
                ) : (
                  <div className="flex gap-1.5 flex-wrap">
                    {/* Only One card first */}
                    {sideDeckOnlyOneCards.map((card) => (
                      <div
                        key={`side-only-${card._id}`}
                        className="group relative w-16 transition-all hover:scale-[3] hover:z-50"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-yellow-500 bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="64px"
                            />
                            {/* Hover overlay with controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 px-2 text-xs"
                                onClick={() => removeCardFromDeck(card._id, false, false, true)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Spacer if Only One exists */}
                    {sideDeckOnlyOneCards.length > 0 && sideDeckRegularCards.length > 0 && (
                      <div className="w-4"></div>
                    )}
                    
                    {/* Regular cards */}
                    {sideDeckRegularCards.map((card) => (
                      <div
                        key={`side-regular-${card._id}`}
                        className="group relative w-16 transition-all hover:scale-[3] hover:z-50"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-cyan-500 bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="64px"
                            />
                            {/* Quantity badge */}
                            <div className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-bold text-white shadow-lg ring-1 ring-background">
                              {card.quantity}
                            </div>
                            {/* Hover overlay with controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => removeCardFromDeck(card._id, false, false, true)}
                                >
                                  -
                                </Button>
                                <span className="text-white text-xs font-bold w-4 text-center">
                                  {card.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => addCardToDeck(card, 'side')}
                                  disabled={card.quantity >= 4 || getSideDeckCardCount() >= 11}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Deck Cards Section - Edit Mode */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">
                        🎴 Main Deck{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          ({getTotalCardCount()}/{getMaxDeckSize()})
                        </span>
                      </h2>
                      {deckCards.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCards(selectedCards.filter(c => c.isLifeCard || c.ex === 'Only #1' || c.isSideDeck))}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {deckCards.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        Click + on Deck button in search results to add cards to main deck
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {deckCards.map((card) => (
                          <div
                            key={`deck-${card._id}`}
                            className="group relative w-20 transition-all hover:scale-[3] hover:z-50"
                          >
                            {card.imageUrl && (
                              <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-border bg-muted/30 shadow-lg">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.name}
                                  fill
                                  className="object-contain"
                                  sizes="80px"
                                />
                                {/* Quantity badge */}
                                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg ring-2 ring-background">
                                  {card.quantity}
                                </div>
                                {/* Hover overlay with controls */}
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-6 w-6 p-0 text-xs"
                                      onClick={() => removeCardFromDeck(card._id, false)}
                                    >
                                      -
                                    </Button>
                                    <span className="text-white text-xs font-bold w-4 text-center">
                                      {card.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 w-6 p-0 text-xs"
                                      onClick={() => addCardToDeck(card)}
                                      disabled={card.quantity >= 4 || getTotalCardCount() >= getMaxDeckSize()}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Search Results */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold">
                  📋 Search Results{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ({searchResults.length})
                  </span>
                </h2>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No cards found
                  </div>
                ) : (
                  <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {searchResults.map((card) => (
                      <div
                        key={card._id}
                        onClick={() => {
                          // If main deck is full, automatically add to side deck
                          if (isMainDeckFull()) {
                            addCardToDeck(card, 'side');
                          } else {
                            addCardToDeck(card);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          addCardToDeck(card, 'side');
                        }}
                        className="group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:scale-[2.5] hover:z-50 hover:shadow-2xl cursor-pointer"
                        title={isMainDeckFull() ? "Click to add to side deck" : "Left click: Add to main deck | Right click: Add to side deck"}
                      >
                        <div
                          className={`h-0.5 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                        />
                        <div className="p-1">
                          {card.imageUrl && (
                            <div className="relative aspect-[2/3] overflow-hidden rounded border border-border bg-muted/30">
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain"
                                sizes="100px"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
