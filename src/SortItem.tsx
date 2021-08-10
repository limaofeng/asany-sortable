import classnames from 'classnames';
import React, { CSSProperties, useEffect, useReducer, useState } from 'react';

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
  const [{ style: additionStyle, className: additionClassName, remove, update }, ref, drag] = useSortItem(
    data.type,
    data,
    {
      sortable: data.sortable,
      dragCondition,
    }
  );
  const [state, setState] = useState({
    animated: injectAnime(props),
    style: { ...style, ...additionStyle },
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
    setState({ animated, style: styleMerged, className: classnames(className, additionClassName) });
  }, [animatedKey, styleMergedKey, className, additionClassName]);

  useEffect(() => {
    const el = ref.current!;
    el.dataset['id'] = data.id;
    io.observe(el);
    // events.on(EVENT_ITEMRENDER_RERENDER, forceRender);
    return () => {
      io.unobserve(el);
      // events.off(EVENT_ITEMRENDER_RERENDER, forceRender);
    };
  }, [io]);

  return React.useMemo(() => {
    const props = {
      animated: state.animated,
      className: state.className,
      style: state.style,
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
  }, [version, state, data /*remove, update, drag, ref*/]);
}

export default React.memo(SortItem);
