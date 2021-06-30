import { EventEmitter } from 'events';
import { CSSProperties, FunctionComponent, MutableRefObject, RefCallback, RefObject } from 'react';
import { DropTargetMonitor } from 'react-dnd';

export type SortableDirection = 'horizontal' | 'vertical';

export type SortableLayout = 'list' | 'grid';

export type SortableDispatchEvent = (type: SortableEventType, payload?: any) => void;

export type SortableTag = 'ul' | 'div' | FunctionComponent<any>;

export enum SortableEventType {
  CHANGE = 'change',
  RESET = 'reset',
  DROP = 'drop',
  BUILD_REF = 'build_ref',
  UNBUILD_REF = 'unbuild_ref',
  OVER = 'OVER',
  DRAGGING = 'DRAGGING',
}

export enum SortableChangeEventType {
  /**
   * 移入
   */
  DROP = 'drop',
  /**
   * 删除
   */
  REMOVE = 'remove',
  /**
   * 排序
   */
  SORT = 'sort',
  /**
   * 移出
   */
  DRAG = 'drag',
}

export interface DragObjectWithType {
}

export interface ISortableItem extends DragObjectWithType {
  id: string;
  type: string;
  deleteable?: boolean;
}

export interface ISortableItemInternalData extends ISortableItem {
  _originalSortable: string;
  _sortable?: string;
  _rect?: DOMRect;
}

export type SortableChangeEvent = {
  type: SortableChangeEventType;
  item: ISortableItem;
};

export type SortableDropResult = {
  id: string;
  sortable: string;
};

export interface SortableDropCollectedProps {
  item: ISortableItemInternalData;
  isOver: boolean;
  canDrop: boolean;
  isOverCurrent: boolean;
  monitor: DropTargetMonitor;
}

export interface SortableMoveOutEvent {
  item: ISortableItemInternalData;
}

export interface SortableRemoveEvent {
  item: ISortableItemInternalData;
}

export interface SortableMoveInEvent {
  /**
   * 插入到 target 中的位置
   */
  insertIndex: number;
  /**
   * 拖入数据
   */
  item: ISortableItemInternalData;
  /**
   * 移入的 sortable 对象 ID
   */
  target: string;
  /**
   * 原 sortable 对象 ID
   */
  source: string;
}

export interface SortableResetEvent {
  /**
   * 拖入数据
   */
  item: ISortableItemInternalData;
  /**
   * 移入的 sortable 对象 ID
   */
  target: string;
  /**
   * 原 sortable 对象 ID
   */
  source: string;
}

export interface SortableDropEvent {
  /**
   * 拖入数据
   */
  item: ISortableItemInternalData;
  /**
   * 移入的 sortable 对象 ID
   */
  target: string;
  /**
   * 原 sortable 对象 ID
   */
  source: string;
}

export enum SortableActionType {
  init = 'init',
  register = 'register',
  UPDATE_ID = 'UPDATE_ID',
  drop = 'drop',
  move = 'move',
  moveIn = 'moveIn',
  moveOut = 'moveOut',
  remove = 'remove',
  reset = 'reset',
  dragging = 'dragging',
  moving = 'moving',
}

export interface SortableAction {
  type: SortableActionType;
  payload?: any;
}

export type SortableUnsubscribeFunc = () => void;

export type SortableSubscribeCallback = () => void;

export type SortableDispatchWithoutAction = (action: SortableAction) => void;

export type SortableSubscribeFunc = (callback: SortableSubscribeCallback) => SortableUnsubscribeFunc;

export interface ISortableContext {
  eventEmitter: EventEmitter;
  getState(): ISortableState;
  subscribe: SortableSubscribeFunc;
  dispatch: SortableDispatchWithoutAction;
}

export type SortableChange = (value: ISortableItem[], event: SortableChangeEvent) => void;

export interface SortableItemProps<T extends ISortableItem = ISortableItem> {
  data: T;
  remove: () => void;
  update: (data: T & { [key: string]: any }) => void;
  className?: string;
  style?: CSSProperties;
  drag: (ref: RefObject<any>) => RefCallback<any>;
}

export type SortableItemContentRenderFunc = (
  props: SortableItemProps,
  ref: MutableRefObject<HTMLElement | null> | ((instance: HTMLElement | null) => void) | null
) => React.ReactElement;

export type SortableItemContentRender = React.ForwardRefExoticComponent<
  SortableItemProps & React.RefAttributes<HTMLElement>
>;

export interface SortLog {
  source: string;
  sourceIndex: number;
  target: string;
  targetIndex: number;
}

export interface ISortableState {
  id: string;
  dragging?: ISortableItemInternalData;
  backup: ISortableItemInternalData[];
  items: ISortableItemInternalData[];
  logs: SortLog[];
  emitter: EventEmitter;
  moving: boolean;
  accept: string[];
}

export type Relation = 'before' | 'after' | 'none';

export interface SortableProps {
  /**
   * 支持拖入 React-Dnd 的 type
   */
  droppable?: boolean;
  /**
   * 方向
   */
  direction?: SortableDirection;
  /**
   * 布局
   */
  layout?: SortableLayout;
  /**
   * React-Dnd Drop 的 accept 默认为 sortable-card
   */
  accept?: string[];
  /**
   * Sortable 组件渲染的标签， 默认为： Div
   */
  tag?: SortableTag;
  /**
   * 子元素
   */
  children?: React.ReactNodeArray;
  /**
   * CSS ClassName
   */
  className?: string;
  /**
   * 没有数据时的， 默认显示组件
   */
  empty?: React.ReactElement;
  /**
   * 排序改变时触发，drop 及 remove 也会触发该函数
   */
  onChange: SortableChange;

  items?: ISortableItem[];

  itemRender?: SortableItemContentRender | SortableItemContentRenderFunc;

  onClick?: (e: React.MouseEvent) => void;
  /**
   * 元素移入
   * @experimental
   */
  onDragover?: (item: ISortableItem) => void;
  /**
   * 元素移出
   * @experimental
   */
  onDragout?: (item: ISortableItem) => void;

  style?: CSSProperties;
}