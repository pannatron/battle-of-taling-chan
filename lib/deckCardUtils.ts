import { DeckCard } from '@/hooks/useDeckBuilder';
import { Card as CardType } from '@/types/card';
import { validateSinCardConditions } from './sinCardValidation';
import { toast } from '@/hooks/use-toast';

// Helper function to check if card is Only One
export function isOnlyOneCard(ex: string | undefined): boolean {
  if (!ex) return false;
  const normalizedEx = ex.toLowerCase().replace(/\s+/g, '');
  return normalizedEx === 'only#1' || 
         normalizedEx === '#only1' || 
         normalizedEx === 'only1' || 
         normalizedEx === 'onlyone';
}

// Helper function to get total count of cards with the same name (including different levels)
export function getCardCountByName(cardName: string, selectedCards: DeckCard[]): number {
  return selectedCards
    .filter((c) => c.name === cardName && !c.isLifeCard && !c.isSideDeck)
    .reduce((total, card) => total + card.quantity, 0);
}

// Helper function to get total count of cards with the same name in side deck
export function getCardCountByNameInSideDeck(cardName: string, selectedCards: DeckCard[]): number {
  return selectedCards
    .filter((c) => c.name === cardName && c.isSideDeck)
    .reduce((total, card) => total + card.quantity, 0);
}

export function addCardToDeck(
  card: CardType,
  selectedCards: DeckCard[],
  targetDeck: 'main' | 'life' | 'side',
  getTotalCardCount: () => number,
  getLifeCardCount: () => number,
  getSideDeckCardCount: () => number,
  getSideDeckOnlyOneCount: () => number,
  getOnlyOneCardCount: () => number,
  getMaxDeckSize: () => number,
  isMainDeckFull: () => boolean,
  allCards: CardType[] = []
): DeckCard[] {
  // Validate sin card conditions first (if we have all cards data)
  if (allCards.length > 0) {
    const validationResult = validateSinCardConditions(card, selectedCards, allCards);
    if (!validationResult.isValid) {
      // Handle multiple error messages
      const errorMessage = validationResult.errorMessages 
        ? validationResult.errorMessages.join('\n\n') 
        : (validationResult.errorMessage || 'ไม่สามารถใส่การ์ดนี้ได้');
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: errorMessage 
      });
      return selectedCards;
    }
  }

  const isLifeCard = card.type === 'Life' || targetDeck === 'life';
  const isOnlyOne = isOnlyOneCard(card.ex);
  const isSideDeck = targetDeck === 'side';

  // Life cards logic
  if (isLifeCard) {
    const totalLifeCards = getLifeCardCount();
    if (totalLifeCards >= 5) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'ไลฟ์การ์ดเต็มแล้ว! (จำกัด 5 ใบ)' 
      });
      return selectedCards;
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && c.isLifeCard);
    if (existingCard) {
      if (existingCard.quantity >= 1) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: 'ใส่ไลฟ์การ์ดใบนี้ได้แค่ 1 ใบ' 
        });
        return selectedCards;
      }
    } else {
      return [...selectedCards, { ...card, quantity: 1, isLifeCard: true }];
    }
    return selectedCards;
  }

  // Side deck logic
  if (isSideDeck) {
    if (!isMainDeckFull()) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'ต้องเติมเด็คหลักให้เต็มก่อน (' + getMaxDeckSize() + ' ใบ) ถึงจะเพิ่มการ์ดในไซด์เด็คได้' 
      });
      return selectedCards;
    }

    const totalSideDeck = getSideDeckCardCount();
    const sideDeckOnlyOneCount = getSideDeckOnlyOneCount();
    const isCardOnlyOne = isOnlyOneCard(card.ex);

    if (isCardOnlyOne) {
      if (sideDeckOnlyOneCount >= 1) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: 'ไซด์เด็คมี Only One การ์ดได้แค่ 1 ใบ' 
        });
        return selectedCards;
      }
      if (totalSideDeck >= 11) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: 'ไซด์เด็คเต็มแล้ว! (จำกัด 11 ใบ)' 
        });
        return selectedCards;
      }
    } else {
      const maxRegularCards = sideDeckOnlyOneCount > 0 ? 10 : 11;
      const regularCardsCount = totalSideDeck - sideDeckOnlyOneCount;
      if (regularCardsCount >= maxRegularCards) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: `ไซด์เด็คมีการ์ดธรรมดาเต็มแล้ว! (จำกัด ${maxRegularCards} ใบ)` 
        });
        return selectedCards;
      }
    }

    // Check for cards with the same name in side deck (including different levels) - 4 card limit by name
    const totalSameNameCardsInSideDeck = getCardCountByNameInSideDeck(card.name, selectedCards);
    if (totalSameNameCardsInSideDeck >= 4) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: `ไม่สามารถใส่การ์ด "${card.name}" ในไซด์เด็คได้เพิ่ม เพราะมีการ์ดชื่อเดียวกันในไซด์เด็คแล้ว 4 ใบ (รวมทุกระดับ)` 
      });
      return selectedCards;
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && c.isSideDeck);
    if (existingCard) {
      if (isCardOnlyOne) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: 'ใส่ Only One การ์ดได้แค่ 1 ใบในไซด์เด็ค' 
        });
        return selectedCards;
      }
      if (existingCard.quantity >= 4) {
        toast({ 
          variant: "destructive", 
          title: "ไม่สามารถเพิ่มการ์ดได้", 
          description: 'ใส่การ์ดใบนี้ได้สูงสุด 4 ใบในไซด์เด็ค' 
        });
        return selectedCards;
      }
      return selectedCards.map((c) =>
        c._id === card._id && c.isSideDeck ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      return [...selectedCards, { ...card, quantity: 1, isSideDeck: true }];
    }
  }

  // Only One logic
  if (isOnlyOne) {
    const totalOnlyOne = getOnlyOneCardCount();
    if (totalOnlyOne >= 1) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'Only One การ์ดเต็มแล้ว! (จำกัด 1 ใบ)' 
      });
      return selectedCards;
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && isOnlyOneCard(c.ex));
    if (existingCard) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'ใส่ Only One การ์ดได้แค่ 1 ใบ' 
      });
      return selectedCards;
    } else {
      return [...selectedCards, { ...card, quantity: 1, isLifeCard: false }];
    }
  }

  // Main deck logic
  const maxDeckSize = getMaxDeckSize();
  const totalCards = getTotalCardCount();
  const totalLifeCards = getLifeCardCount();
  
  // Check if main deck is full
  if (totalCards >= maxDeckSize) {
    // If main deck is full but life cards are not complete (< 5)
    if (totalLifeCards < 5) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'เด็คหลักเต็มแล้ว! กรุณาเติมไลฟ์การ์ดให้ครบ 5 ใบก่อน' 
      });
      return selectedCards;
    }
    // If both main deck and life cards are full, show message
    toast({ 
      variant: "destructive", 
      title: "ไม่สามารถเพิ่มการ์ดได้", 
      description: `เด็คเต็มแล้ว! (จำกัด ${maxDeckSize} ใบ) ถ้าต้องการเพิ่มการ์ด สามารถเพิ่มในไซด์เด็คได้` 
    });
    return selectedCards;
  }

  // Check for cards with the same name (including different levels) - 4 card limit by name
  const totalSameNameCards = getCardCountByName(card.name, selectedCards);
  if (totalSameNameCards >= 4) {
    toast({ 
      variant: "destructive", 
      title: "ไม่สามารถเพิ่มการ์ดได้", 
      description: `ไม่สามารถใส่การ์ด "${card.name}" ได้เพิ่ม เพราะมีการ์ดชื่อเดียวกันในเด็คแล้ว 4 ใบ (รวมทุกระดับ)` 
    });
    return selectedCards;
  }

  const existingCard = selectedCards.find((c) => c._id === card._id && !c.isLifeCard && !c.isSideDeck);
  if (existingCard) {
    if (existingCard.quantity >= 4) {
      toast({ 
        variant: "destructive", 
        title: "ไม่สามารถเพิ่มการ์ดได้", 
        description: 'ใส่การ์ดใบนี้ได้สูงสุด 4 ใบ' 
      });
      return selectedCards;
    }
    return selectedCards.map((c) =>
      c._id === card._id && !c.isLifeCard && !c.isSideDeck ? { ...c, quantity: c.quantity + 1 } : c
    );
  } else {
    return [...selectedCards, { ...card, quantity: 1, isLifeCard: false }];
  }
}

