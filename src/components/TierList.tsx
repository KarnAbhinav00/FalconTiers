'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TierRow } from './TierRow';
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
    order: number;
}

export default function TierList() {
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [activeItem, setActiveItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const response = await fetch('/api/tiers');
            const data = await response.json();
            setTiers(data);
        } catch (error) {
            console.error('Error fetching tiers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const item = tiers.flatMap(t => t.items).find(i => i.id === active.id);
        if (item) setActiveItem(item);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id as string;

        // Check if dropped over a tier
        if (overId.startsWith('tier-')) {
            const targetTierId = parseInt(overId.split('-')[1]);
            const sourceTier = tiers.find(t => t.items.some(i => i.id === activeId));

            if (sourceTier && sourceTier.id !== targetTierId) {
                // Move item to new tier
                const item = sourceTier.items.find(i => i.id === activeId)!;

                // Update local state
                setTiers(prev => prev.map(t => {
                    if (t.id === sourceTier.id) {
                        return { ...t, items: t.items.filter(i => i.id !== activeId) };
                    }
                    if (t.id === targetTierId) {
                        return { ...t, items: [...t.items, { ...item, tierId: targetTierId }] };
                    }
                    return t;
                }));

                // Update database
                try {
                    await fetch('/api/items', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: activeId, tierId: targetTierId }),
                    });
                } catch (error) {
                    console.error('Error updating item tier:', error);
                    fetchTiers(); // Revert on error
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col">
                    {tiers.map((tier) => (
                        <TierRow key={tier.id} tier={tier} />
                    ))}
                </div>

                <DragOverlay>
                    {activeItem ? (
                        <div className="item-card scale-110 opacity-80">
                            <img src={activeItem.imageUrl} alt={activeItem.name} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
