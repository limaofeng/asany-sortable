import { useCallback, useEffect } from 'react';
import { ISortableItem, SortableActionType } from '../index';
import useSortableSelector, { useEventManager } from '../SortableProvider';
import { SortItemDragStartEvent } from './useSortItem';

export type DragEndCallback = () => void;

export type DragStartCallback = (event: SortItemDragStartEvent) => DragEndCallback | undefined;

function useSortItemDrag(id: string, callback: DragStartCallback) {
  const events = useEventManager();

  const data = useSortableSelector((state) => state.items.find((item) => item.id === id));

  const handleDragStart = useCallback((item: ISortableItem) => {
    if (item.id !== id || !data) {
      return;
    }
    callback({ target: data, update: () => {} });
  }, []);

  useEffect(() => {
    events.on(SortableActionType.dragging, handleDragStart);
    return () => {
      events.off(SortableActionType.dragging, handleDragStart);
    };
  }, []);
}

export default useSortItemDrag;
