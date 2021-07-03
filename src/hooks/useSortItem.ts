import {
  CSSProperties,
  RefCallback,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useDrag } from 'react-dnd';

import { assign, sleep } from '../utils/index';
import useSelector, {
  useEventManager,
  useSortableDispatch,
} from '../SortableProvider';
import {
  ISortableItem,
  ISortableItemInternalData,
  SortableActionType,
} from '../typings';

const style: React.CSSProperties = {};

type SortItemState<RT extends HTMLElement> = [
  {
    isDragging: boolean;
    className?: string;
    style: CSSProperties;
    update: (data: ISortableItem) => void;
    remove: () => void;
  },
  RefObject<RT>,
  (ref: RefObject<any>) => RefCallback<any>
];

export type SortItemDragStartEvent = {
  target: ISortableItem;
  update: (data: ISortableItem) => void;
};

interface SortItemOptions {
  sortable?: boolean;
  onDragStart?: (event: SortItemDragStartEvent) => void;
  onDragEnd?: () => void;
}

function useSortItem<T extends ISortableItem, RT extends HTMLElement>(
  data: T,
  options?: SortItemOptions
): SortItemState<RT> {
  const { sortable = true } = options || {};

  const dispatch = useSortableDispatch();
  const events = useEventManager();
  const sortableId = useSelector((state) => state.id);
  const dragging = useSelector((state) => state.dragging);
  const dataRef = useRef<ISortableItem>(data);

  const ref = useRef<RT>(null);

  const handleDragend = useCallback(async () => {
    const evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent(
      'mousemove',
      true,
      true,
      window,
      1,
      12,
      345,
      7,
      220,
      false,
      false,
      true,
      false,
      0,
      null
    );
    for (let i = 0; i < 10; i++) {
      await sleep(50);
      document.dispatchEvent(evObj);
    }
  }, []);

  // TODO 修复 useDrag end 函数触发问题
  useEffect(() => {
    const timer = setInterval(() => {
      if (!ref.current) {
        return;
      }
      clearInterval(timer);
      ref.current.addEventListener('dragend', handleDragend);
    }, 100);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    dispatch({
      type: SortableActionType.register,
      payload: {
        id: data.id,
        get _rect() {
          return ref.current?.getBoundingClientRect();
        },
      },
    });
  }, []);

  const [{ isDragging }, drag, connectDrag] = useDrag<
    ISortableItemInternalData,
    any,
    any
  >({
    type: data.type,
    collect: (monitor) => {
      const item = monitor.getItem();
      const result = {
        isDragging: monitor.isDragging() || item?.id === data.id,
      };
      return result;
    },
    canDrag() {
      return sortable;
    },
    item: () => {
      return (dataRef.current = {
        ...data,
        deleteable:
          typeof data.deleteable === 'boolean' ? data.deleteable : true,
        _originalSortable: sortableId,
        _sortable: sortableId,
        get _rect() {
          return ref?.current?.getBoundingClientRect();
        },
      });
    },
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (result?.type === 'sort') {
        return;
      }
      if (result?.type === 'dustbin') {
        events.emit(SortableActionType.remove, {
          item,
          target: item!._sortable,
          source: item!._originalSortable,
        });
        events.emit(SortableActionType.drop, {
          item,
          target: null,
          source: item._originalSortable,
        });
        return;
      }
      events.emit(SortableActionType.reset, {
        item,
        target: item!._sortable,
        source: item!._originalSortable,
      });
    },
  });

  connectDrag(ref);

  const opacity = isDragging ? 0.6 : 1;
  const containerStyle = useMemo(() => ({ ...style, opacity }), [opacity]);

  useEffect(() => {
    if (!isDragging || !!dragging) {
      return;
    }
    events.emit(SortableActionType.dragging, dataRef.current);
  }, [isDragging]);

  const handleUpdate = useCallback(
    ({ _rect, _sortable, _originalSortable, ...item }: any) => {
      assign(dataRef.current, item);
      events.emit(SortableActionType.update, {
        item,
        target: _sortable,
        source: _originalSortable,
      });
    },
    []
  );

  const handleRemove = useCallback(() => {
    const item = {
      ...data,
      _originalSortable: sortableId,
      _sortable: sortableId,
    };
    events.emit(SortableActionType.remove, {
      item,
      target: sortableId,
      source: sortableId,
    });
  }, [sortableId]);

  return [
    {
      isDragging,
      update: handleUpdate,
      remove: handleRemove,
      style: containerStyle,
      className: isDragging
        ? 'sortable-item sortable-item-dragging'
        : 'sortable-item',
    },
    ref,
    drag as any,
  ];
}

export default useSortItem;
