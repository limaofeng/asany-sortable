import './style/index.less';

import classnames from 'classnames';
import React, { CSSProperties, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';

import SortableContainer from './SortableContainer';
import useSortableSelector, { SortableProvider, useEventManager, useSortableDispatch } from './SortableProvider';
import SortItem, { SortItemProps } from './SortItem';
import {
  DEFAULT_ITEM_TYPE,
  DragCondition,
  ISortableItem,
  ISortableItemInternalData,
  SortableActionType,
  SortableChange,
  SortableChangeEvent,
  SortableChangeEventType,
  SortableDirection,
  SortableDropEvent,
  SortableItemContentRender,
  SortableItemContentRenderFunc,
  SortableLayout,
  SortableMoveInEvent,
  SortableMoveOutEvent,
  SortableProps,
  SortableRemoveEvent,
  SortableTag,
  Mode,
  AllowDropFunc,
  DragPreviewRenderer,
} from './typings';
import { OnDrop } from '.';
import SortableDragLayer from './SortableDragLayer';

function buildItems(items: ISortableItem[] | undefined, children: React.ReactNodeArray | undefined) {
  if (items) {
    return items;
  }
  const retItems: ISortableItem[] = [];
  const nodes = React.Children.toArray(children) as React.ReactElement<SortItemProps<any>>[];
  for (let i = 0; i < nodes.length; i += 1) {
    const props = nodes[i].props;
    retItems.push({ ...props.data });
  }
  return retItems;
}

function buildItemRender<T extends ISortableItem>(
  itemRender: SortableItemContentRender<T> | SortableItemContentRenderFunc<T> | undefined,
  children: React.ReactNodeArray | undefined
): SortableItemContentRender<T> {
  if (!itemRender && (!children || !React.Children.count(children))) {
    throw 'Sortable 的 itemRender 及 children 不能同时为 NULL';
  }
  if (!!itemRender) {
    return itemRender;
  }
  const nodes = React.Children.toArray(children) as React.ReactElement<SortItemProps<T>>[];
  const tempNode = nodes[0];
  return (props, ref) => React.cloneElement(tempNode, { ...props, ref } as any);
}

const defaultAccept = [DEFAULT_ITEM_TYPE];

function Sortable<T extends ISortableItem>(
  props: SortableProps<T>,
  ref: MutableRefObject<HTMLElement | null> | ((instance: HTMLElement | null) => void) | null
) {
  const {
    onChange,
    pos = [],
    mode = 'wysiwyg',
    tag = 'div',
    onDrop,
    draggable = true,
    allowDrop,
    className,
    layout = 'list',
    children,
    empty,
    accept = defaultAccept,
    items: propsItems,
    itemRender,
    rerender = typeof itemRender === 'function',
    style,
    preview,
  } = props;
  const { direction = layout == 'grid' ? 'horizontal' : 'vertical' } = props;
  const items = buildItems(propsItems, children);
  const [innerItemRender] = useState<SortableItemContentRender<T>>(() => buildItemRender<T>(itemRender, children));

  return (
    <SortableProvider
      preview={!!preview}
      rerender={rerender}
      items={items}
      pos={pos}
      deps={[layout, allowDrop, tag, direction, className, draggable]}
    >
      <SortableCore
        tag={tag}
        ref={ref}
        empty={empty}
        mode={mode}
        className={classnames('sortable-container', `sortable-${layout}-${direction}`, className)}
        style={style}
        accept={accept}
        draggable={draggable}
        onDrop={onDrop}
        allowDrop={allowDrop}
        onChange={onChange}
        itemRender={innerItemRender as any}
        direction={direction}
        layout={layout}
        preview={preview}
      />
    </SortableProvider>
  );
}

interface SortableCoreProps<T extends ISortableItem> {
  itemRender: SortableItemContentRender<T>;
  direction: SortableDirection;
  layout: SortableLayout;
  accept: string[];
  mode: Mode;
  tag: SortableTag;
  className?: string;
  style?: CSSProperties;
  onDrop?: OnDrop;
  empty?: React.ReactNode;
  allowDrop?: AllowDropFunc;
  draggable: DragCondition;
  onChange?: SortableChange;
  onClick?: (e: React.MouseEvent) => void;
  preview?: DragPreviewRenderer;
}

const SortableCore = React.forwardRef(function <T extends ISortableItem>(
  { empty, itemRender, onChange, draggable, preview, ...props }: SortableCoreProps<T>,
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
    let { items } = temp.current;
    if (!onChange) {
      return;
    }
    if (event.type == 'remove') {
      items = items.filter((item) => item.id != event.item.id);
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
    dispatch({ type: SortableActionType.moveOut, payload: item });
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
      dispatch({ type: SortableActionType.moveOut, payload: event.item });
    } else if (target == id) {
      event.item._sortable = id;
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
    } else if (source == id && target) {
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

  const handleUpdate = useCallback((data: { item: ISortableItemInternalData }) => {
    const { items } = temp.current;
    if (!items.some((item) => item.id == data.item.id)) {
      return;
    }
    handleChange({ item: data.item, type: SortableChangeEventType.UPDATE });
  }, []);

  useEffect(() => {
    events.on(SortableActionType.drop, handleDrop);
    events.on(SortableActionType.reset, handleReset);
    events.on(SortableActionType.remove, handleRemove);
    events.on(SortableActionType.moveIn, handleMoveIn);
    events.on(SortableActionType.moveOut, handleMoveOut);
    events.on(SortableActionType.dragging, handleDragging);
    events.on(SortableActionType.update, handleUpdate);
    return () => {
      events.off(SortableActionType.drop, handleDrop);
      events.off(SortableActionType.reset, handleReset);
      events.off(SortableActionType.remove, handleRemove);
      events.off(SortableActionType.moveIn, handleMoveIn);
      events.off(SortableActionType.moveOut, handleMoveOut);
      events.off(SortableActionType.dragging, handleDragging);
      events.off(SortableActionType.update, handleUpdate);
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
        {items.map((item, index) => (
          <Flipped key={item.id} flipId={item.id}>
            <SortItem
              index={index}
              key={item.id}
              draggable={draggable}
              preview={!!preview}
              itemRender={itemRender as any}
              data={item}
            />
          </Flipped>
        ))}
        {!items.length && empty}
      </Flipper>
      {preview && <SortableDragLayer snapToGrid={false} render={preview} />}
    </SortableContainer>
  );
});

export default React.forwardRef(Sortable);
