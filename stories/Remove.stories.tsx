import React, { forwardRef, useRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable from '../src';

const meta: Meta = {
  title: 'Demos/Remove',
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
      return Remove.args.onChange(data, event);
    case 'drop':
      return Remove.args.onDrop(data, event);
    case 'drag':
      return Remove.args.onDrag(data, event);
    case 'sort':
      return Remove.args.onSort(data, event);
    case 'remove':
      return Remove.args.onRemove(data, event);
  }
};

export default meta;

const defaultStyle = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
};

const rowStyle = {
  display: 'flex',
};

const nameStyle = {
  flex: 1,
};

const recycledStyle = {
  width: '100%',
  height: 50,
  paddingLeft: '1rem',
  border: '1px dashed gray',
  lineHeight: '50px',
};

function Recycled() {
  const ref = useRef();

  const [{ isOver }, connectDrop] = useDrop({
    accept: ['sortable-card'],
    drop() {
      return { type: 'dustbin' };
    },
    canDrop(item: any, monitor) {
      return item.deleteable && monitor.isOver({ shallow: true });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      handlerId: monitor.getHandlerId(),
    }),
  });
  connectDrop(ref);

  let backgroundColor = undefined;
  if (isOver) {
    backgroundColor = '#a5d6a7';
  }

  return (
    <div style={{ ...recycledStyle, backgroundColor }} ref={ref}>
      回收站(拖拽删除 支持 type = sortable-card 类型 的数据)
    </div>
  );
}

function ItemRender({ data, style, drag, className, remove }: any, ref: any) {
  const [items, setItems] = useState([
    { id: '11', name: '鲁班7号', type: 'sortable-card' },
    { id: '12', name: '廉颇', type: 'sortable-card' },
    { id: '13', name: '凯', type: 'sortable-card' },
    { id: '14', name: '苏烈', type: 'sortable-card' },
  ]);
  const handleChange = (values, event) => {
    setItems(values);
    dispatchAction(values, event);
  };

  if (data.type === 'sortable-card-2') {
    return (
      <li
        className={className}
        style={{ ...defaultStyle, ...style }}
        ref={drag(ref)}
      >
        <div style={rowStyle}>
          <span style={nameStyle}>{data.name}</span>
          <a onClick={remove}>删除</a>
        </div>
        <AsanySortable
          style={{ minHeight: 100, listStyle: 'none', padding: 0 }}
          accept={['sortable-card-2', 'sortable-card']}
          tag="ul"
          items={items}
          itemRender={ItemRender}
          onChange={handleChange}
        />
      </li>
    );
  }
  return (
    <li
      ref={drag(ref)}
      className={className}
      style={{ ...defaultStyle, ...style }}
    >
      <div style={rowStyle}>
        <span style={nameStyle}>{data.name}</span>
        <a onClick={remove}>删除</a>
      </div>
    </li>
  );
}

const Template: Story<any> = (args) => {
  const [items, setItems] = useState([
    { id: '1', name: '小明', type: 'sortable-card' },
    { id: '2', name: '陈二', type: 'sortable-card' },
    // { id: '3', name: '张三', type: 'sortable-card' },
    // { id: '4', name: '李四', type: 'sortable-card' },
    // { id: '5', name: '老五', type: 'sortable-card' },
    // { id: '6', name: '赵六', type: 'sortable-card' },
    // { id: '7', name: '王七', type: 'sortable-card' },
    { id: '8', name: '王者营地', type: 'sortable-card-2' },
  ]);

  const handleChange = (data, event) => {
    setItems(data);
    dispatchAction(data, event);
  };

  Remove.args = args;

  return (
    <DndProvider backend={HTML5Backend}>
      <Recycled />
      <br />
      <AsanySortable
        accept={['sortable-card']}
        tag="ul"
        style={{ listStyle: 'none', padding: 0 }}
        items={items}
        onChange={handleChange}
        itemRender={ItemRender}
      />
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Remove = Template.bind({});

Remove.args = {};
