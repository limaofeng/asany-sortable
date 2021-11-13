import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';
import { DropTargetMonitor, useDrop, XYCoord } from 'react-dnd';
import { isElement } from 'react-is';
import { OnDrop } from '.';

import useSortableSelector, { useEventManager, useSortableDispatch } from './SortableProvider';
import {
  ISortableItemInternalData,
  Relation,
  SortableAction,
  SortableActionType,
  SortableDirection,
  SortableDropCollectedProps,
  SortableDropResult,
  SortableLayout,
  SortableTag,
  SortLog,
  Mode,
  AllowDropFunc,
} from './typings';
import { findInnerIndex, getInsertIndex, getItemCoord, getMonitorCoord } from './utils';

interface SortableContainerTemp {
  node?: ISortableItemInternalData;
  dropPosition?: number;
  lastLog?: SortLog;
  items: ISortableItemInternalData[];
  moving?: boolean;
  isOverCurrent?: boolean;
  item?: ISortableItemInternalData;
  monitor?: DropTargetMonitor;
  activities: ISortableItemInternalData[];
  id: string;
}

type MoveArgs = [string, string, Relation];

interface SortableContainerProps {
  mode: Mode;
  accept: string[];
  style?: CSSProperties;
  tag: SortableTag;
  direction: SortableDirection;
  layout: SortableLayout;
  children: React.ReactNode;
  className?: string;
  removable?: boolean;
  onDrop?: OnDrop;
  allowDrop?: AllowDropFunc;
}

