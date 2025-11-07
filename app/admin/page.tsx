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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [imageStatusFilter, setImageStatusFilter] = useState('all');
  
  // Available filter options
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    // Extract unique values for filters
    const uniqueTypes = Array.from(new Set(cards.map((c) => c.type).filter(Boolean)));
    const uniqueRarities = Array.from(new Set(cards.map((c) => c.rare).filter(Boolean)));
    const uniqueSeries = Array.from(new Set(cards.map((c) => c.series).filter(Boolean)));
    const uniqueColors = Array.from(new Set(cards.map((c) => c.color).filter(Boolean)));
    
    setTypes(uniqueTypes.sort());
    setRarities(uniqueRarities.sort());
    setSeries(uniqueSeries.sort());
    setColors(uniqueColors.sort());
  }, [cards]);

  useEffect(() => {
    let filtered = cards;

    // Search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.print.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.series.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((card) => card.type === typeFilter);
    }

    // Rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter((card) => card.rare === rarityFilter);
    }

    // Series filter
    if (seriesFilter !== 'all') {
      filtered = filtered.filter((card) => card.series === seriesFilter);
    }

    // Color filter
    if (colorFilter !== 'all') {
      filtered = filtered.filter((card) => card.color === colorFilter);
    }

    // Image status filter
    if (imageStatusFilter === 'with-image') {
      filtered = filtered.filter((card) => card.imageUrl && card.imageUrl.trim() !== '');
    } else if (imageStatusFilter === 'without-image') {
      filtered = filtered.filter((card) => !card.imageUrl || card.imageUrl.trim() === '');
    }

    setFilteredCards(filtered);
  }, [searchTerm, typeFilter, rarityFilter, seriesFilter, colorFilter, imageStatusFilter, cards]);

  const loadCards = async () => {
    setLoading(true);
    const data = await getAllCards();
    setCards(data);
    setFilteredCards(data);
    setLoading(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setRarityFilter('all');
    setSeriesFilter('all');
    setColorFilter('all');
    setImageStatusFilter('all');
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
              <CardTitle>เลือกการ์ด ({filteredCards.length} / {cards.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {/* Search */}
                <div>
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

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Type Filter */}
                  <div>
                    <Label htmlFor="type">ประเภท</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rarity Filter */}
                  <div>
                    <Label htmlFor="rarity">ความหายาก</Label>
                    <Select value={rarityFilter} onValueChange={setRarityFilter}>
                      <SelectTrigger id="rarity" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {rarities.map((rarity) => (
                          <SelectItem key={rarity} value={rarity}>
                            {rarity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Series Filter */}
                  <div>
                    <Label htmlFor="series">ซีรีส์</Label>
                    <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                      <SelectTrigger id="series" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {series.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <Label htmlFor="color">สี</Label>
                    <Select value={colorFilter} onValueChange={setColorFilter}>
                      <SelectTrigger id="color" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Status Filter */}
                  <div className="col-span-2">
                    <Label htmlFor="imageStatus">สถานะรูปภาพ</Label>
                    <Select value={imageStatusFilter} onValueChange={setImageStatusFilter}>
                      <SelectTrigger id="imageStatus" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="with-image">มีรูปภาพ</SelectItem>
                        <SelectItem value="without-image">ไม่มีรูปภาพ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
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
