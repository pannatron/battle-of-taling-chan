'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import {
  getAllCards,
  updateCardImage,
} from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card as CardUI,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.print.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.series.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  }, [searchTerm, cards]);

  const loadCards = async () => {
    setLoading(true);
    const data = await getAllCards();
    setCards(data);
    setFilteredCards(data);
    setLoading(false);
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    setImageUrl(card.imageUrl || '');
    setMessage('');
  };

  const handleUpdateImage = async () => {
    if (!selectedCard || !imageUrl) {
      setMessage('กรุณาเลือกการ์ดและใส่ URL รูปภาพ');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updated = await updateCardImage(selectedCard._id, imageUrl);
      if (updated) {
        setMessage('อัพเดทรูปภาพสำเร็จ!');
        // Update local state
        const updatedCards = cards.map((c) =>
          c._id === updated._id ? updated : c
        );
        setCards(updatedCards);
        setSelectedCard(updated);
      } else {
        setMessage('เกิดข้อผิดพลาดในการอัพเดทรูปภาพ');
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        หน้าแก้ไขข้อมูลการ์ด
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Card List */}
        <div>
          <CardUI>
            <CardHeader>
              <CardTitle>เลือกการ์ด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">ค้นหาการ์ด</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="ค้นหาด้วยชื่อ, พิมพ์, หรือซีรีส์"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="max-h-[600px] overflow-y-auto space-y-2">
                {loading && <p>กำลังโหลด...</p>}
                {filteredCards.map((card) => (
                  <div
                    key={card._id}
                    onClick={() => handleCardSelect(card)}
                    className={`p-4 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                      selectedCard?._id === card._id
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                        : ''
                    }`}
                  >
                    <div className="font-bold">{card.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {card.print} - {card.series}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {card.rare}
                      </span>
                      <span className="text-xs text-gray-500">
                        {card.imageUrl ? '✓ มีรูปภาพ' : '✗ ไม่มีรูปภาพ'}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredCards.length === 0 && !loading && (
                  <p className="text-center text-gray-500">ไม่พบการ์ด</p>
                )}
              </div>
            </CardContent>
          </CardUI>
        </div>

        {/* Right Panel - Edit Form */}
        <div>
          <CardUI>
            <CardHeader>
              <CardTitle>แก้ไขรูปภาพการ์ด</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCard ? (
                <p className="text-center text-gray-500">
                  เลือกการ์ดจากรายการทางซ้าย
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      {selectedCard.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        พิมพ์: {selectedCard.print}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ซีรีส์: {selectedCard.series}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ระดับ: </span>
                        <span className="font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {selectedCard.rare}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ประเภท: {selectedCard.type}
                      </p>
                    </div>
                  </div>

                  {/* Current Image */}
                  <div>
                    <Label>รูปภาพปัจจุบัน</Label>
                    <div className="mt-2 border rounded p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-[200px]">
                      {selectedCard.imageUrl ? (
                        <Image
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          width={200}
                          height={280}
                          className="object-contain"
                        />
                      ) : (
                        <p className="text-gray-500">ไม่มีรูปภาพ</p>
                      )}
                    </div>
                  </div>

                  {/* Update by URL */}
                  <div>
                    <Label htmlFor="imageUrl">URL รูปภาพใหม่</Label>
                    <Input
                      id="imageUrl"
                      type="text"
                      placeholder="https://example.com/image.png หรือ /images/card.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="mt-2"
                    />
                    <Button
                      onClick={handleUpdateImage}
                      disabled={loading || !imageUrl}
                      className="mt-2 w-full"
                    >
                      {loading ? 'กำลังอัพเดท...' : 'อัพเดทรูปภาพ'}
                    </Button>
                  </div>

                  {/* Message */}
                  {message && (
                    <div
                      className={`p-4 rounded ${
                        message.includes('สำเร็จ')
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </CardUI>
        </div>
      </div>
    </div>
  );
}
