# AsanySortable

基于 React-Dnd 封装的拖拽排序组件

## Install

```bash
npm i asany-sortable # or yarn add asany-sortable
```

## Usage

```tsx
const defaultStyle = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  marginRight: '.5rem',
  backgroundColor: 'white',
};

const SortItem = forwardRef(({ data, style, className }: SortableItemProps<any>, ref: any) => {
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

const Example = () => {
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
      />
    </DndProvider>
  );
};
```

## Maintainers

[@limaofeng](https://github.com/limaofeng).

## License

[MIT](LICENSE) © 李茂峰