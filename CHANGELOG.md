## [0.1.28](https://github.com/limaofeng/asany-sortable/compare/v0.1.27...v0.1.28) (2021-11-13)


### Bug Fixes

* 修复计算问题 ([6f3499c](https://github.com/limaofeng/asany-sortable/commit/6f3499cd6d5fc02bbd39b6968e87ea0d9e116bca))



## [0.1.27](https://github.com/limaofeng/asany-sortable/compare/v0.1.26...v0.1.27) (2021-11-12)


### Bug Fixes

* 修复刷新数据时, pos 丢失的问题 ([5c30152](https://github.com/limaofeng/asany-sortable/commit/5c30152c9b89b61e217249d3dc2073a45b217438))



## [0.1.26](https://github.com/limaofeng/asany-sortable/compare/v0.1.25...v0.1.26) (2021-11-07)



## [0.1.25](https://github.com/limaofeng/asany-sortable/compare/v0.1.24...v0.1.25) (2021-11-07)



## [0.1.24](https://github.com/limaofeng/asany-sortable/compare/v0.1.23...v0.1.24) (2021-11-07)



## [0.1.23](https://github.com/limaofeng/asany-sortable/compare/v0.1.22...v0.1.23) (2021-11-07)


### Features

*  添加 mode 选择 ([c43c615](https://github.com/limaofeng/asany-sortable/commit/c43c6155f1050cf1f78d750d0da17557c74730aa))



## [0.1.22](https://github.com/limaofeng/asany-sortable/compare/v0.1.21...v0.1.22) (2021-08-11)


### Bug Fixes

*  rerender 选项默认值逻辑调整，itemRender 为函数是为 tree 为组件时为 false ([54bf7f5](https://github.com/limaofeng/asany-sortable/commit/54bf7f5135e50e6bee72f45dbc33e73a6dcea3ba))
* 解决禁用拖拽后依然更新 clicked 值的 BUG ([f61aaab](https://github.com/limaofeng/asany-sortable/commit/f61aaabc6a4b693f27368e60eed0bf0c84cf6626))



## [0.1.21](https://github.com/limaofeng/asany-sortable/compare/v0.1.20...v0.1.21) (2021-08-11)


### Features

* itemRender 添加 clicked 与 dragging ([8436804](https://github.com/limaofeng/asany-sortable/commit/84368048b48d24e340657da538d330b46fc05e47))



## [0.1.20](https://github.com/limaofeng/asany-sortable/compare/v0.1.19...v0.1.20) (2021-08-11)


### Features

*  使用 IntersectionObserver 过滤不可见的元素 ([f3b4d83](https://github.com/limaofeng/asany-sortable/commit/f3b4d83185ad9739b0460ed2f094b33f68ea4186))
* 优化 rerender 刷新方式，只触发可见范围内的组件 ([fc59811](https://github.com/limaofeng/asany-sortable/commit/fc59811a263c0e1f6982a0804fbf00e90bda5e42))



## [0.1.19](https://github.com/limaofeng/asany-sortable/compare/v0.1.18...v0.1.19) (2021-08-10)


### Features

* 添加 rerender 选项，用于控制 itemRender 的刷新 ([0cefd1d](https://github.com/limaofeng/asany-sortable/commit/0cefd1dde94582688aa15402fc2c1d6401c99d5e))



## [0.1.18](https://github.com/limaofeng/asany-sortable/compare/v0.1.17...v0.1.18) (2021-08-10)


### Features

* itemRender 如果为函数,使用函数式调用 ([ad5bc9c](https://github.com/limaofeng/asany-sortable/commit/ad5bc9c00b3bb41913b58bbf05b4d477734f940f))



## [0.1.17](https://github.com/limaofeng/asany-sortable/compare/v0.1.16...v0.1.17) (2021-08-10)


### Features

* 添加 dragCondition 属性，用于设置 SortItem 是否可以拖拽，对应  useDrag 的 canDrag ([eb661e0](https://github.com/limaofeng/asany-sortable/commit/eb661e044e346de8ec8c5a97ddba08761e7a492a))



## [0.1.16](https://github.com/limaofeng/asany-sortable/compare/v0.1.15...v0.1.16) (2021-08-09)


### Bug Fixes

* 优化大数据量时的比较逻辑，避免卡顿 ([95e50f2](https://github.com/limaofeng/asany-sortable/commit/95e50f24eb71e426ad2e08afc8541caf88e7fec7))



## [0.1.13](https://github.com/limaofeng/asany-sortable/compare/v0.1.12...v0.1.13) (2021-08-09)


### Bug Fixes

* 渲染 SortItem 时，添加 useMemo，优化性能 ([d17f5d7](https://github.com/limaofeng/asany-sortable/commit/d17f5d7f9a1c8539e80909524912629739373977))



## [0.1.8](https://github.com/limaofeng/asany-sortable/compare/v0.1.7...v0.1.8) (2021-07-14)


### Bug Fixes

* 快速移入移出元素，会偶尔出现不能交换顺序的情况 ([fb1d7b9](https://github.com/limaofeng/asany-sortable/commit/fb1d7b96d5afaec436b5158e3510a0083b66f13e))


### Features

* 统一交换检测逻辑 ([51c9997](https://github.com/limaofeng/asany-sortable/commit/51c999705aeb2e34ec9e2979e12e0557d53ca2d3))




