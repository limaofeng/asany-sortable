import classnames from 'classnames';
import { Flipped, Flipper } from 'react-flip-toolkit';
import React, { CSSProperties, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { isForwardRef } from 'react-is';

import { ItemTypes } from './ItemTypes';
import SortableContainer from './SortableContainer';
import useSortableSelector, { SortableProvider, useEventManager, useSortableDispatch } from './SortableProvider';
import SortItem, { SortItemProps } from './SortItem';
import {
  ISortableItem,
  ISortableItemInternalData,
  SortableActionType,
  SortableChange,
  SortableChangeEvent,
  SortableChangeEventType,
  SortableDropEvent,
  SortableItemContentRender,
  SortableItemContentRenderFunc,
  SortableDirection,
  SortableLayout,
  SortableMoveInEvent,
  SortableMoveOutEvent,
  SortableRemoveEvent,
  SortableTag,
  SortableProps,
} from './typings';

function buildItems(items: ISortableItem[] | undefined, children: React.ReactNodeArray | undefined) {
  if (items) {
    return items;
  }
  const retItems: ISortableItem[] = [];
  const nodes = React.Children.toArray(children) as React.ReactElement<SortItemProps>[];
  for (let i = 0; i < nodes.length; i += 1) {
    const props = nodes[i].props;
    retItems.push({ ...props.data });
  }
  return retItems;
}

function buildItemRender(
  itemRender: SortableItemContentRender | SortableItemContentRenderFunc | undefined,
  children: React.ReactNodeArray | undefined
): SortableItemContentRender {
  if (!itemRender && (!children || !React.Children.count(children))) {
    throw 'Sortable 的 itemRender 及 children 不能同时为 NULL';
  }
  if (!!itemRender) {
    if (isForwardRef(React.createElement(itemRender))) {
      return itemRender as SortableItemContentRender;
    }
    return React.forwardRef((props, ref) => itemRender(props, ref));
  }
  const nodes = React.Children.toArray(children) as React.ReactElement<SortItemProps>[];
  const tempNode = nodes[0];
  return React.forwardRef((props, ref) => React.cloneElement(tempNode, { ...props, ref } as any));
}

const defaultAccept = [ItemTypes.CARD];

function Sortable(
  props: SortableProps,
  ref: MutableRefObject<HTMLElement | null> | ((instance: HTMLElement | null) => void) | null
) {
  const {
    droppable = false,
    onChange,
    onClick,
    tag = 'div',
    className,
    layout = 'list',
    children,
    accept = defaultAccept,
    items: propsItems,
    itemRender,
    style,
  } = props;
  const { direction = layout == 'grid' ? 'horizontal' : 'vertical' } = props;
  const items = buildItems(propsItems, children);
  const [innerItemRender] = useState<SortableItemContentRender>(buildItemRender(itemRender, children));

  return (
    <SortableProvider items={items} deps={[layout, direction, className]}>
      <SortableCore
        droppable={droppable}
        tag={tag}
        ref={ref}
        onClick={onClick}
        className={classnames('sortable-container', `sortable-${layout}-${direction}`, className)}
        style={style}
        accept={accept}
        onChange={onChange}
        itemRender={innerItemRender}
        direction={direction}
        layout={layout}
      />
    </SortableProvider>
  );
}

interface SortableCoreProps {
  itemRender: SortableItemContentRender;
  droppable: boolean;
  direction: SortableDirection;
  layout: SortableLayout;
  accept: string[];
  tag: SortableTag;
  className?: string;
  style?: CSSProperties;
  onChange?: SortableChange;
  onClick?: (e: React.MouseEvent) => void;
}

const SortableCore = React.forwardRef(function (
  { itemRender, onChange, ...props }: SortableCoreProps,
  ref: MutableRefObject<HTMLElement | null> | ((instance: HTMLElement | null) => void) | null
) {
  const items = useSortableSelector((state) => state.items);
  const id = useSortableSelector((state) => state.id);

  const temp = useRef({ id, items });

  const events = useEventManager();
  const dispatch = useSortableDispatch();

  temp.current.id = id;
  temp.current.items = items;

  const handleChange = useCallback((event: SortableChangeEvent) => {
    const { items } = temp.current;
    if (!onChange) {
      return;
    }
    onChange(
      items.map(({ _originalSortable, _sortable, _rect, ...item }) => item),
      event
    );
  }, []);

  const handleMoveOut = useCallback((event: SortableMoveOutEvent) => {
    const { id } = temp.current;
    const { item } = event;
    if (item._sortable != id) {
      return;
    }
    item._sortable = item._originalSortable;
    dispatch({ type: SortableActionType.remove, payload: item });
  }, []);

  const handleRemove = useCallback((event: SortableRemoveEvent) => {
    const { id } = temp.current;
    const { item } = event;
    if (item._originalSortable == id) {
      dispatch({ type: SortableActionType.remove, payload: item });
      handleChange({ ...event, type: SortableChangeEventType.REMOVE });
    }
    if (item._sortable == id && item._originalSortable !== item._sortable) {
      handleReset();
    }
  }, []);

  const handleMoveIn = useCallback((event: SortableMoveInEvent) => {
    const { id } = temp.current;
    const { source, target } = event;
    if (source == id) {
      dispatch({ type: SortableActionType.remove, payload: event.item });
    } else if (target == id) {
      event.item._sortable = id;
      // console.log('isOverCurrent handleMoveIn', id, event);
      dispatch({
        type: SortableActionType.moveIn,
        payload: {
          index: event.insertIndex,
          item: event.item,
        },
      });
    }
  }, []);

  const handleDrop = useCallback((event: SortableDropEvent) => {
    const { id } = temp.current;
    const { source, target } = event;
    if (source == target && source == id) {
      handleChange({ ...event, type: SortableChangeEventType.SORT });
    } else if (source == id) {
      handleChange({ ...event, type: SortableChangeEventType.DRAG });
    } else if (target == id) {
      handleChange({ ...event, type: SortableChangeEventType.DROP });
    }
    dispatch({ type: SortableActionType.drop });
  }, []);

  const handleDragging = useCallback((data: ISortableItemInternalData) => {
    dispatch({ type: SortableActionType.dragging, payload: data });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: SortableActionType.reset });
  }, []);

  useEffect(() => {
    events.on(SortableActionType.drop, handleDrop);
    events.on(SortableActionType.reset, handleReset);
    events.on(SortableActionType.remove, handleRemove);
    events.on(SortableActionType.moveIn, handleMoveIn);
    events.on(SortableActionType.moveOut, handleMoveOut);
    events.on(SortableActionType.dragging, handleDragging);
    return () => {
      events.off(SortableActionType.drop, handleDrop);
      events.off(SortableActionType.reset, handleReset);
      events.off(SortableActionType.remove, handleRemove);
      events.off(SortableActionType.moveIn, handleMoveIn);
      events.off(SortableActionType.moveOut, handleMoveOut);
      events.off(SortableActionType.dragging, handleDragging);
    };
  }, []);

  const handleStart = useCallback(() => {
    dispatch({ type: SortableActionType.moving, payload: true });
  }, []);

  const handleComplete = useCallback(() => {
    dispatch({ type: SortableActionType.moving, payload: false });
  }, []);

  return (
    <SortableContainer {...props} ref={ref}>
      <Flipper
        className="sortable-flipper"
        spring={{ stiffness: 987, damping: 63 }}
        onStart={handleStart}
        onComplete={handleComplete}
        flipKey={items.map((item) => item.id).join(',')}
      >
        {items.map((item) => (
          <Flipped key={item.id} flipId={item.id}>
            <SortItem key={item.id} itemRender={itemRender} data={item} />
          </Flipped>
        ))}
      </Flipper>
    </SortableContainer>
  );
});

export default React.forwardRef(Sortable);
