import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ItemCard } from './ItemCard';

interface Item {
    id: number;
    name: string;
    imageUrl: string;
    tierId: number;
}

interface Tier {
    id: number;
    name: string;
    color: string;
    emoji: string;
    items: Item[];
}

interface TierRowProps {
    tier: Tier;
}

export const TierRow: React.FC<TierRowProps> = ({ tier }) => {
    const { setNodeRef } = useDroppable({
        id: `tier-${tier.id}`,
    });

    return (
        <div className="tier-row">
            <div
                className="tier-label"
                style={{ backgroundColor: tier.color }}
            >
                <span style={{ fontSize: '24px' }}>{tier.emoji}</span>
                <span>{tier.name}</span>
            </div>
            <div
                ref={setNodeRef}
                className="tier-items"
            >
                <SortableContext
                    items={tier.items.map(item => item.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {tier.items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
