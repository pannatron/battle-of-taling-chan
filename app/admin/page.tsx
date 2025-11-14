'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import {
  getAllCards,
  updateCardImage,
  updateCardSinStatus,
  updateCardSinStatusByName,
} from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { X, Ban, AlertTriangle, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'image' | 'sin'>('image');
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [imageStatusFilter, setImageStatusFilter] = useState('all');
  const [sinStatusFilter, setSinStatusFilter] = useState('all');
  
  // Sin card management states
  const [sinCardStatus, setSinCardStatus] = useState<string>('normal');
  const [sinCardReason, setSinCardReason] = useState('');
  const [sinCardLimit, setSinCardLimit] = useState<number>(1);
  const [sinCardLimitInput, setSinCardLimitInput] = useState<string>('1');
  const [sinCardCondition, setSinCardCondition] = useState('');
  const [applyToAllVersions, setApplyToAllVersions] = useState(true);
  const [relatedCards, setRelatedCards] = useState<Card[]>([]);
  
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

    // Sin status filter
    if (sinStatusFilter !== 'all') {
      filtered = filtered.filter((card) => (card.sinCardStatus || 'normal') === sinStatusFilter);
    }

    setFilteredCards(filtered);
  }, [searchTerm, typeFilter, rarityFilter, seriesFilter, colorFilter, imageStatusFilter, sinStatusFilter, cards]);

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
    setSinStatusFilter('all');
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    setImageUrl(card.imageUrl || '');
    setSinCardStatus(card.sinCardStatus || 'normal');
    setSinCardReason(card.sinCardReason || '');
    const limit = card.sinCardLimit || 1;
    setSinCardLimit(limit);
    setSinCardLimitInput(String(limit));
    setSinCardCondition(card.sinCardCondition || '');
    setMessage('');
    
    // Find related cards with the same name
    const related = cards.filter(c => c.name === card.name && c._id !== card._id);
    setRelatedCards(related);
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

  const handleUpdateSinStatus = async () => {
    if (!selectedCard) {
      setMessage('กรุณาเลือกการ์ด');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const sinCardData: any = {
        sinCardStatus,
        sinCardReason: sinCardReason || undefined,
        sinCardDate: sinCardStatus !== 'normal' ? new Date() : undefined,
      };

      if (sinCardStatus === 'limited') {
        sinCardData.sinCardLimit = sinCardLimit;
      }

      if (sinCardStatus === 'conditional') {
        sinCardData.sinCardCondition = sinCardCondition;
      }

      if (applyToAllVersions && relatedCards.length > 0) {
        // Update all cards with the same name
        const result = await updateCardSinStatusByName(selectedCard.name, sinCardData);
        if (result && result.cards) {
          setMessage(`อัพเดทสถานะการ์ดบาปสำเร็จ! (${result.modifiedCount} การ์ด)`);
          const updatedCardIds = result.cards.map(c => c._id);
          const updatedCards = cards.map((c) =>
            updatedCardIds.includes(c._id!) 
              ? result.cards.find(uc => uc._id === c._id) || c
              : c
          );
          setCards(updatedCards);
          const newSelected = result.cards.find(c => c._id === selectedCard._id);
          if (newSelected) setSelectedCard(newSelected);
        } else {
          setMessage('เกิดข้อผิดพลาดในการอัพเดทสถานะการ์ดบาป');
        }
      } else {
        // Update only selected card
        const updated = await updateCardSinStatus(selectedCard._id, sinCardData);
        if (updated) {
          setMessage('อัพเดทสถานะการ์ดบาปสำเร็จ!');
          const updatedCards = cards.map((c) =>
            c._id === updated._id ? updated : c
          );
          setCards(updatedCards);
          setSelectedCard(updated);
        } else {
          setMessage('เกิดข้อผิดพลาดในการอัพเดทสถานะการ์ดบาป');
        }
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const getSinCardIcon = (status?: string) => {
    switch (status) {
      case 'banned':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'limited':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'conditional':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSinCardBadge = (status?: string) => {
    if (!status || status === 'normal') return null;
    
    const colors = {
      banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      limited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      conditional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    const labels = {
      banned: 'ห้ามใช้',
      limited: 'จำกัด',
      conditional: 'มีเงื่อนไข',
    };

    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        ระบบจัดการการ์ด (Admin)
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        <Button
          variant={activeTab === 'image' ? 'default' : 'outline'}
          onClick={() => setActiveTab('image')}
        >
          จัดการรูปภาพ
        </Button>
        <Button
          variant={activeTab === 'sin' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sin')}
        >
          จัดการการ์ดบาป
        </Button>
      </div>

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

                  {activeTab === 'image' && (
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
                  )}

                  {activeTab === 'sin' && (
                    <div className="col-span-2">
                      <Label htmlFor="sinStatus">สถานะการ์ดบาป</Label>
                      <Select value={sinStatusFilter} onValueChange={setSinStatusFilter}>
                        <SelectTrigger id="sinStatus" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="normal">ปกติ</SelectItem>
                          <SelectItem value="banned">ห้ามใช้</SelectItem>
                          <SelectItem value="limited">จำกัด</SelectItem>
                          <SelectItem value="conditional">มีเงื่อนไข</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

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
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {card.rare}
                      </span>
                      {activeTab === 'image' && (
                        <span className="text-xs text-gray-500">
                          {card.imageUrl ? '✓ มีรูปภาพ' : '✗ ไม่มีรูปภาพ'}
                        </span>
                      )}
                      {activeTab === 'sin' && (
                        <div className="flex items-center gap-1">
                          {getSinCardIcon(card.sinCardStatus)}
                          {getSinCardBadge(card.sinCardStatus)}
                        </div>
                      )}
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
          {activeTab === 'image' ? (
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

                    <div>
                      <Label htmlFor="imageUrl">URL รูปภาพใหม่</Label>
                      <Input
                        id="imageUrl"
                        type="text"
                        placeholder="https://example.com/image.png"
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
          ) : (
            <CardUI>
              <CardHeader>
                <CardTitle>จัดการสถานะการ์ดบาป</CardTitle>
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
                      </div>
                    </div>

                    {/* Sin Card Status */}
                    <div>
                      <Label htmlFor="sinStatus">สถานะการ์ดบาป</Label>
                      <Select value={sinCardStatus} onValueChange={setSinCardStatus}>
                        <SelectTrigger id="sinStatus" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">ปกติ</SelectItem>
                          <SelectItem value="banned">ห้ามใช้</SelectItem>
                          <SelectItem value="limited">จำกัด</SelectItem>
                          <SelectItem value="conditional">มีเงื่อนไข</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reason */}
                    {sinCardStatus !== 'normal' && (
                      <div>
                        <Label htmlFor="reason">เหตุผล</Label>
                        <Textarea
                          id="reason"
                          placeholder="ระบุเหตุผลในการจำกัดการใช้งานการ์ดนี้"
                          value={sinCardReason}
                          onChange={(e) => setSinCardReason(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                    )}

                    {/* Limit (for limited cards) */}
                    {sinCardStatus === 'limited' && (
                      <div>
                        <Label htmlFor="limit">จำนวนที่อนุญาต</Label>
                        <Input
                          id="limit"
                          type="number"
                          min="1"
                          max="4"
                          value={sinCardLimitInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSinCardLimitInput(val);
                            if (val !== '') {
                              const num = parseInt(val);
                              if (!isNaN(num) && num >= 1 && num <= 4) {
                                setSinCardLimit(num);
                              }
                            }
                          }}
                          onBlur={() => {
                            // When user leaves the field, ensure we have a valid number
                            if (sinCardLimitInput === '' || parseInt(sinCardLimitInput) < 1) {
                              setSinCardLimitInput('1');
                              setSinCardLimit(1);
                            } else if (parseInt(sinCardLimitInput) > 4) {
                              setSinCardLimitInput('4');
                              setSinCardLimit(4);
                            }
                          }}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          จำนวนการ์ดที่สามารถใส่ใน Deck ได้ (1-4)
                        </p>
                        {selectedCard.sinCardPreviousLimit && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            ℹ️ จำนวนเดิมก่อนปรับ: {selectedCard.sinCardPreviousLimit} ใบ
                          </p>
                        )}
                      </div>
                    )}

                    {/* Condition (for conditional cards) */}
                    {sinCardStatus === 'conditional' && (
                      <div>
                        <Label htmlFor="condition">เงื่อนไข</Label>
                        <Textarea
                          id="condition"
                          placeholder="ระบุเงื่อนไขในการใช้งานการ์ดนี้"
                          value={sinCardCondition}
                          onChange={(e) => setSinCardCondition(e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Related cards info and checkbox */}
                    {relatedCards.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2 mb-2">
                          <input
                            type="checkbox"
                            id="applyToAll"
                            checked={applyToAllVersions}
                            onChange={(e) => setApplyToAllVersions(e.target.checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="applyToAll" className="cursor-pointer">
                            <span className="font-bold">ใช้กับการ์ดทุกระดับที่มีชื่อเดียวกัน</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              พบการ์ดชื่อเดียวกันอีก {relatedCards.length} ใบ: {relatedCards.map(c => c.rare).join(', ')}
                            </p>
                          </Label>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUpdateSinStatus}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'กำลังอัพเดท...' : 
                        applyToAllVersions && relatedCards.length > 0 
                          ? `อัพเดท ${relatedCards.length + 1} การ์ด` 
                          : 'อัพเดทสถานะการ์ดบาป'}
                    </Button>

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
          )}
        </div>
      </div>
    </div>
  );
}
