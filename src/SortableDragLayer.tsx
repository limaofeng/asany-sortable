import type { CSSProperties, FC } from 'react';
import React from 'react';
import { useDragLayer } from 'react-dnd';
import ReactDOM from 'react-dom';
import useSortableSelector from './SortableProvider';
import { DragPreviewRenderer, SortableDirection, SortableLayout } from './typings';
import { getItemStyles } from './utils';

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 10000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

export interface CustomDragLayerProps {
  snapToGrid?: boolean;
  axisLocked?: boolean;
  render: DragPreviewRenderer;
  container?: Element | DocumentFragment;
  direction: SortableDirection;
  layout: SortableLayout;
}

const SortableDragLayer: FC<CustomDragLayerProps> = (props) => {
  const sortableId = useSortableSelector((state) => state.id);

  const { isDragging, item, itemType, initialOffset, rect, currentOffset } = useDragLayer((monitor) => ({
    rect: monitor.getItem()?._rect as DOMRect,
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging() && sortableId == monitor.getItem()?._sortable,
  }));

  if (!isDragging) {
    return null;
  }

  const dragLayer = (
    <div style={layerStyles}>
      {props.render(item, {
        style: {
          ...getItemStyles(
            initialOffset,
            currentOffset,
            !!props.snapToGrid,
            props.layout == 'list' && props.axisLocked && props.direction
          ),
          width: rect?.width,
          height: rect?.height,
        },
        type: itemType as string,
        sortableId,
        rect: rect,
      })}
    </div>
  );

  if (props.container) {
    return ReactDOM.createPortal(dragLayer, props.container);
  }

  return dragLayer;
};

export default SortableDragLayer;
