import React, { forwardRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableProps, SortableItemProps } from '../src';

import heros from './heros.json';

const meta: Meta = {
  title: 'Demos/Grid',
  component: AsanySortable,
  argTypes: {
    layout: {
      defaultValue: 'grid',
      options: ['grid', 'list'],
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

const SortItem = forwardRef(({ data, remove, update, style, drag }: SortableItemProps<any>, ref: any) => {
  return (
    <li style={{ ...defaultStyle, ...style }} ref={drag(ref)}>
      {data.name}
    </li>
  );
});

const Template: Story<SortableProps> = (args) => {
  const [items, setItems] = useState(heros.map((name, id) => ({ id: String(id), name, type: 'sortable-card' })));

  const handleChange = (data, event) => {
    args.onChange(data, event);
    setItems(data);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <AsanySortable
        accept={['sortable-card']}
        tag="ul"
        style={{ listStyle: 'none', padding: 0 }}
        items={items}
        onChange={handleChange}
        itemRender={SortItem}
        {...args}
      />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Grid = Template.bind({});

Grid.args = {};
