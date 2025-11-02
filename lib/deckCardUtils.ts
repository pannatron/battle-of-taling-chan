import { DeckCard } from '@/hooks/useDeckBuilder';
import { Card as CardType } from '@/types/card';

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
  isMainDeckFull: () => boolean
): DeckCard[] {
  const isLifeCard = card.type === 'Life' || targetDeck === 'life';
  const isOnlyOne = card.ex === 'Only #1';
  const isSideDeck = targetDeck === 'side';

  // Life cards logic
  if (isLifeCard) {
    const totalLifeCards = getLifeCardCount();
    if (totalLifeCards >= 5) {
      alert('ไลฟ์การ์ดเต็มแล้ว! (จำกัด 5 ใบ)');
      return selectedCards;
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && c.isLifeCard);
    if (existingCard) {
      if (existingCard.quantity >= 1) {
        alert('ใส่ไลฟ์การ์ดใบนี้ได้แค่ 1 ใบ');
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
      alert('ต้องเติมเด็คหลักให้เต็มก่อน (' + getMaxDeckSize() + ' ใบ) ถึงจะเพิ่มการ์ดในไซด์เด็คได้');
      return selectedCards;
    }

    const totalSideDeck = getSideDeckCardCount();
    const sideDeckOnlyOneCount = getSideDeckOnlyOneCount();
    const isCardOnlyOne = card.ex === 'Only #1';

    if (isCardOnlyOne) {
      if (sideDeckOnlyOneCount >= 1) {
        alert('ไซด์เด็คมี Only One การ์ดได้แค่ 1 ใบ');
        return selectedCards;
      }
      if (totalSideDeck >= 11) {
        alert('ไซด์เด็คเต็มแล้ว! (จำกัด 11 ใบ)');
        return selectedCards;
      }
    } else {
      const maxRegularCards = sideDeckOnlyOneCount > 0 ? 10 : 11;
      const regularCardsCount = totalSideDeck - sideDeckOnlyOneCount;
      if (regularCardsCount >= maxRegularCards) {
        alert(`ไซด์เด็คมีการ์ดธรรมดาเต็มแล้ว! (จำกัด ${maxRegularCards} ใบ)`);
        return selectedCards;
      }
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && c.isSideDeck);
    if (existingCard) {
      if (isCardOnlyOne) {
        alert('ใส่ Only One การ์ดได้แค่ 1 ใบในไซด์เด็ค');
        return selectedCards;
      }
      if (existingCard.quantity >= 4) {
        alert('ใส่การ์ดใบนี้ได้สูงสุด 4 ใบในไซด์เด็ค');
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
      alert('Only One การ์ดเต็มแล้ว! (จำกัด 1 ใบ)');
      return selectedCards;
    }

    const existingCard = selectedCards.find((c) => c._id === card._id && c.ex === 'Only #1');
    if (existingCard) {
      alert('ใส่ Only One การ์ดได้แค่ 1 ใบ');
      return selectedCards;
    } else {
      return [...selectedCards, { ...card, quantity: 1, isLifeCard: false }];
    }
  }

  // Main deck logic
  const maxDeckSize = getMaxDeckSize();
  const totalCards = getTotalCardCount();
  if (totalCards >= maxDeckSize) {
    alert(`เด็คเต็มแล้ว! (จำกัด ${maxDeckSize} ใบ)`);
    return selectedCards;
  }

  const existingCard = selectedCards.find((c) => c._id === card._id && !c.isLifeCard);
  if (existingCard) {
    if (existingCard.quantity >= 4) {
      alert('ใส่การ์ดใบนี้ได้สูงสุด 4 ใบ');
      return selectedCards;
    }
    return selectedCards.map((c) =>
      c._id === card._id && !c.isLifeCard ? { ...c, quantity: c.quantity + 1 } : c
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
    return selectedCards.filter((c) => !(c._id === cardId && c.ex === 'Only #1'));
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
