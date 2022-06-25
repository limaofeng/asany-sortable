import React, { forwardRef, memo, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AsanySortable, { SortableItemProps } from '../src';
import { dragPreview } from '../src/utils';

const meta: Meta = {
  title: 'Demos/多实例',
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

const SortItem = memo(
  forwardRef((props: SortableItemProps<any> & any, ref: any) => {
    const { data, style, drag, className } = props;
    return (
      <li className={className} style={{ ...defaultStyle, ...style }} ref={drag && drag(ref)}>
        {data.name}
      </li>
    );
  })
);

const AsanySortableInstance = (args) => {
  const [items, setItems] = useState(args.items);

  const handleChange = (data: any, event: any) => {
    setItems(data);
  };

  return (
    <AsanySortable
      tag="ul"
      style={{ listStyle: 'none', padding: 0 }}
      items={items}
      onChange={handleChange}
      itemRender={SortItem}
      preview={args.preview && dragPreview(<SortItem style={{ marginRight: 0, listStyle: 'none' }} />)}
    />
  );
};

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

  const handleChange = (data: any, event: any) => {
    args.onChange(data, event);
    setItems(data);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div>
          <AsanySortableInstance
            items={[
              { id: '1', name: '小明' },
              { id: '2', name: '陈二' },
              { id: '3', name: '张三' },
              { id: '4', name: '李四' },
              { id: '5', name: '老五' },
              { id: '6', name: '赵六' },
              { id: '7', name: '王七' },
            ]}
            preview
          />
        </div>
        <div style={{ position: 'relative' }}>
          <AsanySortableInstance
            preview
            items={[
              { id: '11', name: '小明1' },
              { id: '21', name: '陈二1' },
              { id: '31', name: '张三1' },
              { id: '41', name: '李四1' },
              { id: '51', name: '老五1' },
              { id: '61', name: '赵六1' },
              { id: '71', name: '王七1' },
            ]}
          />
        </div>
      </div>
    </DndProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.storyName = '多实例';

Default.args = {};
