import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, FileInput, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCardsByPrintCodes, searchCards } from '@/lib/api';
import { Card as CardType } from '@/types/card';

interface DeckCodeImporterProps {
  onImport: (cards: { card: CardType; quantity: number; section: 'main' | 'life' }[], deckName?: string) => void;
  onClose: () => void;
  loading?: boolean;
}

interface ParsedCard {
  code: string;
  quantity: number;
  section: 'main' | 'life';
}

export function DeckCodeImporter({ onImport, onClose, loading = false }: DeckCodeImporterProps) {
  const [input, setInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const parseCardCodes = (text: string): { cards: ParsedCard[]; deckName?: string } => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: ParsedCard[] = [];
    let currentSection: 'main' | 'life' = 'main';
    let deckName: string | undefined;
    let foundFirstSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for section headers
      if (trimmed.match(/^#\s*main\s*deck/i)) {
        currentSection = 'main';
        foundFirstSection = true;
        continue;
      }
      if (trimmed.match(/^#\s*life\s*cards?/i)) {
        currentSection = 'life';
        foundFirstSection = true;
        continue;
      }
      
      // If line starts with # and we haven't found a section yet, it might be deck name
      if (trimmed.startsWith('#') && !foundFirstSection && !deckName) {
        // Extract deck name (remove # and trim)
        deckName = trimmed.substring(1).trim();
        continue;
      }
      
      // Skip empty lines and other comment lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse card line: "3x BT01-032-C" or "1 BT01-032-C"
      const match = trimmed.match(/^(\d+)\s*[xX×]?\s*([A-Z0-9]+-[0-9]+(?:-[A-Z]+)?)/i);
      if (match) {
        const quantity = parseInt(match[1]);
        let code = match[2].toUpperCase();
        
        // Remove rarity suffix if present (e.g., "BT01-032-C" -> "BT01-032")
        // Database stores prints without rarity suffix
        code = code.replace(/-[A-Z]+$/, '');
        
        parsed.push({ code, quantity, section: currentSection });
      }
    }

    return { cards: parsed, deckName };
  };

  // Helper function to check if a card has a valid image
  const hasValidImage = (card: CardType): boolean => {
    return !!(card.imageUrl && 
              card.imageUrl.trim() !== '' && 
              !card.imageUrl.includes('placeholder') &&
              !card.imageUrl.includes('no-image'));
  };

  // Helper function to find a fallback card with the same name but valid image
  const findCardWithImage = async (cardName: string, excludePrint?: string): Promise<CardType | null> => {
    try {
      const cardsWithSameName = await searchCards({ name: cardName });
      
      // Find a card with valid image that's not the original card
      const cardWithImage = cardsWithSameName.find(c => 
        c.print !== excludePrint && hasValidImage(c)
      );
      
      return cardWithImage || null;
    } catch (error) {
      console.error('Error finding card with image:', error);
      return null;
    }
  };

  const handleImport = async () => {
    if (!input.trim()) {
      setError('กรุณาใส่รหัสการ์ด');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      // Helper function to normalize card codes (remove leading zeros)
      const normalizeCode = (code: string): string => {
        return code.replace(/-0+(\d+)/g, '-$1');
      };

      // Parse the input
      const { cards: parsedCards, deckName: parsedDeckName } = parseCardCodes(input);
      
      if (parsedCards.length === 0) {
        setError('ไม่พบรหัสการ์ดที่ถูกต้อง กรุณาตรวจสอบรูปแบบ');
        setImporting(false);
        return;
      }

      // Get unique codes and their normalized versions
      const uniqueCodes = Array.from(new Set(parsedCards.map(c => c.code)));
      
      // Create a set with both original and normalized codes to search for
      const codesToSearch = new Set<string>();
      uniqueCodes.forEach(code => {
        codesToSearch.add(code);
        const normalized = normalizeCode(code);
        if (normalized !== code) {
          codesToSearch.add(normalized);
        }
        
        // Also add padded variations to search directly
        const parts = code.split('-');
        if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
          const prefix = parts[0];
          const num = parseInt(parts[1]);
          const suffix = parts.slice(2).join('-');
          
          // Add single digit, 2-digit, and 3-digit versions
          const variants = [
            num.toString(),
            num.toString().padStart(2, '0'),
            num.toString().padStart(3, '0')
          ];
          
          variants.forEach(v => {
            const variantCode = suffix ? `${prefix}-${v}-${suffix}` : `${prefix}-${v}`;
            codesToSearch.add(variantCode);
          });
        }
      });
      
      // Fetch cards from API with all variations
      const fetchedCards = await getCardsByPrintCodes(Array.from(codesToSearch));
      
      if (fetchedCards.length === 0) {
        setError('ไม่พบการ์ดในระบบ');
        setImporting(false);
        return;
      }

      // Create a map of code to card with ALL variations for flexible matching
      const cardMap = new Map<string, CardType>();
      
      // Store cards with multiple key variations
      fetchedCards.forEach(card => {
        const printUpper = card.print.toUpperCase();
        const normalized = normalizeCode(printUpper);
        
        // Store with exact print code from database
        cardMap.set(printUpper, card);
        
        // Store with normalized version
        if (normalized !== printUpper) {
          cardMap.set(normalized, card);
        }
        
        // Also create versions with leading zeros for common formats
        // e.g., if database has "BT08-8", also map "BT08-08" and "BT08-008"
        const parts = printUpper.split('-');
        if (parts.length >= 2) {
          const prefix = parts[0];
          const numberStr = parts[1];
          const suffix = parts.slice(2).join('-');
          
          // If it's a number, create padded versions
          if (/^\d+$/.test(numberStr)) {
            const num = parseInt(numberStr);
            // Create 2-digit and 3-digit padded versions
            const padded2 = num.toString().padStart(2, '0');
            const padded3 = num.toString().padStart(3, '0');
            
            const code2 = suffix ? `${prefix}-${padded2}-${suffix}` : `${prefix}-${padded2}`;
            const code3 = suffix ? `${prefix}-${padded3}-${suffix}` : `${prefix}-${padded3}`;
            
            cardMap.set(code2, card);
            cardMap.set(code3, card);
          }
        }
      });

      // Match parsed cards with fetched cards
      const cardsToImport: { card: CardType; quantity: number; section: 'main' | 'life' }[] = [];
      const notFoundCodes: string[] = [];
      const fallbackMatches: Array<{ originalCode: string; matchedCard: CardType; reason: string }> = [];
      const imageReplacements: Array<{ originalCard: string; replacementCard: CardType }> = [];

      // First pass: match cards and check for valid images
      for (const parsed of parsedCards) {
        const code = parsed.code;
        const normalizedCode = normalizeCode(code);
        
        // Try exact match first, then normalized match
        let card = cardMap.get(code) || cardMap.get(normalizedCode);
        
        if (card) {
          // Check if card has a valid image
          if (!hasValidImage(card)) {
            // Try to find another card with same name but with valid image
            const cardWithImage = await findCardWithImage(card.name, card.print);
            
            if (cardWithImage) {
              imageReplacements.push({
                originalCard: `${code} (${card.name})`,
                replacementCard: cardWithImage
              });
              card = cardWithImage; // Use the card with valid image
            }
          }
          
          cardsToImport.push({
            card,
            quantity: parsed.quantity,
            section: parsed.section,
          });
        } else {
          notFoundCodes.push(code);
        }
      }

      // Second pass: If there are cards not found, try to find them by name from other rarities
      if (notFoundCodes.length > 0) {
        const baseCodePattern = /^([A-Z0-9]+)-(\d+)/;
        
        for (const notFoundCode of notFoundCodes) {
          const match = notFoundCode.match(baseCodePattern);
          if (match) {
            const basePrefix = match[1]; // e.g., "BT08"
            const cardNumber = match[2]; // e.g., "8" or "008"
            
            // Search through all fetched cards for ones with same base code
            const sameBaseCards = fetchedCards.filter(c => {
              const cMatch = c.print.toUpperCase().match(baseCodePattern);
              if (cMatch) {
                const cPrefix = cMatch[1];
                const cNumber = parseInt(cMatch[2]);
                return cPrefix === basePrefix && cNumber === parseInt(cardNumber);
              }
              return false;
            });
            
            if (sameBaseCards.length > 0) {
              // Prefer cards with valid images
              let fallbackCard = sameBaseCards.find(c => hasValidImage(c)) || sameBaseCards[0];
              
              // If still no valid image, try to find by name
              if (!hasValidImage(fallbackCard)) {
                const cardWithImage = await findCardWithImage(fallbackCard.name);
                if (cardWithImage) {
                  imageReplacements.push({
                    originalCard: `${notFoundCode} (${fallbackCard.name})`,
                    replacementCard: cardWithImage
                  });
                  fallbackCard = cardWithImage;
                }
              }
              
              // Find the matching parsed card to add
              const parsedCard = parsedCards.find(p => p.code === notFoundCode);
              if (parsedCard) {
                cardsToImport.push({
                  card: fallbackCard,
                  quantity: parsedCard.quantity,
                  section: parsedCard.section,
                });
                
                fallbackMatches.push({
                  originalCode: notFoundCode,
                  matchedCard: fallbackCard,
                  reason: 'รหัสไม่พบ ใช้การ์ดระดับอื่น'
                });
                
                // Remove from not found list
                const index = notFoundCodes.indexOf(notFoundCode);
                if (index > -1) {
                  notFoundCodes.splice(index, 1);
                }
              }
            }
          }
        }
      }

      if (cardsToImport.length === 0) {
        setError('ไม่พบการ์ดที่ต้องการในระบบ');
        setImporting(false);
        return;
      }

      // Show success message with details
      const totalCards = cardsToImport.reduce((sum, item) => sum + item.quantity, 0);
      let message = `นำเข้าสำเร็จ ${cardsToImport.length} ชนิด (${totalCards} ใบ)`;
      
      if (imageReplacements.length > 0) {
        message += `\n\n🖼️ ใช้รูปจากระดับอื่น (ไม่มีรูปของระดับนั้น):\n`;
        imageReplacements.forEach(ir => {
          message += `• ${ir.originalCard} → ใช้รูปจาก ${ir.replacementCard.print}\n`;
        });
      }
      
      if (fallbackMatches.length > 0) {
        message += `\n\n⚠️ ใช้การ์ดทดแทน:\n`;
        fallbackMatches.forEach(fm => {
          message += `• ${fm.originalCode} → ${fm.matchedCard.print} (${fm.matchedCard.name}) - ${fm.reason}\n`;
        });
      }
      
      if (notFoundCodes.length > 0) {
        message += `\n\n❌ ไม่พบการ์ด: ${notFoundCodes.join(', ')}`;
        setError(`ไม่พบการ์ด: ${notFoundCodes.join(', ')}`);
      }
      
      setSuccess(message);

      // Call the import callback with deck name if available
      onImport(cardsToImport, parsedDeckName);

      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Import error:', err);
      setError('เกิดข้อผิดพลาดในการนำเข้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setImporting(false);
    }
  };

  const exampleText = `# ชื่อเด็คของคุณ (ถ้ามี)

# Main Deck
1x BT01-032-C
1x BT01-042-SCR
3x BT05-058-R
4x BT07-029-SCR

# Life Cards
1x BT05-071-C
1x BT07-075-C`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-accent rounded-md transition-colors"
            disabled={importing}
          >
            <X className="h-5 w-5" />
          </button>
          <CardTitle className="flex items-center gap-2">
            <FileInput className="h-6 w-6" />
            นำเข้าเด็คจากรหัสการ์ด
          </CardTitle>
          <CardDescription>
            วางรหัสการ์ดของคุณในรูปแบบด้านล่าง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">รหัสการ์ด</label>
            <Textarea
              placeholder={exampleText}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              <strong>รูปแบบ:</strong> สามารถใส่ชื่อเด็คในบรรทัดแรก (# ชื่อเด็ค) หรือไม่ใส่ก็ได้
              <br />
              <code className="bg-muted px-1 py-0.5 rounded">จำนวนx รหัสการ์ด</code> เช่น:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">3x BT01-032</code>,{' '}
              <code className="bg-muted px-1 py-0.5 rounded">1x BT08-008-C</code>
              <br />
              รองรับทั้งแบบมีเลข 0 นำหน้า (BT08-008) และไม่มี (BT08-8) • สามารถใส่หรือไม่ใส่ Rarity ก็ได้
              <br />
              ใช้ <code className="bg-muted px-1 py-0.5 rounded"># Main Deck</code> และ{' '}
              <code className="bg-muted px-1 py-0.5 rounded"># Life Cards</code> เพื่อแบ่งส่วน
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm whitespace-pre-wrap">{success}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={importing || loading || !input.trim()}
              className="flex-1"
            >
              {importing ? 'กำลังนำเข้า...' : 'นำเข้าการ์ด'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={importing}
            >
              ยกเลิก
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">ตัวอย่าง:</h4>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
              {exampleText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
