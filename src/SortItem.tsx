import classnames from 'classnames';
import React, { CSSProperties } from 'react';

import { useSortItem } from './hooks';
import { injectAnime } from './Sortable';
import { DragCondition, ISortableItem, SortableItemContentRender } from './typings';

export interface SortItemProps {
  data: ISortableItem;
  className?: string;
  style?: CSSProperties;
  dragCondition?: DragCondition;
  itemRender: SortableItemContentRender;
}

function SortItem({ data, itemRender, dragCondition, className, style, ...props }: SortItemProps) {
  const [{ style: additionStyle, className: additionClassName, remove, update }, ref, drag] = useSortItem(
    data.type,
    data,
    {
      sortable: data.sortable,
      dragCondition,
    }
  );
  const animated = injectAnime(props);
  const animatedKey = Object.keys(animated)
    .map((key) => animated[key])
    .join(',');
  return React.useMemo(() => {
    const props = {
      animated,
      className: classnames(className, additionClassName),
      style: { ...style, ...additionStyle },
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
  }, [animatedKey, className, additionClassName, data, remove, update, drag, ref, style, additionStyle]);
}

export default React.memo(SortItem);
