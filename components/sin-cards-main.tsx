'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Ban, AlertTriangle, FileWarning } from 'lucide-react';

// ข้อมูล Mock สำหรับ 3 กลุ่มหลัก
const sinCardCategories = [
  {
    id: 'banned',
    title: 'Banned Cards',
    titleThai: 'การ์ดต้องห้าม',
    description: 'การ์ดที่ถูกห้ามใช้ในการแข่งขันอย่างสมบูรณ์',
    icon: Ban,
    color: 'from-red-600 via-red-700 to-red-900',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-500',
    bgGlow: 'bg-red-500/10',
    representativeCard: {
      id: 1,
      name: '[ โคลัมบัส ] 4 > 1 ใน',
      imageUrl: '/character/1.png',
      count: 12, // จำนวนการ์ดทั้งหมดในกลุ่มนี้
    },
  },
  {
    id: 'limited',
    title: 'Limited Cards',
    titleThai: 'การ์ดจำกัด',
    description: 'การ์ดที่ถูกจำกัดจำนวนที่สามารถใส่ใน Deck หรือมีการเพิ่มจำนวนที่ใส่ได้',
    icon: AlertTriangle,
    color: 'from-orange-600 via-red-600 to-rose-700',
    borderColor: 'border-orange-500/50',
    iconColor: 'text-orange-500',
    bgGlow: 'bg-orange-500/10',
    representativeCard: {
      id: 2,
      name: '[ การ์ดตัวอย่าง 2 ] 3 > 1 ใน',
      imageUrl: '/character/2.png',
      count: 8,
    },
  },
  {
    id: 'conditional',
    title: 'Conditional Cards',
    titleThai: 'การ์ดมีเงื่อนไข',
    description: 'การ์ดที่มีเงื่อนไขพิเศษในการใช้งาน เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ หรือต้องเลือกใบใดใบหนึ่ง',
    icon: FileWarning,
    color: 'from-amber-600 via-orange-600 to-red-600',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-500',
    bgGlow: 'bg-amber-500/10',
    representativeCard: {
      id: 3,
      name: '[ การ์ดตัวอย่าง 3 ] 4 > 2 ใน',
      imageUrl: '/character/3.png',
      count: 15,
    },
  },
];

export function SinCardsMain() {
  return (
    <div
      id="sin-cards-section"
      className="relative w-full overflow-hidden border-t border-border/20"
    >
      {/* Background - โทนเลือด/แดงที่ลดความเข้มลง */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-background" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-rose-500/5 blur-3xl animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-6 py-2 backdrop-blur-sm">
            <Ban className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              ประจำเดือนธันวาคม 2568
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
            การ์ดบาป
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            การ์ดที่ถูกจำกัดการใช้งานเพื่อสร้างความสมดุลในเกม แบ่งออกเป็น 3 ประเภทหลัก
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {sinCardCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/sin-cards/${category.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border-2 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-glow hover:card-glow hover:scale-105">
                  {/* Gradient Border Top */}
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon & Title */}
                    <div className="mb-6 flex items-center gap-4">
                      <div className={`rounded-xl ${category.bgGlow} p-3 ring-2 ring-border/20 transition-all group-hover:ring-4 group-hover:ring-${category.iconColor}/20`}>
                        <Icon className={`h-8 w-8 ${category.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-glow">
                          {category.titleThai}
                        </h3>
                        <p className="text-sm text-muted-foreground">{category.title}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>

                    {/* Representative Card */}
                    <div className="relative mb-4">
                      <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-lg border-2 bg-muted/30 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-red-500/20">
                        <Image
                          src={category.representativeCard.imageUrl}
                          alt={category.representativeCard.name}
                          fill
                          className="object-cover"
                        />
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      
                      {/* Card count badge */}
                      <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-red-600 to-rose-600 shadow-lg">
                        <span className="text-lg font-bold text-white">
                          {category.representativeCard.count}
                        </span>
                      </div>
                    </div>

                    {/* Card Name */}
                    <p className="text-center text-sm font-medium text-foreground line-clamp-2">
                      {category.representativeCard.name}
                    </p>

                    {/* View All Button */}
                    <div className="mt-6 rounded-lg border border-border/40 bg-gradient-to-r from-red-950/20 via-rose-950/20 to-red-950/20 p-4 text-center transition-all group-hover:border-red-500/40 group-hover:from-red-950/30 group-hover:via-rose-950/30 group-hover:to-red-950/30">
                      <span className="text-sm font-semibold text-red-400 group-hover:text-red-300">
                        ดูการ์ดทั้งหมด →
                      </span>
                    </div>
                  </div>

                  {/* Background glow effect */}
                  <div className={`absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 blur-2xl`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-12 rounded-xl border border-red-500/20 bg-red-950/10 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-500/10 p-2">
              <FileWarning className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h4 className="mb-2 font-bold text-red-300">หมายเหตุ</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                รายการการ์ดบาปจะมีการอัพเดททุกเดือน กรุณาตรวจสอบรายการล่าสุดก่อนการแข่งขันทุกครั้ง
                การใช้การ์ดที่ถูกแบนหรือไม่ปฏิบัติตามเงื่อนไขอาจส่งผลให้ถูกตัดสิทธิ์จากการแข่งขัน
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}