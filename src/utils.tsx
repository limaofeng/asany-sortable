import React from 'react';
import { CSSProperties } from 'react';
import { DropTargetMonitor, XYCoord } from 'react-dnd';
import {
  ISortableItemInternalData,
  SortableLayout,
  SortableDirection,
  Relation,
  AnimatedProps,
  DragPreviewRenderer,
  SortableItemProps,
  SortableItemRefObject,
  SortableItemRender,
} from './typings';

export interface ICoord {
  _rect: DOMRect;
  top: number;
  height: number;
  left: number;
  width: number;
  direction: (
    { y, x, h, w }: { y: number; x: number; h: number; w: number },
    layout: SortableLayout,
    detection: SortableDirection
  ) => Relation;
  compare: (other: ICoord) => Relation;
}

function isRectangleOverlap(rec1: number[], rec2: number[]) {
  const x_overlap = !(rec1[2] <= rec2[0] || rec2[2] <= rec1[0]);
  const y_overlap = !(rec1[3] <= rec2[1] || rec2[3] <= rec1[1]);
  return x_overlap && y_overlap ? { x: x_overlap, y: y_overlap } : false;
}

function getRec(itemRect: DOMRect, layoutRect: DOMRect) {
  const x = itemRect.left - layoutRect.left;
  const y = itemRect.top - layoutRect.top;
  return [x, y, x + itemRect.width, y + itemRect.height];
}

export function getMonitorCoord(
  layout: React.RefObject<HTMLDivElement>,
  itemRect: DOMRect,
  sourceClientOffset: XYCoord
): ICoord {
  const layoutRect = layout.current!.getBoundingClientRect();
  const top = sourceClientOffset.y - layoutRect.top;
  const left = sourceClientOffset.x - layoutRect.left;
  const height = itemRect.height;
  const width = itemRect.width;
  return {
    _rect: layoutRect,
    top,
    height,
    left,
    width: itemRect.width,
    direction(
      { y, x, h, w }: { y: number; x: number; h: number; w: number },
      layout: SortableLayout,
      detection: SortableDirection
    ) {
      const currentRec = [left, top, left + width, top + height];
      let overlap = isRectangleOverlap(currentRec, [x, y, x + w, y + h]);
      if (!overlap) {
        return NaN;
      }
      const x1 = x + w / 2;
      const y1 = y + h / 2;
      const source = getRec(itemRect, layoutRect);
      const target = [x, y, x + w, y + h];
      if (layout === 'grid') {
        overlap = isRectangleOverlap(currentRec, [x1, y1, x1, y1]);
        if (!overlap) {
          return NaN;
        }
        if (source[3] <= target[1] || source[2] <= target[0]) {
          return 1;
        }
        return -1;
      } else if (detection === 'vertical' && (overlap as any).y) {
        const mx1 = left + width / 2;
        const my1 = top + height / 2;
        if (height > h) {
          overlap = isRectangleOverlap(currentRec, [x1, y1, x1, y1]);
        } else {
          overlap = isRectangleOverlap([mx1, my1, mx1, my1], target);
        }
        if (!(overlap as any).y) {
          return NaN;
        }
        return my1 - y1;
      } else if (detection === 'horizontal' && (overlap as any).x) {
        if (source[2] <= target[0]) {
          return 1;
        } else {
          return -1;
        }
      }
      return NaN;
    },
    compare: (_: ICoord): Relation => {
      throw new Error('未实现逻辑');
    },
  };
}

export function getItemCoord(layout: React.RefObject<HTMLDivElement>, item: ISortableItemInternalData) {
  const layoutRect = layout.current!.getBoundingClientRect();
  const itemRect = item._rect!;
  const top = itemRect.top - layoutRect.top;
  const left = itemRect.left - layoutRect.left;
  return {
    top,
    left,
    itemRect: itemRect.height,
    compare(other: ICoord, layout: SortableLayout, detection: SortableDirection): Relation {
      return other.direction({ y: top, x: left, h: itemRect.height, w: itemRect.width }, layout, detection);
    },
  };
}

