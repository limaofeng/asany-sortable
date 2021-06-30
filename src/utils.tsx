import { DropTargetMonitor, XYCoord } from 'react-dnd';
import { ISortableItemInternalData, SortableLayout, SortableDirection, Relation } from './typings';

export interface ICoord {
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
      if (!isRectangleOverlap(currentRec, [x, y, x + w, y + h])) {
        return 'none';
      }
      if (layout == 'grid') {
        const x1 = x + w / 2;
        const y1 = y + h / 2;
        const source = getRec(itemRect, layoutRect);
        const target = [x, y, x + w, y + h];
        const overlap = isRectangleOverlap(currentRec, [x1, y1, x1, y1]);
        if (!overlap) {
          return 'none';
        }
        if (source[3] < target[1] || source[2] < target[0]) {
          return 'after';
        }
        return 'before';
      } else {
        if (detection === 'vertical') {
          const bottom = top + height;
          const midline = y + h / 2;
          const isBefore = (bottom < midline && bottom > y) || (top < midline && top > y);
          const isAfter = (bottom > midline && bottom < y + h) || (top > midline && top < y + h);

          if (top < 0) {
            return 'before';
          }
          if (isBefore) {
            return 'before';
          }
          if (isAfter) {
            // console.log('交换 -- direction', top, bottom, y, midline, y + h);
            return 'after';
          }
          return 'none';
        } else {
          const right = left + width;
          const midline = x + w / 2;

          const isBefore = (right < midline && right > x) || (left < midline && left > x);
          const isAfter = (right > midline && right < x + w) || (left > midline && left < x + w);

          if (left < 0) {
            return 'before';
          }
          if (isBefore) {
            return 'before';
          }
          if (isAfter) {
            return 'after';
          }
        }
        return 'none';
      }
    },
    compare: (_: ICoord): Relation => {
      throw '未实现逻辑';
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
    if (relation === 'none') {
      return false;
    }
    if (relation === 'after') {
      addition = 1;
    }
    return true;
  });
  return index + addition;
}

export function findInnerIndex(id: string, items: ISortableItemInternalData[]) {
  return items.findIndex((data) => data.id == id);
}
