import { Card as CardType } from '@/types/card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CardItemProps {
  card: CardType;
}

export function CardItem({ card }: CardItemProps) {
  const getRarityColor = (rare: string) => {
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
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Avatar':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Magic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Life':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow">
      <div className={`h-1 bg-gradient-to-r ${getRarityColor(card.rare)}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="relative pb-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-thai text-lg font-bold text-foreground group-hover:text-glow line-clamp-2">
            {card.name}
          </h3>
          <Badge
            variant="secondary"
            className={`shrink-0 border backdrop-blur-sm ${getTypeColor(card.type)}`}
          >
            {card.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{card.print}</span>
          <span>•</span>
          <Badge variant="outline" className="text-xs">
            {card.rare}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          {card.cost && (
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-xs text-muted-foreground">Cost</div>
              <div className="font-bold">{card.cost}</div>
            </div>
          )}
          {card.power && (
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-xs text-muted-foreground">Power</div>
              <div className="font-bold">{card.power}</div>
            </div>
          )}
          {card.gem && (
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-xs text-muted-foreground">Gem</div>
              <div className="font-bold">{card.gem}</div>
            </div>
          )}
        </div>

        {/* Symbol */}
        {card.symbol && (
          <div className="text-sm">
            <span className="text-muted-foreground">Symbol:</span>{' '}
            <span className="font-semibold text-foreground">{card.symbol}</span>
          </div>
        )}

        {/* Main Effect */}
        {card.mainEffect && (
          <div className="rounded-md bg-muted/30 p-3">
            <div className="mb-1 text-xs font-semibold text-accent">Main Effect</div>
            <p className="font-thai text-xs leading-relaxed text-foreground/90 line-clamp-3">
              {card.mainEffect}
            </p>
          </div>
        )}

        {/* Drop Rate */}
        {card.dropRate && (
          <div className="text-xs text-muted-foreground">
            Drop Rate: <span className="text-foreground">{card.dropRate}</span>
          </div>
        )}

        {/* Sin Card Restrictions - Show all applicable restrictions */}
        {(card.sinCardStatus === 'banned' || card.sinCardStatus === 'limited' || card.sinCardStatus === 'conditional' || card.sinCardLimit) && (
          <div className="space-y-1 border-t border-border/50 pt-3">
            {/* Banned Status */}
            {card.sinCardStatus === 'banned' && (
              <Badge variant="destructive" className="w-full justify-center text-xs">
                🚫 ถูกแบน
              </Badge>
            )}
            
            {/* Limited Status */}
            {card.sinCardLimit !== undefined && (
              <Badge variant="secondary" className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">
                ⚠️ จำกัด {card.sinCardLimit} ใบ
              </Badge>
            )}
            
            {/* Conditional Restrictions */}
            {card.sinCardConditionType && card.sinCardConditionType !== 'none' && (
              <Badge variant="secondary" className="w-full justify-center bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs">
                {card.sinCardConditionType === 'choose_one' && '🔄 มีเงื่อนไข: เลือกได้ 1 ใบ'}
                {card.sinCardConditionType === 'requires_avatar_symbol' && '🔄 มีเงื่อนไข: Avatar Symbol'}
                {card.sinCardConditionType === 'shared_name_limit' && '🔄 มีเงื่อนไข: Shared Name Limit'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
