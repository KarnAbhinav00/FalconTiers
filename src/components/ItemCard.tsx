import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Item {
    id: number;
    name: string;
    imageUrl: string;
    tierId: number;
}

interface ItemCardProps {
    item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="item-card"
        >
            <img src={item.imageUrl} alt={item.name} draggable={false} />
            <div className="item-name-overlay">{item.name}</div>
        </div>
    );
};
