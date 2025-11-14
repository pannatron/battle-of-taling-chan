import { Card } from '@/types/card';
import { DeckCard } from '@/hooks/useDeckBuilder';

export interface SinCardValidationResult {
  isValid: boolean;
  errorMessages?: string[];
  errorMessage?: string; // For backward compatibility in internal functions
  warningMessage?: string;
}

/**
 * Validates if a card can be added to the deck based on sin card conditions
 * Now supports multiple restrictions on a single card
 */
export function validateSinCardConditions(
  card: Card,
  selectedCards: DeckCard[],
  allCards: Card[]
): SinCardValidationResult {
  const errors: string[] = [];
  
  // Check if card is banned (highest priority - blocks everything)
  if (card.sinCardStatus === 'banned') {
    return {
      isValid: false,
      errorMessages: [`การ์ด "${card.name}" ถูกแบน ไม่สามารถใส่ในเด็คได้`],
    };
  }

  // Check custom limit restrictions (can be combined with other restrictions)
  // This applies to ALL cards with the same name, regardless of rarity or level
  if (card.sinCardLimit !== undefined) {
    // Count all cards with the same name (including different rarities/levels)
    const totalSameNameCount = selectedCards
      .filter(c => c.name === card.name && !c.isLifeCard && !c.isSideDeck)
      .reduce((total, c) => total + c.quantity, 0);
    
    if (totalSameNameCount >= card.sinCardLimit) {
      errors.push(`การ์ด "${card.name}" ถูกจำกัดที่ ${card.sinCardLimit} ใบ (รวมทุก rarity และทุกระดับ)`);
    }
  }

  // Check all conditional restrictions (can have multiple conditions)
  if (card.sinCardConditionType) {
    switch (card.sinCardConditionType) {
      case 'choose_one': {
        const result = validateChooseOne(card, selectedCards, allCards);
        if (!result.isValid) {
          if (result.errorMessages) {
            errors.push(...result.errorMessages);
          } else if (result.errorMessage) {
            errors.push(result.errorMessage);
          }
        }
        break;
      }
      case 'requires_avatar_symbol': {
        const result = validateRequiresAvatarSymbol(card, selectedCards, allCards);
        if (!result.isValid) {
          if (result.errorMessages) {
            errors.push(...result.errorMessages);
          } else if (result.errorMessage) {
            errors.push(result.errorMessage);
          }
        }
        break;
      }
      case 'shared_name_limit': {
        const result = validateSharedNameLimit(card, selectedCards, allCards);
        if (!result.isValid) {
          if (result.errorMessages) {
            errors.push(...result.errorMessages);
          } else if (result.errorMessage) {
            errors.push(result.errorMessage);
          }
        }
        break;
      }
    }
  }

  // REVERSE CHECK: If adding an Avatar card, check if deck has cards with requires_avatar_symbol
  // If so, the new Avatar must have the required symbols
  if (card.type === 'Avatar') {
    const result = validateAvatarAgainstRequiredSymbols(card, selectedCards, allCards);
    if (!result.isValid) {
      if (result.errorMessages) {
        errors.push(...result.errorMessages);
      } else if (result.errorMessage) {
        errors.push(result.errorMessage);
      }
    }
  }

  // Return combined results
  if (errors.length > 0) {
    return {
      isValid: false,
      errorMessages: errors,
    };
  }

  return { isValid: true };
}

/**
 * Type 1: Choose One - Cards in the same group are mutually exclusive
 */
