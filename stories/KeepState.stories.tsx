import React, { forwardRef, useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableItemProps } from '../src';

const meta: Meta = {
  title: 'Demos/状态保持',
  component: AsanySortable,
  argTypes: {
    onDrag: { action: 'draged' },
    onDrop: { action: 'droped' },
    onSort: { action: 'sorted' },
    onRemove: { action: 'removed' },
    onChange: { action: 'changed' },
  },
  parameters: {
    controls: { expanded: true },
  },
};

const dispatchAction = (data, event) => {
  switch (event.type) {
    case 'update':
      return KeepState.args.onChange(data, event);
    case 'drop':
      return KeepState.args.onDrop(data, event);
    case 'drag':
      return KeepState.args.onDrag(data, event);
    case 'sort':
      return KeepState.args.onSort(data, event);
    case 'remove':
      return KeepState.args.onRemove(data, event);
  }
};

export default meta;

const defaultStyle = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
};

const SortItem = forwardRef(function (
  { update, data, style, drag, className }: SortableItemProps<any>,
  ref: any
) {
  if (data.type === 'sortable-card-2') {
    const [items, setItems] = useState<any[]>([
      { id: 11, name: '鲁班7号', type: 'sortable-card' },
      { id: 12, name: '廉颇', type: 'sortable-card' },
      { id: 13, name: '凯', type: 'sortable-card' },
      { id: 14, name: '苏烈', type: 'sortable-card' },
    ]);
    const handleChange = (values, event) => {
      dispatchAction(data, event);
      setItems(values);
    };

    return (
      <li
        className={className}
        style={{ ...defaultStyle, ...style }}
        ref={drag(ref)}
      >
        {data.name}
        <AsanySortable
          style={{ listStyle: 'none', padding: 0, minHeight: 100 }}
          accept={['sortable-card-2', 'sortable-card']}
          tag="ul"
          items={items}
          itemRender={SortItem}
          onChange={handleChange}
        />
      </li>
    );
  }

  const [name, setName] = useState(data.name);
  const handleChange = (event) => {
    setName(event.target.value);
  };

  useEffect(() => {
    update({ name });
  }, [name]);

  return (
    <li
      ref={drag(ref)}
      className={className}
      style={{ ...defaultStyle, ...style }}
    >
      <input value={name} onChange={handleChange} />
    </li>
  );
});

const Template: Story<any> = (args) => {
  const [items, setItems] = useState([
    { id: '1', name: '小明', type: 'sortable-card' },
    { id: '2', name: '陈二', type: 'sortable-card' },
    { id: '3', name: '张三', type: 'sortable-card' },
    { id: '4', name: '李四', type: 'sortable-card' },
    { id: '5', name: '老五', type: 'sortable-card' },
    { id: '6', name: '赵六', type: 'sortable-card' },
    { id: '7', name: '王者营地', type: 'sortable-card-2' },
  ]);

  const handleChange = (data, event) => {
    setItems(data);
    dispatchAction(data, event);
  };

  KeepState.args = args;

  return (
    <DndProvider backend={HTML5Backend}>
      <AsanySortable
        accept={['sortable-card']}
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
export const KeepState = Template.bind({});

KeepState.storyName = '状态保持';

KeepState.args = {};
