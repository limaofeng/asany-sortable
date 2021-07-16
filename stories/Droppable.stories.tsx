import React, { forwardRef, useRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableProps } from '../src';

import heros from './heros.json';

const meta: Meta = {
  title: 'Demos/拖放',
  component: AsanySortable,
  argTypes: {
    accept: {
      defaultValue: 'default',
      options: ['default', 'heros'],
      control: { type: 'select' },
    },
    onChange: { action: 'changed' },
    onDrop: { action: 'droped' },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const defaultStyle = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  marginRight: '.5rem',
  backgroundColor: 'white',
};

const data = [
  { id: '2', name: '老王', type: 'default' },
  { id: '3', name: '老五', type: 'default' },
  {
    id: '1',
    name: '荣耀',
    type: 'card-box',
    accept: ['default'],
    children: [
      { id: '11', name: '鲁班7号', type: 'default' },
      { id: '12', name: '廉颇', type: 'default' },
      { id: '13', name: '凯', type: 'default' },
      {
        id: '14',
        name: '长城守卫军 (HEROS + DEFAULT)',
        type: 'card-box',
        accept: ['heros', 'default'],
        children: [{ id: '15', name: '苏烈', type: 'default' }],
      },
    ],
  },
  { id: '4', name: '张三', type: 'default' },
  { id: '5', name: '赵六', type: 'default' },
  { id: '6', name: '李七', type: 'default' },
  { id: '7', name: '王者营地 (HEROS)', type: 'card-box', accept: ['heros'] },
];

function generateUUID() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint32Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function Dragme() {
  const ref = useRef<any>();

  const [names, setNames] = useState(heros);
  const item = { id: generateUUID(), type: Droppable.args.accept };
  const [, drag] = useDrag({
    canDrag() {
      return !!names.length;
    },
    type: Droppable.args.accept,
    item: () => {
      return {
        ...item,
        name: `${names[0]} - ${Droppable.args.accept}`,
        get rect() {
          return ref.current?.getBoundingClientRect();
        },
      };
    },
    end(_, monitor) {
      const result = monitor.getDropResult();
      if (!result) {
        return;
      }
      Droppable.args.onDrop(result);
      names.shift();
      setNames([...names]);
    },
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  });
  return <div ref={drag(ref) as any}>英雄池({names.length})</div>;
}

const InternalContainer = forwardRef(
  (
    { itemRef, itemClassName, itemStyle, itemData, children, ...props }: any,
    boxRef: any
  ) => {
    return (
      <li
        className={itemClassName}
        style={{ ...defaultStyle, ...itemStyle, padding: 0 }}
        ref={itemRef}
      >
        <span ref={boxRef} style={{ display: 'block', padding: '0.5rem 1rem' }}>
          {itemData.name}
          <ul {...props}>{children}</ul>
        </span>
      </li>
    );
  }
);

const SortItem = forwardRef(function (
  { data, style, drag, className, update }: any,
  itemRef: any
) {
  const [items, setItems] = useState(data.children || []);
  const handleChange = (values, event) => {
    setItems(values);
    Droppable.args.onChange(values, event);
    update({ ...data, children: values });
  };

  drag(itemRef);

  if (data.type == 'card-box') {
    return (
      <NestedSortable
        accept={data.accept}
        tag={
          <InternalContainer
            itemData={data}
            itemRef={itemRef}
            itemClassName={className}
            itemStyle={style}
          />
        }
        items={items}
        onChange={handleChange}
      />
    );
  }
  return (
    <li
      ref={itemRef}
      className={className}
      style={{ ...defaultStyle, ...style }}
    >
      {data.name}
    </li>
  );
});

const NestedSortable = ({
  tag = 'ul',
  accept = [],
  items,
  onChange: handleChange,
}: any) => {
  return (
    <AsanySortable
      items={items}
      accept={accept}
      itemRender={SortItem}
      style={{ listStyle: 'none', padding: 0 }}
      tag={tag}
      onChange={handleChange}
    />
  );
};

const Template: Story<SortableProps> = (args) => {
  const [items, setItems] = useState(data);

  const handleChange = (data, event) => {
    console.log('handleChange', data);
    setItems(data);
    Droppable.args.onChange(data, event);
  };

  Droppable.args = args;

  return (
    <DndProvider backend={HTML5Backend}>
      <Dragme />
      <br />
      <NestedSortable
        accept={['default']}
        items={items}
        onChange={handleChange}
      />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Droppable = Template.bind({});

Droppable.storyName = '拖放';

Droppable.args = {};
