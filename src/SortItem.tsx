import classnames from 'classnames';
import React, { CSSProperties, useEffect, useMemo, useReducer, useRef } from 'react';

import { useSortItem } from './hooks';
import useSortableSelector, { useEventManager } from './SortableProvider';
import { DragCondition, EVENT_ITEMRENDER_RERENDER, ISortableItem, SortableItemContentRender } from './typings';
import { injectAnime } from './utils';

export interface SortItemProps {
  data: ISortableItem;
  className?: string;
  style?: CSSProperties;
  dragCondition?: DragCondition;
  itemRender: SortableItemContentRender;
}

function SortItem({ data, itemRender, dragCondition, className, style, ...props }: SortItemProps) {
  const [version, forceRender] = useReducer((s) => s + 1, 0);
  const events = useEventManager();
  const io = useSortableSelector((state) => state.io);
  const visibled = useSortableSelector((state) => state.activeIds.includes(data.id));
  const [
    { style: additionStyle, className: additionClassName, remove, update, isDragging, clicked },
    ref,
    drag,
  ] = useSortItem(data.type, data, {
    sortable: data.sortable,
    dragCondition,
  });
  const state = useRef({
    animated: injectAnime(props),
    style,
    className: classnames(className, additionClassName),
  });

  const animated = injectAnime(props);
  const animatedKey = Object.keys(animated)
    .map((key) => animated[key])
    .join(',');

  const styleMerged = { ...style, ...additionStyle };
  const styleMergedKey = Object.keys(styleMerged)
    .map((key) => (styleMerged as any)[key])
    .join(',');

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

  state.current = useMemo(() => {
    return { animated, style: styleMerged, className: classnames(className, additionClassName) };
  }, [animatedKey, styleMergedKey, className, additionClassName]);

  return React.useMemo(() => {
    const props = {
      clicked,
      dragging: isDragging,
      animated: state.current.animated,
      className: state.current.className,
      style: state.current.style,
      data,
      remove,
      update,
      drag,
    };
    if (typeof itemRender === 'function') {
      return itemRender(props, ref);
    }
    (props as any).ref = ref;
    return React.createElement(itemRender, props);
  }, [version, state.current, data, clicked, isDragging]);
}

export default React.memo(SortItem);
