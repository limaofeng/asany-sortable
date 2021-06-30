import { useCallback } from 'react';

import useSortableSelector, { useEventManager } from '../SortableProvider';
import { SortableActionType } from '../typings';

function useSortItemRemove(id: string) {
  const events = useEventManager();

  const sortableId = useSortableSelector((state) => state.id);
  const data = useSortableSelector((state) => state.items.find((item) => item.id == id));

  const handleRemove = useCallback(() => {
    const item = {
      ...data,
      _originalSortable: sortableId,
      _sortable: sortableId,
    };
    events.emit(SortableActionType.remove, { item, target: sortableId, source: sortableId });
  }, [sortableId]);
  return handleRemove;
}

export default useSortItemRemove;
