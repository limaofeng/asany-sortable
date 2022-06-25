import React, { forwardRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableItemProps } from '../src';
import { dragPreview } from '../src/utils';

const meta: Meta = {
  title: 'Demos/动画',
  component: AsanySortable,
  argTypes: {
    enableAnimation: {
      defaultValue: true,
      control: { type: 'boolean' },
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
  width: 320,
  height: 90,
};

const SortItem = forwardRef((props: SortableItemProps<any> & any, ref: any) => {
  const { data, style, drag, className, animated } = props;
  return (
    <li
      {...(Animation.args.enableAnimation ? animated : {})}
      className={className}
      style={{ ...defaultStyle, ...style }}
      ref={drag && drag(ref)}
    >
      {data.name}
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
    { id: '7', name: '王七', type: 'sortable-card' },
  ]);

  const handleChange = (data, event) => {
    args.onChange(data, event);
    setItems(data);
  };

  Animation.args = args;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ paddingLeft: 100 }}>
        <AsanySortable
          accept={['sortable-card']}
          tag="ul"
          style={{ listStyle: 'none', padding: 0 }}
          items={items}
          preview={{
            render: dragPreview(<SortItem style={{ marginRight: 0, listStyle: 'none' }} />, {
              scale: 1.1,
            }),
            axisLocked: true,
          }}
          onChange={handleChange}
          itemRender={SortItem}
        />
      </div>
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Animation = Template.bind({});

Animation.storyName = '动画';

Animation.args = {};
