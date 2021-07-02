import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { EventEmitter } from 'events';
import update from 'immutability-helper';
import {
  ISortableContext,
  ISortableItem,
  ISortableState,
  SortableAction,
  SortableActionType,
  SortableSubscribeCallback,
} from './typings';
import { assign, generateUUID, useDeepCompareEffect } from './utils/index';
import { isEqual } from 'lodash';

export const SortableStoreContext = React.createContext<ISortableContext>({
  getState: () => ({}),
  subscribe: () => {},
} as any);

interface SortableProviderProps {
  items: ISortableItem[];
  deps: ReadonlyArray<any>;
  children: React.ReactNode;
}

export const useSortableState = () => {
  return useSortableStore().getState();
};

export const useEventManager = () => {
  return useSortableStore().eventEmitter;
};

export const useSortableDispatch = () => {
  return useSortableStore().dispatch;
};

export type Selector<Selected> = (state: ISortableState) => Selected;
export type EqualityFn<Selected> = (
  theNew: Selected,
  latest: Selected
) => boolean;

const defaultEqualityFn = (a: any, b: any) => a === b;

/**
 * 模仿 Redux 的 useSortableSelector
 * @param selector
 * @param equalityFn
 */
export default function useSortableSelector<Selected>(
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const store = useSortableStore();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<Selected>();
  const selectedState = selector(store.getState());
  function checkForUpdates() {
    const newSelectedState = selector(store.getState());
    if (equalityFn(newSelectedState, latestSelectedState.current!)) {
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
  }
  useEffect(() => {
    const unsubscribe = store.subscribe(checkForUpdates);
    return unsubscribe;
  }, []);

  return selectedState;
}

export const useSortableStore = () => useContext(SortableStoreContext);

function useStore(items: ISortableItem[]): ISortableContext {
  const prevStore = useSortableStore();
  const [SORTABLE_ID] = useState(generateUUID());
  const [state, dispatch] = useReducer<
    React.ReducerWithoutAction<ISortableState>
  >(
    ((state: ISortableState, action: SortableAction): ISortableState => {
      if (action.type === SortableActionType.UPDATE_ID) {
        return update(state, {
          id: {
            $set: action.payload,
          },
        });
      }
      if (action.type === SortableActionType.register) {
        const data = action.payload;
        const item = state.items.find((item) => item.id == data.id)!;
        assign(item, data);
        return { ...state };
      }
      if (action.type === SortableActionType.move) {
        const { items } = state;
        const { source, target, relation } = action.payload;
        const sourceIndex = items.findIndex((data) => data.id == source);
        const targetIndex = items.findIndex((data) => data.id == target);
        if (
          sourceIndex == targetIndex ||
          sourceIndex == -1 ||
          targetIndex == -1
        ) {
          return state;
        }
        if (relation === 'before' && sourceIndex < targetIndex) {
          return state;
        }
        if (relation === 'after' && sourceIndex > targetIndex) {
          return state;
        }
        const sourceItem = items[sourceIndex];
        return update(state, {
          items: {
            $splice: [
              [sourceIndex, 1],
              [targetIndex, 0, sourceItem!],
            ],
          },
          logs: {
            $push: [{ source, target, sourceIndex, targetIndex }],
          },
        });
      }
      if (
        action.type === SortableActionType.remove ||
        action.type === SortableActionType.moveOut
      ) {
        const { items } = state;
        const item = action.payload;
        const itemIndex = items.findIndex((data) => data.id == item.id);
        if (itemIndex == -1) {
          return state;
        }
        return update(state, {
          items: {
            $splice: [[itemIndex, 1]],
          },
        });
      }
      if (action.type === SortableActionType.moveIn) {
        const {
          index,
          item: { sortable, rect, ...item },
        } = action.payload;
        if (index == -1) {
          return update(state, {
            items: {
              $push: [item],
            },
          });
        }
        return update(state, {
          items: {
            $splice: [[index, 0, item]],
          },
        });
      }
      if (action.type === SortableActionType.dragging) {
        // console.log('backup', action.type, state.id, 'setting');
        return update(state, {
          backup: {
            $set: [...state.items],
          },
          dragging: {
            $set: action.payload,
          },
        });
      }
      if (action.type === SortableActionType.drop) {
        // console.log('backup', action.type, state.id, 'clear');
        return update(state, {
          backup: {
            $set: [],
          },
          dragging: {
            $set: undefined,
          },
          logs: {
            $set: [],
          },
        });
      }
      if (action.type === SortableActionType.reset) {
        const { items, backup } = state;
        // console.log('backup', action.type, state.id, 'reset');
        return update(state, {
          items: {
            $set: backup.map((item) => {
              const original = items.find((x) => x.id == item.id);
              return original || item;
            }),
          },
          backup: {
            $set: [],
          },
          dragging: {
            $set: undefined,
          },
          logs: {
            $set: [],
          },
        });
      }
      if (action.type === SortableActionType.moving) {
        return update(state, {
          moving: {
            $set: action.payload,
          },
        });
      }
      if (action.type == SortableActionType.init) {
        return { ...action.payload };
      }
      return state;
    }) as any,
    {
      items,
      backup: [],
      logs: [],
      id: SORTABLE_ID,
      moving: false,
    } as any
  );
  const [listeners] = useState<SortableSubscribeCallback[]>([]);
  const handleUnsubscribe = (callback: SortableSubscribeCallback) => () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
  const handleSubscribe = useCallback(
    (callback: SortableSubscribeCallback) => {
      listeners.push(callback);
      return handleUnsubscribe(callback);
    },
    [listeners]
  );
  const handleDispatchSubscribe = useCallback(() => {
    for (const listener of listeners) {
      listener();
    }
  }, []);
  const initStore: ISortableContext = {
    getState: () => state,
    dispatch,
    eventEmitter: prevStore.eventEmitter || new EventEmitter(),
    subscribe: handleSubscribe,
  };
  const [store] = useState(initStore);

  const parentId = useSortableSelector((state) => state.id);
  useEffect(() => {
    if (!parentId) {
      return;
    }
    (dispatch as any)({
      type: SortableActionType.UPDATE_ID,
      payload: parentId + '/' + SORTABLE_ID,
    });
  }, [parentId]);

  useEffect(() => {
    store.getState = () => state;
    handleDispatchSubscribe();
  }, [state]);

  const outside = items.map(
    ({ _originalSortable, _sortable, _rect, ...item }: any) => item
  );
  useDeepCompareEffect(() => {
    const state = store.getState();
    const inside = state.items.map(
      ({ _originalSortable, _sortable, _rect, ...item }) => item
    );
    if (isEqual(inside, outside)) {
      return;
    }
    // console.log('isOverCurrent Change items', state.id);
    (dispatch as any)({
      type: SortableActionType.init,
      payload: {
        items: outside.map((item) => {
          const data = state.items.find((x) => x.id == item.id);
          if (!data) {
            return item;
          }
          const { _originalSortable, _sortable, _rect, ...prevData } = data;
          return isEqual(prevData, item)
            ? data
            : assign(
                {
                  ...data,
                  get _rect() {
                    return data?._rect;
                  },
                },
                item
              );
        }),
        backup: [],
        logs: [],
        moving: false,
        id: state.id,
      },
    });
  }, [outside]);

  return store;
}

export const SortableProvider = (props: SortableProviderProps) => {
  const { deps = [], items, children } = props;
  const store = useStore(items);
  return useMemo(
    () => (
      <SortableStoreContext.Provider value={store}>
        {children}
      </SortableStoreContext.Provider>
    ),
    deps
  );
};