function validateChooseOne(
  card: Card,
  selectedCards: DeckCard[],
  allCards: Card[]
): SinCardValidationResult {
  if (!card.sinCardChooseOneGroup || card.sinCardChooseOneGroup.length === 0) {
    return { isValid: true };
  }

  // Check if any card from the same choose-one group is already in the deck
  for (const deckCard of selectedCards) {
    // Find the full card data
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (!fullCard) continue;

    // Check if this card is in the same choose-one group
    if (
      fullCard.sinCardChooseOneGroup &&
      fullCard.sinCardChooseOneGroup.some(groupId =>
        card.sinCardChooseOneGroup?.includes(groupId)
      )
    ) {
      return {
        isValid: false,
        errorMessage: `ไม่สามารถใส่ "${card.name}" ได้ เพราะมี "${fullCard.name}" ในเด็คอยู่แล้ว (เลือกได้แค่การ์ดใดการ์ดหนึ่ง)`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Type 2: Requires Avatar Symbol - Any avatar with the required symbol
 * sinCardRequiredAvatars is just for displaying examples, not for restriction
 * NOTE: We need to pass allCards to get full card data including symbol and mainEffect
 */
function validateRequiresAvatarSymbol(
  card: Card,
  selectedCards: DeckCard[],
  allCards: Card[]
): SinCardValidationResult {
  // If no required symbols specified, card is valid
  if (!card.sinCardRequiredSymbols || card.sinCardRequiredSymbols.length === 0) {
    return { isValid: true };
  }

  // Get all Avatar cards from deck (excluding the card being added if it's already there)
  const avatarCardsInDeck = selectedCards.filter(deckCard => deckCard.type === 'Avatar');
  
  // If there are no avatars in deck AND the card itself is not an Avatar with required symbol
  if (avatarCardsInDeck.length === 0) {
    // Check if the card being added is an Avatar with the required symbol
    if (card.type === 'Avatar') {
      const cardHasSymbolInAvatarSymbol = card.sinCardRequiredSymbols.some(requiredSymbol =>
        card.symbol?.toLowerCase().includes(requiredSymbol.toLowerCase())
      );
      const cardHasSymbolInMainEffect = card.sinCardRequiredSymbols.some(requiredSymbol =>
        card.mainEffect?.toLowerCase().includes(requiredSymbol.toLowerCase())
      );
      
      // If the card itself has the required symbol, it's valid (first Avatar in deck)
      if (cardHasSymbolInAvatarSymbol || cardHasSymbolInMainEffect) {
        return { isValid: true };
      }
    }
    
    // No avatars and card doesn't have required symbol
    const requiredSymbolsList = card.sinCardRequiredSymbols.join(', ');
    const exampleAvatars = card.sinCardRequiredAvatars?.join(', ') || 'ที่มี Symbol ดังกล่าว';
    return {
      isValid: false,
      errorMessage: `ไม่สามารถใส่ "${card.name}" ได้ ต้องมี Avatar ที่มี Symbol: "${requiredSymbolsList}" (ตัวอย่าง: ${exampleAvatars})`,
    };
  }

  // Check if ALL avatars in deck have the required symbols
  for (const deckCard of avatarCardsInDeck) {
    // Get full card data from allCards to access all fields
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (!fullCard) continue;

    // Check if this avatar has ALL required symbols
    const hasAllRequiredSymbols = card.sinCardRequiredSymbols.every(requiredSymbol => {
      const hasSymbolInField = fullCard.symbol?.toLowerCase().includes(requiredSymbol.toLowerCase());
      const hasSymbolInEffect = fullCard.mainEffect?.toLowerCase().includes(requiredSymbol.toLowerCase());
      return hasSymbolInField || hasSymbolInEffect;
    });

    // If this avatar doesn't have all required symbols, card cannot be added
    if (!hasAllRequiredSymbols) {
      const requiredSymbolsList = card.sinCardRequiredSymbols.join(', ');
      return {
        isValid: false,
        errorMessage: `ไม่สามารถใส่ "${card.name}" ได้ เพราะ Avatar "${fullCard.name}" ใน Deck ไม่มี Symbol: "${requiredSymbolsList}" (Avatar ทุกใบต้องมี Symbol ที่ต้องการ)`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Type 3: Shared Name Limit - Cards with same base name share the 4-card limit
 */
function validateSharedNameLimit(
  card: Card,
  selectedCards: DeckCard[],
  allCards: Card[]
): SinCardValidationResult {
  if (!card.sinCardSharedNameGroup) {
    return { isValid: true };
  }

  // Count total cards in the same shared name group
  let totalCount = 0;
  let cardNames: string[] = [];

  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (!fullCard) continue;

    if (fullCard.sinCardSharedNameGroup === card.sinCardSharedNameGroup) {
      totalCount += deckCard.quantity;
      if (!cardNames.includes(fullCard.name)) {
        cardNames.push(fullCard.name);
      }
    }
  }

  // Check if adding this card would exceed the limit
  const existingCard = selectedCards.find(c => c._id === card._id);
  const currentCardCount = existingCard?.quantity || 0;

  // Check if specific card has a limit
  const cardLimit = card.sinCardLimit !== undefined ? card.sinCardLimit : 4;
  
  if (currentCardCount >= cardLimit) {
    return {
      isValid: false,
      errorMessage: `การ์ด "${card.name}" ถูกจำกัดที่ ${cardLimit} ใบ`,
    };
  }

  // Check shared group limit (default 4 cards total)
  if (totalCount >= 4) {
    return {
      isValid: false,
      errorMessage: `ไม่สามารถใส่ "${card.name}" ได้ เพราะการ์ดที่มีชื่อเดียวกัน (${cardNames.join(', ')}) รวมกันแล้วครบ 4 ใบแล้ว`,
    };
  }

  return { isValid: true };
}

/**
 * REVERSE CHECK: Validate if an Avatar card meets the symbol requirements of any requires_avatar_symbol cards in deck
 */
function validateAvatarAgainstRequiredSymbols(
  avatarCard: Card,
  selectedCards: DeckCard[],
  allCards: Card[]
): SinCardValidationResult {
  // Find all cards in deck that have requires_avatar_symbol condition
  const cardsWithSymbolRequirement: { card: Card; requiredSymbols: string[] }[] = [];
  
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (fullCard && 
        fullCard.sinCardConditionType === 'requires_avatar_symbol' && 
        fullCard.sinCardRequiredSymbols && 
        fullCard.sinCardRequiredSymbols.length > 0) {
      cardsWithSymbolRequirement.push({
        card: fullCard,
        requiredSymbols: fullCard.sinCardRequiredSymbols
      });
    }
  }

  // If no cards with symbol requirement, Avatar is valid
  if (cardsWithSymbolRequirement.length === 0) {
    return { isValid: true };
  }

  // Check if the Avatar has ALL required symbols from ALL cards with requirements
  const allRequiredSymbols = new Set<string>();
  cardsWithSymbolRequirement.forEach(req => {
    req.requiredSymbols.forEach(symbol => allRequiredSymbols.add(symbol.toLowerCase()));
  });

  // Check if avatar has all required symbols
  for (const requiredSymbol of allRequiredSymbols) {
    const hasSymbolInField = avatarCard.symbol?.toLowerCase().includes(requiredSymbol);
    const hasSymbolInEffect = avatarCard.mainEffect?.toLowerCase().includes(requiredSymbol);
    
    if (!hasSymbolInField && !hasSymbolInEffect) {
      const cardNames = cardsWithSymbolRequirement.map(req => req.card.name).join(', ');
      return {
        isValid: false,
        errorMessage: `ไม่สามารถใส่ "${avatarCard.name}" ได้ เพราะ Deck มีการ์ด "${cardNames}" ที่ต้องการ Avatar ที่มี Symbol: "${Array.from(allRequiredSymbols).join(', ')}"`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Get all sin card warnings for the current deck
 * Now supports multiple restrictions per card
 */
export function getDeckSinCardWarnings(
  selectedCards: DeckCard[],
  allCards: Card[]
): string[] {
  const warnings: string[] = [];

  // Check for banned cards
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (fullCard?.sinCardStatus === 'banned') {
      warnings.push(`⚠️ การ์ด "${fullCard.name}" ถูกแบน`);
    }
  }

  // Check for limited cards exceeding their limit (independent of status)
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (
      fullCard?.sinCardLimit !== undefined &&
      deckCard.quantity > fullCard.sinCardLimit
    ) {
      warnings.push(
        `⚠️ การ์ด "${fullCard.name}" เกินจำนวนที่กำหนด (${deckCard.quantity}/${fullCard.sinCardLimit} ใบ)`
      );
    }
  }

  // Check for choose-one violations
  const chooseOneGroups = new Map<string, string[]>();
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (fullCard?.sinCardChooseOneGroup) {
      for (const groupId of fullCard.sinCardChooseOneGroup) {
        if (!chooseOneGroups.has(groupId)) {
          chooseOneGroups.set(groupId, []);
        }
        chooseOneGroups.get(groupId)!.push(fullCard.name);
      }
    }
  }

  for (const [groupId, cardNames] of chooseOneGroups) {
    if (cardNames.length > 1) {
      warnings.push(
        `⚠️ ใส่การ์ดในกลุ่มเดียวกันมากกว่า 1 ใบ: ${cardNames.join(', ')} (เลือกได้แค่การ์ดใดการ์ดหนึ่ง)`
      );
    }
  }

  // Check for avatar symbol requirements
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (
      fullCard?.sinCardConditionType === 'requires_avatar_symbol' &&
      fullCard.sinCardRequiredSymbols
    ) {
      // Check if deck has ANY avatar with the required symbol
      const hasAvatarWithRequiredSymbol = selectedCards.some(dc => {
        if (dc.type !== 'Avatar') return false;
        const hasSymbol = fullCard.sinCardRequiredSymbols?.some(
          rs =>
            dc.symbol?.toLowerCase().includes(rs.toLowerCase()) ||
            dc.mainEffect?.toLowerCase().includes(rs.toLowerCase())
        );
        return hasSymbol;
      });

      if (!hasAvatarWithRequiredSymbol) {
        const exampleAvatars = fullCard.sinCardRequiredAvatars?.join(', ') || 'ที่มี Symbol ดังกล่าว';
        warnings.push(
          `⚠️ การ์ด "${fullCard.name}" ต้องการ Avatar ที่มี Symbol: ${fullCard.sinCardRequiredSymbols.join(', ')} (ตัวอย่าง: ${exampleAvatars})`
        );
      }
    }
  }

  // Check for shared name limit violations
  const sharedNameGroups = new Map<string, { cards: string[]; totalCount: number }>();
  for (const deckCard of selectedCards) {
    const fullCard = allCards.find(c => c._id === deckCard._id);
    if (fullCard?.sinCardSharedNameGroup) {
      const groupId = fullCard.sinCardSharedNameGroup;
      if (!sharedNameGroups.has(groupId)) {
        sharedNameGroups.set(groupId, { cards: [], totalCount: 0 });
      }
      const group = sharedNameGroups.get(groupId)!;
      if (!group.cards.includes(fullCard.name)) {
        group.cards.push(fullCard.name);
      }
      group.totalCount += deckCard.quantity;
    }
  }

  for (const [groupId, { cards, totalCount }] of sharedNameGroups) {
    if (totalCount > 4) {
      warnings.push(
        `⚠️ การ์ดชื่อเดียวกัน (${cards.join(', ')}) เกิน 4 ใบ (รวม ${totalCount} ใบ)`
      );
    }
  }

  return warnings;
}