const DEFAULT_RECT = {
  height: 0,
  width: 0,
  y: 0,
  x: 0,
  bottom: 0,
  right: 0,
  left: 0,
  top: 0,
  toJSON: () => {},
};

export function getInsertIndex(
  item: ISortableItemInternalData,
  monitor: DropTargetMonitor,
  items: ISortableItemInternalData[],
  ref: React.RefObject<HTMLDivElement>,
  layout: SortableLayout,
  direction: SortableDirection
) {
  let clientOffset = monitor.getSourceClientOffset() as XYCoord;
  if (!clientOffset) {
    return -1;
  }

  let moveItem = getMonitorCoord(ref, item._rect || DEFAULT_RECT, clientOffset);
  let addition = 0;
  const index = items.findIndex((data) => {
    const coord = getItemCoord(ref, data);
    const relation = coord.compare(moveItem, layout, direction);
    if (isNaN(relation)) {
      return false;
    }
    if (relation > 0) {
      addition = 1;
    }
    return true;
  });
  return index + addition;
}

export function findInnerIndex(id: string, items: ISortableItemInternalData[]) {
  return items.findIndex((data) => data.id === id);
}

export const injectAnime = (props: any): AnimatedProps => {
  const key: string[] = [];
  const anime = Object.keys(props)
    .filter((key) => key.startsWith('data-flip'))
    .reduce((data, name) => {
      data[name] = props[name];
      key.push(props[name]);
      return data;
    }, {} as any);
  anime.key = key.join(',');
  return anime;
};

export function snapToGrid(x: number, y: number): [number, number] {
  const snappedX = Math.round(x / 32) * 32;
  const snappedY = Math.round(y / 32) * 32;
  return [snappedX, snappedY];
}

export function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  isSnapToGrid: boolean,
  direction?: false | SortableDirection
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;

  if (isSnapToGrid) {
    x -= initialOffset.x;
    y -= initialOffset.y;
    [x, y] = snapToGrid(x, y);
    x += initialOffset.x;
    y += initialOffset.y;
  }

  if (direction === 'vertical') {
    x = initialOffset.x;
  }

  if (direction === 'horizontal') {
    y = initialOffset.y;
  }

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export function getScaleItemStyles(style: CSSProperties, scale: number, offset: [number, number] = [0, 0]) {
  if (scale >= 1) {
    return {
      transform: `scale(${scale})`,
      width: style.width,
      height: style.height,
    };
  }
  const width = (style.width as number) * (1 / scale);
  const height = (style.height as number) * (1 / scale);
  const x = -(((width as number) * (1 - scale)) / 2) + offset[0];
  const y = -(((height as number) * (1 - scale)) / 2) + offset[1];
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    width: width,
    height: height,
  };
}

export function renderItem(
  itemRender: SortableItemRender<any>,
  props: SortableItemProps<any>,
  ref?: SortableItemRefObject
) {
  if (React.isValidElement(itemRender)) {
    return React.cloneElement(itemRender, { ...props, ref } as any);
  }
  if (typeof itemRender === 'function') {
    return itemRender(props, ref);
  }
  (props as any).ref = ref;
  return React.createElement(itemRender, props);
}

export function dragPreview(
  itemRender: SortableItemRender<any>,
  options: { props?: any; offset?: [number, number]; scale?: number | (() => number) } = {}
): DragPreviewRenderer {
  return (data, { style }) => {
    const props = { data, drag: () => undefined, ...options } as any;
    if (!!options?.scale) {
      return (
        <div className="sortable-drag-preview" style={style}>
          <div
            className="sortable-drag-preview-container"
            style={getScaleItemStyles(
              style,
              typeof options.scale == 'function' ? options.scale() : options.scale,
              options.offset
            )}
          >
            {renderItem(itemRender, props)}
          </div>
        </div>
      );
    }
    return <div style={style}>{renderItem(itemRender, props)}</div>;
  };
}
