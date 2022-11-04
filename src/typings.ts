import { EventEmitter } from 'events';
import { CSSProperties, FunctionComponent, PropsWithoutRef, MutableRefObject, RefAttributes, ReactNode } from 'react';
import { ConnectDragSource, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';

export type SortableDirection = 'horizontal' | 'vertical';

export type SortableLayout = 'list' | 'grid';

export type SortableDispatchEvent = (type: SortableEventType, payload?: any) => void;

export type SortableTag = 'ul' | 'div' | FunctionComponent<any> | React.ReactElement;

export enum SortableEventType {
  CHANGE = 'change',
  RESET = 'reset',
  DROP = 'drop',
  BUILD_REF = 'build_ref',
  UNBUILD_REF = 'unbuild_ref',
  OVER = 'OVER',
  DRAGGING = 'DRAGGING',
}

export const DEFAULT_ITEM_TYPE = 'sortable-card';

export const EVENT_ITEMRENDER_RERENDER = 'ITEMRENDER_RERENDER';

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
  /**
   * 更新
   */
  UPDATE = 'update',
}

export interface DragObjectWithType {}

export interface ISortableItem extends DragObjectWithType {
  id: string;
  /**
   * 类型
   */
  type?: string;
  /**
   * 可排序
   */
  sortable?: boolean;
  /**
   * 可删除
   */
  deleteable?: boolean;
}

export interface ISortableItemInternalData extends ISortableItem {
  index?: number;
  pos?: number[];
  _originalSortable: string;
  _sortable?: string;
  _registered?: string;
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
  // 自定拖拽预览
  UPDATE_PREVIEW = 'UPDATE_PREVIEW',
  // 更新状态
  update = 'update',
  // 移动
  move = 'move',
  // 移入
  moveIn = 'moveIn',
  // 移出
  moveOut = 'moveOut',
  // 删除
  remove = 'remove',
  // 重置数据
  reset = 'reset',
  // 拖拽开始
  dragging = 'dragging',
  // 结束
  drop = 'drop',
  // Flipper 动画使用
  moving = 'moving',
  // 设置可以看见的元素
  observed = 'observed',
  // 指示器
  indicator = 'indicator',
  // 更新 POS
  UPDATE_POS = 'UPDATE_POS',
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

export type AnimatedProps = {
  key: string;
  ['data-flip-config']: string;
  ['data-flip-id']: string;
  [key: string]: string;
};

export interface SortableItemProps<T extends ISortableItem = ISortableItem & { [key: string]: any }> {
  dragging: boolean;
  indicator: number;
  level: number;
  index: number;
  data: T;
  animated: AnimatedProps;
  remove: () => void;
  update: (data: T & { [key: string]: any }) => void;
  className?: string;
  style?: CSSProperties;
  drag: ConnectDragSource;
}

export type SortableItemRefObject =
  | RefAttributes<HTMLElement | unknown>
  | MutableRefObject<HTMLElement | unknown | null>
  | ((instance: HTMLElement | null) => void)
  | any;

type SortableItemContentRenderFunc<T extends ISortableItem> = (
  props: SortableItemProps<T>,
  ref: SortableItemRefObject
) => React.ReactElement;

type SortableItemContentRender<T extends ISortableItem> =
  | React.ForwardRefExoticComponent<PropsWithoutRef<SortableItemProps<T>> & SortableItemRefObject>
  | SortableItemContentRenderFunc<T>;

export type SortableItemRender<T extends ISortableItem> =
  | SortableItemContentRender<T>
  | React.ReactElement<SortableItemProps<T>>
  | SortableItemContentRenderFunc<T>;

export interface SortLog {
  source: string;
  sourceIndex: number;
  target: string;
  targetIndex: number;
}

export interface ISortableState {
  id: string;
  pos: number[];
  dragging?: ISortableItemInternalData;
  backup: ISortableItemInternalData[];
  preview: boolean;
  items: ISortableItemInternalData[];
  activeIds: string[];
  logs: SortLog[];
  emitter: EventEmitter;
  moving: boolean;
  accept: string[];
  io: IntersectionObserver;
}

export type Relation = number; // = 'before' | 'after' | 'none';

export type DragCondition = boolean | ((data: ISortableItem, monitor: DragSourceMonitor<ISortableItem>) => boolean);

export type DropCondition = () => boolean;

export type Mode = 'wysiwyg' | 'indicator';

export type AllowDropInfo = { node: any; dragNode: any; dropPosition: number };

export type AllowDropFunc = (info: AllowDropInfo) => boolean;

export type OnDrop = (e: { node: any; dragNode: any; dropPosition: number }) => void;

export type DragPreviewRenderer = (
  data: ISortableItem & {
    [key: string]: any;
  },
  options: {
    style: CSSProperties;
    sortableId: string;
    type: string;
    rect: DOMRect;
  }
) => ReactNode;

export type DragPreviewOptions =
  | DragPreviewRenderer
  | {
      render: DragPreviewRenderer;
      axisLocked?: boolean;
      offset?: [number, number];
      snapToGrid?: boolean;
      container?: Element | DocumentFragment;
    };

export interface SortableProps<T extends ISortableItem = any> {
  mode?: Mode;
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
  children?: React.ReactNode[];
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

  items?: T[];

  itemRender?: SortableItemRender<T>;
  /**
   * 父组件刷新时 itemRender 是否重新渲染
   * 默认: true
   */
  rerender?: boolean;
  /**
   * 元素移入
   * @experimental
   */
  onDragover?: (item: T) => void;
  /**
   * 元素移出
   * @experimental
   */
  onDragout?: (item: T) => void;
  /**
   * 是否允许拖拽时放置在该节点
   */
  allowDrop?: AllowDropFunc;
  /**
   * 是否可以拖拽
   */
  draggable?: DragCondition;

  style?: CSSProperties;
  /**
   * 位置, 用于嵌套定位
   */
  pos?: number[];
  /**
   * 放置元素
   */
  onDrop?: OnDrop;
  /**
   * 自定义预览
   */
  preview?: DragPreviewOptions;
}
