import React, { forwardRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableProps, SortableItemProps } from '../src';

const meta: Meta = {
  title: 'Demos/排列方向',
  component: AsanySortable,
  argTypes: {
    direction: {
      defaultValue: 'vertical',
      options: ['vertical', 'horizontal'],
      control: { type: 'radio' },
    },
    onChange: { action: 'changed' },
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

const SortItem = forwardRef(
  (
    { data, remove, update, style, drag, className }: SortableItemProps<any>,
    ref: any
  ) => {
    return (
      <li
        className={className}
        style={{ ...defaultStyle, ...style }}
        ref={drag(ref)}
      >
        {data.name}
      </li>
    );
  }
);

const Template: Story<SortableProps> = (args) => {
  const [items, setItems] = useState([
    { id: '1', name: '小明', type: 'sortable-card' },
    { id: '2', name: '陈二', type: 'sortable-card' },
    { id: '3', name: '张三', type: 'sortable-card' },
    { id: '4', name: '李四', type: 'sortable-card' },
    { id: '5', name: '老五', type: 'sortable-card' },
    { id: '6', name: '赵六', type: 'sortable-card' },
    { id: '7', name: '王七', type: 'sortable-card' },
  ]);

  const handleChange = (data, event) => {
    console.log('handleChange', data);
    setItems(data);
    args.onChange(data, event);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <AsanySortable
        accept={['sortable-card']}
        tag="ul"
        style={{ listStyle: 'none', padding: 0 }}
        items={items}
        itemRender={SortItem}
        {...args}
        onChange={handleChange}
      />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Direction = Template.bind({});

Direction.storyName = '排列方向';

Direction.args = {};
