import { CSSProperties, RefCallback, RefObject, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { DragSourceMonitor, useDrag } from 'react-dnd';
import classnames from 'classnames';

import { assign, sleep } from '../utils/index';
import useSelector, { useEventManager, useSortableDispatch } from '../SortableProvider';
import {
  DEFAULT_ITEM_TYPE,
  DragCondition,
  ISortableItem,
  ISortableItemInternalData,
  SortableActionType,
} from '../typings';

const style: React.CSSProperties = {};

type SortItemState<RT extends HTMLElement> = [
  {
    clicked: boolean;
    isDragging: boolean;
    className?: string;
    indicator: number;
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
  index: number;
  sortable?: boolean;
  dragCondition?: DragCondition;
  onDragStart?: (event: SortItemDragStartEvent) => void;
  onDragEnd?: () => void;
}

function useSortItem<T extends ISortableItem, RT extends HTMLElement>(
  type: string = DEFAULT_ITEM_TYPE,
  data: T,
  options?: SortItemOptions
): SortItemState<RT> {
  const { sortable = true, dragCondition } = options || {};

  const dispatch = useSortableDispatch();
  const events = useEventManager();
  const sortableId = useSelector((state) => state.id);
  const dragging = useSelector((state) => state.dragging);
  const dataRef = useRef<ISortableItem>(data);
  const stateRef = useRef<{ indicator: number }>({ indicator: NaN });
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const clicked = useRef(false);

  const setClicked = useCallback((b: boolean) => {
    clicked.current = b;
    forceRender();
  }, []);

  const ref = useRef<RT>(null);

  const handleDragend = useCallback(async () => {
    const evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent('mousemove', true, true, window, 1, 12, 345, 7, 220, false, false, true, false, 0, null);
    for (let i = 0; i < 10; i++) {
      await sleep(50);
      document.dispatchEvent(evObj);
    }
  }, []);

  const handleIndicator = useCallback(({ id, position }) => {
    if (dataRef.current.id == id) {
      stateRef.current.indicator = position;
      forceRender();
    } else if (!isNaN(stateRef.current.indicator)) {
      stateRef.current.indicator = NaN;
      forceRender();
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    if (handleCanDrag('拖拽检测' as any)) {
      setClicked(true);
    }
  }, []);
  const handleMouseUp = useCallback(() => setClicked(false), []);

  // TODO 修复 useDrag end 函数触发问题
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    events.on(SortableActionType.indicator, handleIndicator);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('dragend', handleDragend);
    return () => {
      events.off(SortableActionType.indicator, handleIndicator);
      el.removeEventListener('mouseDown', handleMouseDown);
      el.removeEventListener('mouseUp', handleMouseUp);
      el.removeEventListener('dragend', handleDragend);
    };
  }, [ref.current]);

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
  }, [options?.index]);

  const handleCanDrag = useCallback(
    (monitor: DragSourceMonitor<ISortableItemInternalData>) => {
      return dragCondition ? dragCondition(dataRef.current, monitor) : sortable;
    },
    [sortable]
  );

  const [{ isDragging }, drag, connectDrag] = useDrag<ISortableItemInternalData, any, any>({
    type,
    collect: (monitor) => {
      const item = monitor.getItem();
      const result = {
        isDragging: monitor.isDragging() || item?.id === data.id,
      };
      return result;
    },
    canDrag: handleCanDrag,
    item: () => {
      return (dataRef.current = {
        ...data,
        deleteable: typeof data.deleteable === 'boolean' ? data.deleteable : true,
        _originalSortable: sortableId,
        _sortable: sortableId,
        get _rect() {
          return ref?.current?.getBoundingClientRect();
        },
      });
    },
    end: (item, monitor) => {
      clicked.current = false;
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
      events.emit(SortableActionType.indicator, { id: item, position: NaN });
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

  const handleUpdate = useCallback(({ _rect, _sortable, _originalSortable, ...item }: any) => {
    assign(dataRef.current, item);
    events.emit(SortableActionType.update, {
      item,
      target: _sortable,
      source: _originalSortable,
    });
  }, []);

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
      clicked: clicked.current,
      isDragging,
      update: handleUpdate,
      remove: handleRemove,
      style: containerStyle,
      indicator: stateRef.current.indicator,
      className: classnames('sortable-item', {
        'sortable-item-dragging': isDragging,
      }),
    },
    ref,
    drag as any,
  ];
}

export default useSortItem;
