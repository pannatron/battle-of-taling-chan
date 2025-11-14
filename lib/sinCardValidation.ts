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
  if (card.sinCardLimit !== undefined) {
    const existingCard = selectedCards.find(c => c._id === card._id);
    const currentCount = existingCard?.quantity || 0;
    
    if (currentCount >= card.sinCardLimit) {
      errors.push(`การ์ด "${card.name}" ถูกจำกัดที่ ${card.sinCardLimit} ใบ`);
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
        const result = validateRequiresAvatarSymbol(card, selectedCards);
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
 */
function validateRequiresAvatarSymbol(
  card: Card,
  selectedCards: DeckCard[]
): SinCardValidationResult {
  // If no required symbols specified, card is valid
  if (!card.sinCardRequiredSymbols || card.sinCardRequiredSymbols.length === 0) {
    return { isValid: true };
  }

  // Check if deck has ANY avatar (not limited to requiredAvatars list) with the required symbol
  const hasAvatarWithRequiredSymbol = selectedCards.some(deckCard => {
    // Check if the card is an avatar type
    if (deckCard.type !== 'Avatar') return false;

    // Check if avatar has the required symbol in its symbol field
    const hasSymbolInAvatarSymbol = card.sinCardRequiredSymbols?.some(requiredSymbol =>
      deckCard.symbol?.toLowerCase().includes(requiredSymbol.toLowerCase())
    );

    // Check if main effect contains the required symbol keyword
    const hasSymbolInMainEffect = card.sinCardRequiredSymbols?.some(requiredSymbol =>
      deckCard.mainEffect?.toLowerCase().includes(requiredSymbol.toLowerCase())
    );

    return hasSymbolInAvatarSymbol || hasSymbolInMainEffect;
  });

  if (!hasAvatarWithRequiredSymbol) {
    const requiredSymbolsList = card.sinCardRequiredSymbols.join(', ');
    const exampleAvatars = card.sinCardRequiredAvatars?.join(', ') || 'ที่มี Symbol ดังกล่าว';
    return {
      isValid: false,
      errorMessage: `ไม่สามารถใส่ "${card.name}" ได้ ต้องมี Avatar ที่มี Symbol: "${requiredSymbolsList}" (ตัวอย่าง: ${exampleAvatars})`,
    };
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
