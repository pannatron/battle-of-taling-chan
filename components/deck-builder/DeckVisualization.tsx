import { DeckCard } from '@/hooks/useDeckBuilder';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface DeckVisualizationProps {
  lifeCards: DeckCard[];
  onlyOneCards: DeckCard[];
  sideDeckCards: DeckCard[];
  deckCards: DeckCard[];
  deckName: string;
}

export function DeckVisualization({
  lifeCards,
  onlyOneCards,
  sideDeckCards,
  deckCards,
  deckName,
}: DeckVisualizationProps) {
  const [exporting, setExporting] = useState(false);
  const sideDeckOnlyOneCards = sideDeckCards.filter((card) => card.ex === 'Only #1');
  const sideDeckRegularCards = sideDeckCards.filter((card) => card.ex !== 'Only #1');

  const exportDeckAsImage = async () => {
    setExporting(true);
    console.log('🚀 Starting export...');

    try {
      const html2canvas = (await import('html2canvas')).default;

      const deckElement = document.getElementById('deck-visualization');
      if (!deckElement) {
        alert('ไม่สามารถส่งออกรูปภาพได้');
        setExporting(false);
        return;
      }

      console.log('📦 Element found, preparing for capture...');

      const images = deckElement.querySelectorAll('img');
      console.log(`🖼️ Found ${images.length} images to load...`);

      const imagePromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
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
          }, 10000);

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

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(deckElement, {
        backgroundColor: '#1a1a1a',
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          console.log('🔧 onclone callback triggered');

          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = `
            * {
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
            
            .bg-muted, [class*="bg-muted"] {
              background-color: #e5e5e5 !important;
            }
            .bg-background, [class*="bg-background"] {
              background-color: #fafafa !important;
            }
            .bg-white {
              background-color: #ffffff !important;
            }
            
            [class*="bg-gradient"],
            [class*="from-"],
            [class*="to-"],
            [class*="via-"] {
              background-image: none !important;
              background-color: #1a1a1a !important;
            }
            
            .text-white, [class*="text-white"] {
              color: #ffffff !important;
            }
            .text-black, [class*="text-black"] {
              color: #000000 !important;
            }
            .text-muted-foreground {
              color: #737373 !important;
            }
            
            .border, [class*="border-"] {
              border-color: #d4d4d4 !important;
            }
            .border-dashed {
              border-style: dashed !important;
            }
            
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

          const allElements = clonedDoc.querySelectorAll('*');
          console.log(`🔍 Processing ${allElements.length} elements...`);

          let modifiedCount = 0;
          allElements.forEach((element) => {
            const el = element as HTMLElement;

            const classList = Array.from(el.classList);
            classList.forEach((className) => {
              if (
                className.includes('bg-gradient') ||
                className.includes('text-gradient') ||
                className.includes('bg-clip-text') ||
                className.includes('text-transparent')
              ) {
                el.classList.remove(className);
                modifiedCount++;
              }
            });
          });

          console.log(`✅ Modified ${modifiedCount} problematic classes`);
        },
      });

      console.log('✨ Canvas created successfully!');

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

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={exportDeckAsImage}
          disabled={exporting || deckCards.length === 0}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'กำลังส่งออก...' : 'ส่งออกรูป'}
        </Button>
      </div>

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
            <div className="flex items-center justify-center w-6">
              <div
                className="text-lg font-bold text-white"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                SIDE
              </div>
            </div>

            {sideDeckCards.length === 0 ? (
              <div className="w-24 py-6 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                No side deck
              </div>
            ) : (
              <div className="flex items-center gap-3">
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
                <div
                  className="relative w-25"
                  style={{ height: `${8 + (lifeCards.length - 1) * 2.5}rem` }}
                >
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
    </>
  );
}
