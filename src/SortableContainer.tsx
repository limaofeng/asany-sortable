import classnames from 'classnames';
import { isEqual } from 'lodash';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';
import { DropTargetMonitor, useDrop, XYCoord } from 'react-dnd';
import { isElement } from 'react-is';

import useSortableSelector, {
  useEventManager,
  useSortableDispatch,
} from './SortableProvider';
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
} from './typings';
import {
  findInnerIndex,
  getInsertIndex,
  getItemCoord,
  getMonitorCoord,
} from './utils';

interface SortableContainerTemp {
  lastLog?: SortLog;
  items: ISortableItemInternalData[];
  moving?: boolean;
  item?: ISortableItemInternalData;
  monitor?: DropTargetMonitor;
  id: string;
}

type MoveArgs = [string, string, Relation];

interface SortableContainerProps {
  accept: string[];
  style?: CSSProperties;
  tag: SortableTag;
  direction: SortableDirection;
  layout: SortableLayout;
  children: React.ReactNode;
  className?: string;
  removable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function SortableContainer(props: SortableContainerProps, externalRef: any) {
  const {
    tag,
    className,
    style,
    children,
    accept,
    layout,
    direction,
    onClick,
  } = props;

  const dispatch = useSortableDispatch();
  const events = useEventManager();

  const id = useSortableSelector((state) => state.id);
  const items = useSortableSelector((state) => state.items);
  const moving = useSortableSelector((state) => state.moving);
  const [lastLog] = useSortableSelector((state) => state.logs.slice(-1));
  const prevMoveData = useRef<MoveArgs>(['', '', 'after']);

  const temp = useRef<SortableContainerTemp>({ id, items, lastLog });

  temp.current.lastLog = lastLog;

  const pendingUpdateFn = useRef<SortableAction>();
  const requestedFrame = useRef<any>();

  const resetMoveData = useCallback(() => {
    prevMoveData.current = ['', '', 'after'];
  }, []);

  const move = useCallback(function (
    source: string,
    target: string,
    relation: Relation
  ) {
    if (isEqual(prevMoveData.current, [source, target, relation])) {
      return;
    }
    const { items, lastLog, moving } = temp.current;
    const sourceIndex = findInnerIndex(source, items);
    const targetIndex = findInnerIndex(target, items);
    if (sourceIndex == targetIndex || targetIndex == -1 || targetIndex == -1) {
      return;
    }
    if (relation === 'before' && sourceIndex < targetIndex) {
      return;
    }
    if (relation === 'after' && sourceIndex > targetIndex) {
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
  },
  []);

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

  const moveIn = useCallback(
    (index: number, item: ISortableItemInternalData) => {
      const { id } = temp.current;
      events.emit(SortableActionType.moveIn, {
        insertIndex: index,
        item,
        target: id,
        source: item._sortable,
      });
      resetMoveData();
    },
    []
  );

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
      return { type: 'sort', sortable: id, id: item.id };
    },
    collect: (
      monitor: DropTargetMonitor<ISortableItemInternalData, SortableDropResult>
    ) => {
      const data = {
        item: monitor.getItem(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        monitor: monitor,
      };
      return data;
    },
    hover: async (item, monitor) => {
      if (!isOverCurrent) {
        return;
      }
      let clientOffset = monitor.getSourceClientOffset() as XYCoord;
      if (!clientOffset) {
        return;
      }
      const _moveItem = items.find((data) => data.id === item.id);
      let itemRect: DOMRect;
      if (!_moveItem?._rect) {
        return;
      }
      itemRect = _moveItem._rect;
      let moveItem = getMonitorCoord(ref, itemRect, clientOffset);
      for (const data of items.filter(
        (data) => data.id !== item.id && !!data._rect
      )) {
        const coord = getItemCoord(ref, data);
        const relation = coord.compare(moveItem, layout, direction);
        if (relation !== 'none') {
          return move(item.id, data.id, relation);
        }
      }
    },
  });

  temp.current.id = id;
  temp.current.item = item;
  temp.current.monitor = monitor;
  temp.current.items = items;
  temp.current.moving = moving;

  useEffect(() => {
    const { item, id, monitor, items } = temp.current;
    if (!item || !canDrop || !monitor) {
      return;
    }
    if (isOverCurrent && id === item._sortable) {
      return;
    }
    const [rootId] = id.split('/');
    if (isOverCurrent) {
      const insertIndex = getInsertIndex(
        item,
        monitor,
        items,
        ref,
        layout,
        direction
      );
      if (!item._originalSortable) {
        item._registered = id;
      }
      moveIn(insertIndex, item);
    } else if (!item._originalSortable && item._registered == id) {
      moveOut(item);
    } else if (
      !item._originalSortable?.startsWith(rootId) &&
      item._sortable == rootId &&
      rootId == id
    ) {
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
      onClick: onClick,
      style: { ...style, backgroundColor },
    });
  }
  return React.createElement(tag as any, {
    ref: drop(buildExternalRef(ref)),
    children,
    className: classnames(className),
    onClick: onClick,
    style: { ...style, backgroundColor },
  });
}

export default React.forwardRef(SortableContainer);
