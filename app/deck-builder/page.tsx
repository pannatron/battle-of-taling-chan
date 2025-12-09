'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card as CardType } from '@/types/card';
import { useDeckBuilder } from '@/hooks/useDeckBuilder';
import { addCardToDeck, removeCardFromDeck, isOnlyOneCard } from '@/lib/deckCardUtils';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, ArrowLeft, Filter, Download, FileInput } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { DeckFilters } from '@/components/deck-builder/DeckFilters';
import { DeckCardsList } from '@/components/deck-builder/DeckCardsList';
import { SearchResults } from '@/components/deck-builder/SearchResults';
import { DeckVisualization } from '@/components/deck-builder/DeckVisualization';
import { DeckLoader } from '@/components/deck-builder/DeckLoader';
import { DeckCodeImporter } from '@/components/deck-builder/DeckCodeImporter';

const ITEMS_PER_PAGE = 80;

export default function DeckBuilderPage() {
  const searchParams = useSearchParams();
  const deckBuilder = useDeckBuilder();
  const { toast } = useToast();
  const [visualizationMode, setVisualizationMode] = useState<'compact' | 'grid'>('compact');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeckLoader, setShowDeckLoader] = useState(false);
  const [showCodeImporter, setShowCodeImporter] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState(false);

  // Auto-load deck from URL parameter
  useEffect(() => {
    const loadDeckId = searchParams.get('loadDeckId');
    const editMode = searchParams.get('edit') === 'true';
    if (loadDeckId) {
      handleLoadDeck(loadDeckId, editMode);
    }
  }, [searchParams]);

  // Reset to page 1 when search results change
  useMemo(() => {
    setCurrentPage(1);
  }, [deckBuilder.searchResults]);

  const lifeCards = deckBuilder.selectedCards.filter((card) => card.isLifeCard);
  const onlyOneCards = deckBuilder.selectedCards.filter(
    (card) => !card.isLifeCard && isOnlyOneCard(card.ex) && !card.isSideDeck
  );
  const sideDeckCards = deckBuilder.selectedCards.filter((card) => card.isSideDeck);
  const deckCards = deckBuilder.selectedCards.filter(
    (card) => !card.isLifeCard && !isOnlyOneCard(card.ex) && !card.isSideDeck
  );

  // Calculate pagination
  const totalPages = Math.ceil(deckBuilder.searchResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = deckBuilder.searchResults.slice(startIndex, endIndex);

  const handleAddCard = (card: CardType, target: 'main' | 'life' | 'side') => {
    const newCards = addCardToDeck(
      card,
      deckBuilder.selectedCards,
      target,
      deckBuilder.getTotalCardCount,
      deckBuilder.getLifeCardCount,
      deckBuilder.getSideDeckCardCount,
      deckBuilder.getSideDeckOnlyOneCount,
      deckBuilder.getOnlyOneCardCount,
      deckBuilder.getMaxDeckSize,
      deckBuilder.isMainDeckFull,
      deckBuilder.allCards
    );
    deckBuilder.setSelectedCards(newCards);
  };

  const handleRemoveCard = (
    cardId: string,
    isLife: boolean,
    isOnlyOne: boolean,
    isSideDeck: boolean
  ) => {
    const newCards = removeCardFromDeck(
      cardId,
      deckBuilder.selectedCards,
      isLife,
      isOnlyOne,
      isSideDeck
    );
    deckBuilder.setSelectedCards(newCards);
  };

  const handleClearSection = (section: 'life' | 'onlyOne' | 'sideDeck' | 'deck') => {
    switch (section) {
      case 'life':
        deckBuilder.setSelectedCards(
          deckBuilder.selectedCards.filter((c) => !c.isLifeCard)
        );
        break;
      case 'onlyOne':
        deckBuilder.setSelectedCards(
          deckBuilder.selectedCards.filter((c) => !isOnlyOneCard(c.ex) || c.isSideDeck)
        );
        break;
      case 'sideDeck':
        deckBuilder.setSelectedCards(
          deckBuilder.selectedCards.filter((c) => !c.isSideDeck)
        );
        break;
      case 'deck':
        deckBuilder.setSelectedCards(
          deckBuilder.selectedCards.filter(
            (c) => c.isLifeCard || isOnlyOneCard(c.ex) || c.isSideDeck
          )
        );
        break;
    }
  };

  const handleLoadDeck = async (deckId: string, isEditMode: boolean = false) => {
    setLoadingDeck(true);
    const success = await deckBuilder.loadDeckById(deckId, isEditMode);
    setLoadingDeck(false);
    
    if (success) {
      setShowDeckLoader(false);
      toast({
        title: 'สำเร็จ!',
        description: isEditMode ? 'โหลดเด็คเพื่อแก้ไขเรียบร้อยแล้ว' : 'โหลดเด็คเข้าสู่ Deck Builder เรียบร้อยแล้ว',
      });
    } else {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดเด็คได้',
        variant: 'destructive',
      });
    }
  };

  const handleImportCards = (
    cards: { card: CardType; quantity: number; section: 'main' | 'life' }[],
    deckName?: string
  ) => {
    // Clear old deck and start with empty array
    let newSelectedCards: typeof deckBuilder.selectedCards = [];

    cards.forEach(({ card, quantity, section }) => {
      for (let i = 0; i < quantity; i++) {
        const target = section === 'life' ? 'life' : 'main';
        newSelectedCards = addCardToDeck(
          card,
          newSelectedCards,
          target,
          () => newSelectedCards.filter(c => !c.isLifeCard && !c.isSideDeck).length,
          () => newSelectedCards.filter(c => c.isLifeCard).length,
          () => newSelectedCards.filter(c => c.isSideDeck).length,
          () => newSelectedCards.filter(c => c.isSideDeck && isOnlyOneCard(c.ex)).length,
          () => newSelectedCards.filter(c => !c.isLifeCard && isOnlyOneCard(c.ex) && !c.isSideDeck).length,
          deckBuilder.getMaxDeckSize,
          () => newSelectedCards.filter(c => !c.isLifeCard && !c.isSideDeck).length >= deckBuilder.getMaxDeckSize(),
          deckBuilder.allCards
        );
      }
    });

    deckBuilder.setSelectedCards(newSelectedCards);
    
    // Auto-fill deck name if provided
    if (deckName) {
      deckBuilder.setDeckName(deckName);
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-[1800px]">
        <div className="mb-4 md:mb-6">
          <Link
            href="/decks"
            className="mb-2 md:mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Decks
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-transparent">
                Deck Builder
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Build your deck with 5 life cards, 1 only one card (optional), up to{' '}
                {deckBuilder.getMaxDeckSize()} deck cards, and up to 11 side deck cards (1 Only One +
                10 regular OR 11 regular)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCodeImporter(true)}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <FileInput className="h-4 w-4" />
                <span className="hidden sm:inline">Import Codes</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button
                onClick={() => setShowDeckLoader(true)}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Load Deck</span>
                <span className="sm:hidden">Load</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Left Sidebar - Filters */}
          <div className={`w-full lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <DeckFilters
              nameFilter={deckBuilder.nameFilter}
              setNameFilter={deckBuilder.setNameFilter}
              nameSuggestions={deckBuilder.nameSuggestions}
              showSuggestions={deckBuilder.showSuggestions}
              setShowSuggestions={deckBuilder.setShowSuggestions}
              loadNameSuggestions={deckBuilder.loadNameSuggestions}
              typeFilter={deckBuilder.typeFilter}
              setTypeFilter={deckBuilder.setTypeFilter}
              rarityFilter={deckBuilder.rarityFilter}
              setRarityFilter={deckBuilder.setRarityFilter}
              seriesFilter={deckBuilder.seriesFilter}
              setSeriesFilter={deckBuilder.setSeriesFilter}
              types={deckBuilder.types}
              rarities={deckBuilder.rarities}
              series={deckBuilder.series}
              clearFilters={deckBuilder.clearFilters}
              deckName={deckBuilder.deckName}
              setDeckName={deckBuilder.setDeckName}
              deckArchetype={deckBuilder.deckArchetype}
              setDeckArchetype={deckBuilder.setDeckArchetype}
          deckDescription={deckBuilder.deckDescription}
          setDeckDescription={deckBuilder.setDeckDescription}
          selectedCards={deckBuilder.selectedCards}
          coverCardId={deckBuilder.coverCardId}
          setCoverCardId={deckBuilder.setCoverCardId}
          coverCardId2={deckBuilder.coverCardId2}
          setCoverCardId2={deckBuilder.setCoverCardId2}
          handleSaveDeck={deckBuilder.handleSaveDeck}
          saving={deckBuilder.saving}
          hasCards={deckBuilder.selectedCards.length > 0}
        />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
            {/* View Mode Toggle - Top */}
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant={visualizationMode === 'compact' ? 'default' : 'outline'}
                onClick={() => setVisualizationMode('compact')}
                className="text-xs sm:text-sm"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Mode</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                size="sm"
                variant={visualizationMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setVisualizationMode('grid')}
                className="text-xs sm:text-sm"
              >
                <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Mode</span>
                <span className="sm:hidden">View</span>
              </Button>
            </div>

            {visualizationMode === 'grid' ? (
              /* View Mode - Full Deck Visualization */
              <DeckVisualization
                lifeCards={lifeCards}
                onlyOneCards={onlyOneCards}
                sideDeckCards={sideDeckCards}
                deckCards={deckCards}
                deckName={deckBuilder.deckName}
              />
            ) : (
              /* Edit Mode - Card Management */
              <DeckCardsList
                lifeCards={lifeCards}
                onlyOneCards={onlyOneCards}
                sideDeckCards={sideDeckCards}
                deckCards={deckCards}
                getLifeCardCount={deckBuilder.getLifeCardCount}
                getOnlyOneCardCount={deckBuilder.getOnlyOneCardCount}
                getSideDeckCardCount={deckBuilder.getSideDeckCardCount}
                getTotalCardCount={deckBuilder.getTotalCardCount}
                getMaxDeckSize={deckBuilder.getMaxDeckSize}
                isMainDeckFull={deckBuilder.isMainDeckFull}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                onClearSection={handleClearSection}
              />
            )}

            {/* Search Results */}
            <SearchResults
              searchResults={paginatedResults}
              totalResults={deckBuilder.searchResults.length}
              loading={deckBuilder.loading}
              isMainDeckFull={deckBuilder.isMainDeckFull()}
              onCardClick={handleAddCard}
              onRemoveCard={handleRemoveCard}
              selectedCards={deckBuilder.selectedCards}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              getLifeCardCount={deckBuilder.getLifeCardCount}
            />
          </div>
        </div>
      </div>

      {/* Deck Loader Modal */}
      {showDeckLoader && (
        <DeckLoader
          onLoadDeck={handleLoadDeck}
          onClose={() => setShowDeckLoader(false)}
          loading={loadingDeck}
        />
      )}

      {/* Deck Code Importer Modal */}
      {showCodeImporter && (
        <DeckCodeImporter
          onImport={handleImportCards}
          onClose={() => setShowCodeImporter(false)}
        />
      )}
    </div>
  );
}
