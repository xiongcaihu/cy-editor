# Slatejs富文本框架学习
> 看了一些网上开源的编辑器，都不符合自己的操作习惯，于是就想重新实现一个。

### [CYEditor Demo](https://xiongcaihu.github.io/cyEditorDeploy/)

### [slatejs介绍](https://docs.slatejs.org/)

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

#### Range
Range就是我们按住鼠标左键拖动后选中的区域对象，这个区域包含文本节点以及元素节点。

### normalizing（元素结构校验规则）
这块儿的功能可以理解为：要如何制定一套规则来保证自定义的元素内部结构是符合自己的规定的。举个例子，如果我定义一个元素叫MyBook，我希望它的结构是
``` html
<p>
  <a href="xxx">book link</a>
</p>
```
那么这个normalizing就是用来保证每次操作涉及到这个MyBook元素后都会得到正确的结构。
比如我操作这个MyBook元素，插入一个div
``` html
<p>
   <a href="xxx">book link</a>
   <div>heihei</div>
</p>
```
那此时结构是不正确的，但是当运行完操作指令后，这个normalizing就会触发，然后根据自己写的规则去修正它的结构（也就是删除掉div元素）。<br/>
除了自己定义修正规则外，slatejs也带了一些基本的修正规则，比如：void元素不能出现在块元素的第一个位置；块元素如果为空，会自动加入一个text子元素在里面，详情见：
https://docs.slatejs.org/concepts/11-normalizing

### slatejs如何得出每次操作后的dirtyPath来进行normalizing
1. 如果是插入text，删除text，或者设置node属性的操作，那么dirtyPath = 祖先结点集合（从第一个父节点开始往上一直到根节点所经过的路径点的集合）+自身
2. 如果是插入元素，那么dirtyPath = 祖先结点集合+自身+自己下面的所有元素
3. 如果是删除元素，那么dirtyPath = 祖先结点集合
4. 如果是分离元素，那么dirtyPath = 祖先结点集合+自身+自己的后一个元素
5. 如果是合并元素，那么dirtyPath = 祖先结点集合+自己的前一个元素
6. 如果是移动元素，那么dirtyPath = 原来的祖先结点集合+新的祖先结点集合+目标位置

### withoutNormalizing
在函数执行完后进行normalizing
### slatejs API中的mode的各个值代表的意思
举例：匹配此结构里的div，设置mode值
``` html
<p>
  <div id="1">
    <div id="2">
      <span>text</span>
    </div>
  </div>
</p>
```
1. mode=highest：取匹配路径中的最高点，那么得到的是id="1"的div
2. mode=lowest：匹配最低点，也就是上面这个例子的id="2"的div
3. mode=all：匹配所有符合条件的，也就是得到id="1'和id="2"

### 常用API注释
#### Editor.nodes
从根节点往下遍历到当前指定区域，输出途径所匹配的元素，如果没有指定区域，则默认是光标或者选中区域。

#### Editor.node
从根节点往下遍历到当前指定区域，输出途径所匹配的第一个元素。

#### Editor.isStart
判断光标是否处于当前区域的第一个文本节点的第一个位置。

#### Editor.isEnd
判断光标是否处于当前区域的最后一个文本节点的最后一个位置

#### Editor.above
从当前位置往上遍历，输出匹配的第一个元素

#### Editor.first
获得当前区域的第一个节点

#### Editor.last
获得当前区域的最后一个节点

#### Editor.range
获得元素的range

#### Editor.parent
获得元素的父节点

#### Editor.pointRef
绑定point，比如Editor.pointRef(editor,editor.selection.anchor)，此时绑定了光标，当光标移动后，ref.current的值也会跟着变动。好处：不用再每次获取editor.selection.anchor

### TODO
1. 继续补充更多基础功能
2. 加入cypress测试用例

### 问题
1. 复制todoList的部分文字，粘贴出来的是整个todoList
2. 支持复制整个表格，（提供按钮，点一下，复制在下方）
3. 完善列表的测试用例
4. todo组件的用例
5. 表格组件的用例
6. 重构各个组件逻辑，将每个组件的行为控制逻辑都集中起来，最后定义一个通用的模板组件。以后新增的每个组件都需要基于这个模板组件来进行实现。
