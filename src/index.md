---
category: Components
subtitle: 排序
type: 数据展示
title: Sortable
cols: 1
---

可拖拽的多层次的结构列表。

## 何时使用

文件夹、组织架构、生物分类、国家地区等等，世间万物的大多数结构都是树形结构。使用 `树控件` 可以完整展现其中的层级关系，并具有展开收起选择等交互功能。

## API

### Sortable props

| 参数     | 说明                                     | 类型            | 默认值 |
| -------- | ---------------------------------------- | --------------- | ------ |
| tag      | 生成的标签类型                           | `div` or `tag`  |        |
| onChange | 排序后的数据，获取 SortItem 的 data 数组 | SortItem.data[] | []     |

### useSortItem props

| 返回值      | 说明         | 类型                                 | 默认值 |
| ----------- | ------------ | ------------------------------------ | ------ |
| `{ style }` | treeNodes    | array<{id, title,[, children,icon]}> | -      |
| ref         | 拖拽节点     | boolean                              | false  |
| drag        | 可拖拽的元素 | boolean                              | false  |
