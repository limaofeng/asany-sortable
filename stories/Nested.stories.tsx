import React, { forwardRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableProps } from '../src';

const meta: Meta = {
  title: 'Demos/Nested',
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

const data = [
  {
    id: '1',
    name: '荣耀',
    type: 'card-box',
    children: [
      { id: '11', name: '鲁班7号', type: 'sortable-card' },
      { id: '12', name: '廉颇', type: 'sortable-card' },
      { id: '13', name: '凯', type: 'sortable-card' },
      {
        id: '14',
        name: '长城守卫军',
        type: 'card-box',
        children: [{ id: '14', name: '苏烈', type: 'sortable-card' }],
      },
    ],
  },
  { id: '2', name: '老王', type: 'sortable-card' },
  { id: '3', name: '老五', type: 'sortable-card' },
  { id: '4', name: '张三', type: 'sortable-card' },
  { id: '5', name: '赵六', type: 'sortable-card' },
  { id: '6', name: '李七', type: 'sortable-card' },
  { id: '7', name: '王者营地', type: 'card-box' },
];

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
    update({ ...data, children: values });
  };

  drag(itemRef);

  if (data.type == 'card-box') {
    return (
      <NestedSortable
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

const NestedSortable = ({ tag = 'ul', items, onChange: handleChange }: any) => {
  return (
    <AsanySortable
      items={items}
      itemRender={SortItem}
      style={{ listStyle: 'none', padding: 0 }}
      accept={['sortable-card', 'card-box']}
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
    args.onChange(data, event);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <NestedSortable items={items} onChange={handleChange} />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Nested = Template.bind({});

Nested.args = {};
