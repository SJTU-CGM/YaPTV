# YaPTV

Yet another Phylogenetic Tree Viewer

## 使用方法

YaPTV（以下称本程序）是作为一个独立的网页而实现的。因此它一般需要搭配<iframe>HTML元素使用。

配置本程序需要修改两个配置文件：一是`conf.json`,称作主配置文件，它描述了被展示的树的描述文件的位置与两个参数`branch_unit`和`tree_padding`；二是树的描述文件，它的位置由`conf.json`说明。

树加载完成的标志是全局变量`HANDLE`已经被定义，而且`HANDLE.ready()`返回`true`。

## 树的描述文件之格式

此文件的格式为JSON。大致的描述如下（如果看不懂请告诉我）

```
Node ::= {
    branch_length : <Float>,
    children : [ Node | Leaf ]
}

Leaf ::= {
    name : <String>,
    branch_length : <Non-negative Number>
}
```

## 主配置文件
```
Top ::= {
    path : <String, 到树描述文件的相对路径>,
    tree_padding : <Non-negative Number, 在树上下额外添加的空白高度，单位为像素>,
    branch_unit : <Non-negative Number, 单位枝条长度，单位为像素>
}
```

## 与树浏览器互动

所有此类互动都通过调用绑定至全局变量`HANDLE`的对象的方法进行。

控制选取的叶节点
```JavaScript
setSelection(Array<String> nameArray | Set<String> nameSet)
getSelection() ==> Set<String>
```

控制滚动条
```
scrollTo(float x, float y)
```

控制怎么回应提交选择的请求
```
setSubmitHandle(Procedure handle)
```
