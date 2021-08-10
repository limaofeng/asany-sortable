import React, { forwardRef, memo, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableProps, SortableItemProps } from '../src';

const meta: Meta = {
  title: 'Demos/基础',
  component: AsanySortable,
  argTypes: {
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

const SortItem = memo(forwardRef((props: SortableItemProps<any>, ref: any) => {
  const { data, remove, update, style, drag, className } = props;
  console.log('changed', data.name);
  return (
    <li className={className} style={{ ...defaultStyle, ...style }} ref={drag(ref)}>
      {data.name}
    </li>
  );
}));

const Template: Story<any> = (args) => {
  const [items, setItems] = useState([
    { id: '1', name: '小明' },
    { id: '2', name: '陈二' },
    { id: '3', name: '张三' },
    { id: '4', name: '李四' },
    { id: '5', name: '老五' },
    { id: '6', name: '赵六' },
    { id: '7', name: '王七' },
  ]);

  const handleChange = (data, event) => {
    args.onChange(data, event);
    setItems(data);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <AsanySortable
        tag="ul"
        style={{ listStyle: 'none', padding: 0 }}
        items={items}
        onChange={handleChange}
        itemRender={SortItem}
      />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Basic = Template.bind({});

Basic.storyName = '基础';

Basic.args = {};
