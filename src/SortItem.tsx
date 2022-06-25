import classnames from 'classnames';
import React, { CSSProperties, useEffect, useMemo, useReducer } from 'react';

import { useSortItem } from './hooks';
import useSortableSelector, { useEventManager } from './SortableProvider';
import {
  DragCondition,
  EVENT_ITEMRENDER_RERENDER,
  ISortableItem,
  SortableItemProps,
  SortableItemRender,
} from './typings';
import { injectAnime, renderItem } from './utils';

export interface SortItemProps<T extends ISortableItem> {
  index: number;
  data: T;
  className?: string;
  style?: CSSProperties;
  draggable: DragCondition;
  preview?: boolean;
  itemRender: SortableItemRender<T>;
}

function SortItem<T extends ISortableItem>({
  index,
  data,
  itemRender,
  className,
  draggable,
  style,
  preview,
  ...props
}: SortItemProps<T>) {
  const [version, forceRender] = useReducer((s) => s + 1, 0);
  const events = useEventManager();
  const io = useSortableSelector((state) => state.io);
  const level = useSortableSelector((state) => state.id.split('/').length);
  const visibled = useSortableSelector((state) => state.activeIds.includes(data.id));
  const [{ style: aste, className: acn, remove, update, isDragging, clicked, indicator }, ref, drag] = useSortItem(
    data.type,
    data,
    {
      index,
      draggable,
    }
  );

  const animated = injectAnime(props);

  const styleMerged = useMemo(() => ({ ...style, ...aste }), [style, aste]);
  const classNameMerged = useMemo(() => classnames(className, acn), [className, acn]);
  const animatedMerged = useMemo(() => animated, [animated.key]);

  useEffect(() => {
    const el = ref.current!;
    el.dataset['id'] = data.id;
    io.observe(el);
    return () => {
      io.unobserve(el);
    };
  }, [io]);

  useEffect(() => {
    if (!visibled) {
      return;
    }
    events.on(EVENT_ITEMRENDER_RERENDER, forceRender);
    return () => {
      events.off(EVENT_ITEMRENDER_RERENDER, forceRender);
    };
  }, [visibled]);

  return React.useMemo(() => {
    const props: SortableItemProps<T> = {
      dragging: isDragging,
      animated: animatedMerged,
      className: classNameMerged,
      style: styleMerged,
      data: data as any,
      level,
      index,
      remove,
      update,
      indicator,
      drag,
    };
    return renderItem(itemRender, props, ref);
  }, [version, level, styleMerged, classNameMerged, animatedMerged, data, clicked, isDragging, indicator]);
}

export default React.memo(SortItem);
