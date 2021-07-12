# Slatejs富文本框架学习
> 看了一些网上开源的编辑器，都不符合自己的操作习惯，于是就想重新实现一个。

### demo

### slatejs介绍
https://docs.slatejs.org/

### 核心概念
#### editor.children
slatejs展示的内容结构，是一棵树，根节点就是editor.children对象（editor是编辑器的一个实例），它由众多Element和Text节点构成，其中Text是叶子节点。结构如下：
``` typescript
type YourElement = {
  [key:string]:any; // 自定义属性，每个属性怎么渲染到内容里，需要自己制定规则
  children:YourElement[]; // 子节点
}
type YourTextNode = {
  text:string;
  [key:string]:any; // Text节点也可以扩展属性
}
```
参考：https://docs.slatejs.org/concepts/01-interfaces
<br/>
> 你可以通过各种API来操作editor.children对象，slate负责根据这棵树来渲染内容。

#### Path
Path就是树里各个节点的路径，它的结构：
``` typescript
type Path = number[];
```

#### Point
Point比Path更深入，可以理解成光标的位置，它的结构：
``` typescript
interface Point {
    path: Path; // 定位到节点的路径
    offset: number; // 文本节点的内容偏移量
}
```
> 光标总是位于文本节点的某个位置，那么这个位置总是可以用Point表示

#### Range
Range就是我们按住鼠标左键拖动后选中的区域对象，这个区域包含文本节点以及元素节点。

### 常用API注释
#### Editor.nodes
从根节点往下遍历到当前指定区域，输出匹配的所有元素，如果没有指定区域，则默认是光标或者选中区域。

#### Editor.node
#### Editor.isStart
#### Editor.isEnd
#### Editor.above
#### Editor.first
#### Editor.last
#### Editor.range
#### Editor.parent
