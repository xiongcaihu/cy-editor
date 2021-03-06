# Slatejs富文本框架学习
> 看了一些网上开源的编辑器，都不符合自己的操作习惯，于是就想重新实现一个。

### [CYEditor Demo](https://xiongcaihu.github.io/cyEditorDeploy/)

### [slatejs介绍](https://docs.slatejs.org/)
> slatejs是一个L1级的富文本编辑框架，它利用contenteditable的排版，自己定义了一个用于描述容器内容的树形结构，类似DOM，通过MVC的模式去管理渲染，所以这就可以避免用户输入这个Model无法管理或者不认可的内容（因为slatejs拦截了用户的输入行为，并替换成内部的api去执行），使得用户在交互和内容展示方面能有一致且稳定的体验。
> <br/><br/>slatejs的选区管理底层是利用原生的Range来做的。这样如果是协同编辑里的多个选区和光标情况的话，就需要自行去模拟。

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
- [x] 复制todoList的部分文字，粘贴出来的是整个todoList 【不做处理，因为粘贴出来是todo的话，可以选择取消】
- [x] 提供复制表格的工具按钮
- [x] 完善列表的测试用例
- [x] todo组件的用例
- [x] 表格组件的用例
- [ ] 基础功能的测试用例
  - [x] 改变字体包裹，h1,h2...
  - [x] 改变字体大小，粗细，下划线，管穿线
  - [x] 改变字体对齐方式
  - [ ] 改变字体颜色，背景色
  - 问题
  - [x] 表格新增行会出现滚动条
- [x] 重构扩展组件逻辑
  - 存放路径/externalComps/comps
- [x] 容器内增加通用透明悬浮div，通过editor.setFixLayoutBox方法来调用
- [x] 可配置数据的@功能 (doing)
  - 功能描述：
    - 输入@符号后，光标处弹出选人窗口
    - 待选人结束后，关闭窗口
  - 进度
    - [x] 基本功能实现
    - [x] 美化外观
    - [ ] 补充测试用例
  - [x] 问题
    - [x] 点击多个不同的@组件后，再选择人，会报warn：作用在了已经ummount的组件上
    - [x] 当选人的组件放在屏幕的最右边时，弹窗出现后，会出现滚动条。
    - [x] 选人后，搜索框里的值没变
    - [x] 当文档为空时，输入@符号没反应
- [x] 表格支持自适应单元格
  - [x] 最小100px
- [ ] 日期功能
- [ ] 颜色选项实现可配置化
- [ ] 对于粘贴的外部内容的转换规则实现可配置化
- [ ] 为文本添加\t内容的按钮
- [x] 单元格垂直居中的功能
- [x] 代码块组件的界面优化【将语言选择移动到不阻碍代码显示的位置，并增加更多语言选项】 (done)
- [ ] 可插入特殊符号
- [ ] 支持粘贴excel里的表格
- [ ] 支持粘贴word里的内容
- [ ] 支持多窗口实时编辑
- [ ] 国际化
- [x] 图片配置外部化
- [x] 文件上传配置化
- [ ] @人实现配置化
- [ ] 文件预览功能
  - [ ] word文件【doc,ppt,docx,excel】
  - [ ] 普通文本【txt,js,java....】

### BUGS
- [x] 表格内批量删除，无法删除图片
