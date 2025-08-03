import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
  minHeightClass?: string;
}

export default function KanbanColumn({ id, title, color, count, children, minHeightClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-2xl shadow-lg border-0 px-2 pb-4 pt-3
        ${color}
        ${minHeightClass ? minHeightClass : 'min-h-[550px]'}
        ${isOver ? 'ring-4 ring-blue-400/40 scale-[1.02]' : ''}
        transition-all duration-200
      `}
      style={{ 
        overflow: 'visible',
        isolation: 'auto'
      }}
    >
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="font-bold text-lg tracking-tight text-gray-900 drop-shadow-sm">{title}</h2>
        <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold bg-white/80 text-gray-700 border border-gray-200 shadow rounded-full">
          {count}
        </span>
      </div>
      <div 
        className="flex-1 flex flex-col gap-4"
        style={{ 
          overflow: 'visible'
        }}
      >
        {children}
        {count === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400/80 select-none min-h-[60px]">
            <p className="text-sm">גרור דירות לכאן</p>
          </div>
        )}
      </div>
    </div>
  );
}