function SortableContainer(props: SortableContainerProps, externalRef: any) {
  const { mode, onDrop, allowDrop, tag, className, style, children, accept, layout, direction } = props;

  const dispatch = useSortableDispatch();
  const events = useEventManager();

  const id = useSortableSelector((state) => state.id);
  const items = useSortableSelector((state) => state.items);
  const moving = useSortableSelector((state) => state.moving);
  const activeIds = useSortableSelector((state) => state.activeIds);

  const [lastLog] = useSortableSelector((state) => state.logs.slice(-1));

  const pendingUpdateFn = useRef<SortableAction>();
  const requestedFrame = useRef<any>();
  const prevMoveData = useRef<MoveArgs>(['', '', 1]);
  const temp = useRef<SortableContainerTemp>({ id, items, lastLog, activities: [] });
  const throttled = useRef(
    throttle(async (item: ISortableItemInternalData, monitor: DropTargetMonitor) => {
      const { isOverCurrent, activities } = temp.current;
      if (!isOverCurrent) {
        return;
      }
      const clientOffset = monitor.getSourceClientOffset() as XYCoord;
      if (!clientOffset) {
        return;
      }
      const moveItem = activities.find((data) => data.id === item.id);
      const itemRect = moveItem?._rect || item._rect;
      if (!itemRect || !item._rect) {
        return;
      }
      const moveItemRect = getMonitorCoord(ref, itemRect, clientOffset);
      for (const data of activities) {
        if (!ref.current?.getBoundingClientRect() && !data._rect) {
          // console.error(ref.current, data._rect);
          continue;
        }
        let coord: any;
        try {
          coord = getItemCoord(ref, data);
        } catch (e) {
          // console.log(e, id, activities, temp.current.activities);
          continue;
        }

        const relation = coord.compare(moveItemRect, layout, direction);
        if (!isNaN(relation)) {
          if (mode == 'wysiwyg') {
            if (item.id == data.id) {
              continue;
            }
            if (allowDrop && !allowDrop({ node: data, dragNode: item, dropPosition: relation })) {
              continue;
            }
            return move(item.id, data.id, relation);
          } else {
            if (item.id == data.id) {
              events.emit(SortableActionType.indicator, { id: data.id, position: NaN });
              temp.current.node = undefined;
              continue;
            }
            if (allowDrop && !allowDrop({ node: data, dragNode: item, dropPosition: relation })) {
              events.emit(SortableActionType.indicator, { id: data.id, position: NaN });
              temp.current.node = undefined;
              console.error('now allowDrop', ref.current, data._rect);
              continue;
            }
            temp.current.node = data;
            temp.current.dropPosition = relation;
            events.emit(SortableActionType.indicator, { id: data.id, position: relation });
          }
        }
      }
    }, 60)
  );

  const resetMoveData = useCallback(() => {
    prevMoveData.current = ['', '', 1];
  }, []);

  const move = useCallback(function (source: string, target: string, relation: Relation) {
    if (isEqual(prevMoveData.current, [source, target, relation])) {
      return;
    }
    const { items, lastLog, moving } = temp.current;
    const sourceIndex = findInnerIndex(source, items);
    const targetIndex = findInnerIndex(target, items);
    if (sourceIndex == targetIndex || targetIndex == -1 || targetIndex == -1) {
      return;
    }
    if (relation < 0 && sourceIndex < targetIndex) {
      return;
    }
    if (relation > 0 && sourceIndex > targetIndex) {
      return;
    }
    // 忽略移动中元素的交换请求
    if (
      moving &&
      lastLog &&
      targetIndex >= Math.min(lastLog.sourceIndex, lastLog.targetIndex) &&
      targetIndex <= Math.max(lastLog.sourceIndex, lastLog.targetIndex)
    ) {
      return;
    }
    // console.log('move', [source, target, sourceIndex, targetIndex], lastLog);
    const action = {
      type: SortableActionType.move,
      payload: { source, target, relation },
    };
    scheduleUpdate(action);
    prevMoveData.current = [source, target, relation];
  }, []);

  useEffect(
    () => () => {
      if (requestedFrame.current !== undefined) {
        cancelAnimationFrame(requestedFrame.current);
      }
    },
    []
  );

  const scheduleUpdate = useCallback(async (updateFn: SortableAction) => {
    pendingUpdateFn.current = updateFn;
    if (!requestedFrame.current) {
      requestedFrame.current = requestAnimationFrame(drawFrame);
    }
  }, []);

  const drawFrame = useCallback((): void => {
    dispatch(pendingUpdateFn.current!);
    pendingUpdateFn.current = undefined;
    requestedFrame.current = undefined;
  }, []);

  const moveOut = useCallback((item: ISortableItemInternalData) => {
    events.emit(SortableActionType.moveOut, { item });
    resetMoveData();
  }, []);

  const moveIn = useCallback((index: number, item: ISortableItemInternalData) => {
    const { id } = temp.current;
    events.emit(SortableActionType.moveIn, {
      insertIndex: index,
      item,
      target: id,
      source: item._sortable,
    });
    resetMoveData();
  }, []);

  const buildExternalRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (typeof externalRef === 'function') {
      return externalRef(ref);
    }
    return ref;
  };

  const ref = useRef<HTMLDivElement>(null);

  const [{ item, isOverCurrent, canDrop, monitor }, drop] = useDrop<
    ISortableItemInternalData,
    SortableDropResult,
    SortableDropCollectedProps
  >({
    accept,
    drop(item) {
      if (!isOverCurrent) {
        return;
      }
      events.emit(SortableActionType.drop, {
        item,
        target: id,
        source: item._originalSortable,
      });
      if (onDrop && !!temp.current.node) {
        onDrop({ node: temp.current.node, dragNode: item, dropPosition: temp.current.dropPosition! });
        events.emit(SortableActionType.indicator, { id: temp.current.node, position: NaN });
        temp.current.node = undefined;
      }
      return { type: 'sort', sortable: id, id: item.id };
    },
    collect: (monitor: DropTargetMonitor<ISortableItemInternalData, SortableDropResult>) => {
      const data = {
        item: monitor.getItem(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        monitor: monitor,
      };
      return data;
    },
    hover: throttled.current,
  });

  temp.current.lastLog = lastLog;
  temp.current.id = id;
  temp.current.item = item;
  temp.current.monitor = monitor;
  temp.current.items = items;
  temp.current.moving = moving;
  temp.current.isOverCurrent = isOverCurrent;
  temp.current.activities = useMemo(() => {
    return items.filter((item) => activeIds.includes(item.id));
  }, [activeIds, items]);

  useEffect(() => {
    if (mode != 'wysiwyg') {
      return;
    }
    const { item, id, monitor, items } = temp.current;
    if (!item || !canDrop || !monitor) {
      return;
    }
    if (isOverCurrent && id === item._sortable) {
      return;
    }
    const [rootId] = id.split('/');
    if (isOverCurrent) {
      const insertIndex = getInsertIndex(item, monitor, items, ref, layout, direction);
      if (!item._originalSortable) {
        item._registered = id;
      }
      moveIn(insertIndex, item);
    } else if (!item._originalSortable && item._registered == id) {
      moveOut(item);
    } else if (!item._originalSortable?.startsWith(rootId) && item._sortable == rootId && rootId == id) {
      moveOut(item);
    }
  }, [isOverCurrent]);

  let backgroundColor = undefined;
  if (canDrop) {
    backgroundColor = 'rgba(68, 171, 255, 0.05)';
  }
  if (isElement(tag)) {
    return React.cloneElement(tag as any, {
      ref: drop(buildExternalRef(ref)),
      children,
      className: classnames(className),
      style: { ...style, backgroundColor },
    });
  }
  return React.createElement(tag as any, {
    ref: drop(buildExternalRef(ref)),
    children,
    className: classnames(className),
    style: { ...style, backgroundColor },
  });
}

export default React.forwardRef(SortableContainer);