export function removeCardFromDeck(
  cardId: string,
  selectedCards: DeckCard[],
  isLifeCard: boolean = false,
  isOnlyOne: boolean = false,
  isSideDeck: boolean = false
): DeckCard[] {
  if (isOnlyOne) {
    return selectedCards.filter((c) => !(c._id === cardId && isOnlyOneCard(c.ex)));
  }

  if (isSideDeck) {
    const existingCard = selectedCards.find((c) => c._id === cardId && c.isSideDeck);
    if (existingCard && existingCard.quantity > 1) {
      return selectedCards.map((c) =>
        c._id === cardId && c.isSideDeck ? { ...c, quantity: c.quantity - 1 } : c
      );
    } else {
      return selectedCards.filter((c) => !(c._id === cardId && c.isSideDeck));
    }
  }

  const existingCard = selectedCards.find(
    (c) => c._id === cardId && c.isLifeCard === isLifeCard
  );
  if (existingCard && existingCard.quantity > 1) {
    return selectedCards.map((c) =>
      c._id === cardId && c.isLifeCard === isLifeCard
        ? { ...c, quantity: c.quantity - 1 }
        : c
    );
  } else {
    return selectedCards.filter((c) => !(c._id === cardId && c.isLifeCard === isLifeCard));
  }
}

export function getRarityColor(rare: string) {
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
}
