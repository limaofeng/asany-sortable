import classnames from 'classnames';
import React, { CSSProperties } from 'react';

import { useSortItem } from './hooks';
import { injectAnime } from './Sortable';
import { ISortableItem, SortableItemContentRender } from './typings';

export interface SortItemProps {
  data: ISortableItem;
  className?: string;
  style?: CSSProperties;
  itemRender: SortableItemContentRender;
}

function SortItem({ data, itemRender: ItemRender, className, style, ...props }: SortItemProps) {
  const [{ style: additionStyle, className: additionClassName, remove, update }, ref, drag] = useSortItem(data);
  const animated = injectAnime(props);
  const animatedKey = Object.keys(animated)
    .map((key) => animated[key])
    .join(',');
  return React.useMemo(
    () => (
      <ItemRender
        animated={animated}
        className={classnames(className, additionClassName)}
        style={{ ...style, ...additionStyle }}
        data={data}
        remove={remove}
        update={update}
        drag={drag}
        ref={ref}
      />
    ),
    [animatedKey, className, additionClassName, data, remove, update, drag, ref, style, additionStyle]
  );
}

export default React.memo(SortItem);
