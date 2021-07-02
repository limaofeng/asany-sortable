import classnames from 'classnames';
import React, { CSSProperties } from 'react';

import { useSortItem } from './hooks';
import { ISortableItem, SortableItemContentRender } from './typings';

export interface SortItemProps {
  data: ISortableItem;
  className?: string;
  style?: CSSProperties;
  itemRender: SortableItemContentRender;
}

function SortItem({
  data,
  itemRender: ItemRender,
  className,
  style,
  ...props
}: SortItemProps) {
  const [
    { style: additionStyle, className: additionClassName, remove, update },
    ref,
    drag,
  ] = useSortItem(data);
  return (
    <ItemRender
      {...props}
      style={{ ...style, ...additionStyle }}
      className={classnames(className, additionClassName)}
      data={data}
      remove={remove}
      update={update}
      drag={drag}
      ref={ref}
    />
  );
}

export default React.memo(SortItem);
