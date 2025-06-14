## 1.

```
Vector3.prototype = {};
Vector3.prototype.constructor = Vector3;
```

Object.assign(target, source) 是向已有的对象添加属性或方法，而不是替换整个原型对象。所以已经创建的实例仍然可以继承这些新添加的方法。

## 2.

```
Vector3.prototype = {};
Vector3.prototype.constructor = Vector3;
```
Vector3.prototype 指向了一个全新的对象，后续创建的新实例才会继承新的原型。已有实例不受影响，它们不会自动更新原型链

```
function Vector3() {}
var v = new Vector3();

Vector3.prototype = {
  a: function() {}
};
```
console.log(v.a); // ❌ undefined


```
function Vector3() {}

var v = new Vector3(); // 此时原型是默认的空对象

// 使用 Object.assign 向已有原型添加方法
Object.assign(Vector3.prototype, {
  a: function() {
    console.log('a');
  }
});

```

console.log(v.a); // ✅ 输出函数 a

## 3.THREE.Frustum


THREE.Frustum 是什么？
它表示相机可视区域的边界，由六个平面组成：

- left
- right
- top
- bottom
- near
- far
这些平面共同构成了一个截头锥体（也就是相机能看到的空间范围）。

.setFromMatrix(matrix) 的作用：

该方法会根据传入的 ViewProjectionMatrix 提取出六个裁剪平面，并更新 frustum 对象。之后你可以用这个 frustum 做很多事，比如：

- 判断某个物体是否在相机视野内（box.intersectsSphere() / box.intersectsFrustum()） intersectsObject

- 进行射线拾取（raycasting）

- 控制 LOD（Level of Detail）

- 控制渲染细节（如只渲染视野内的物体）

## 4.object.frustumCulled



设置 object.frustumCulled = false 的常见用途包括：

1. 动态对象或频繁移出视野的对象
比如粒子系统、UI 元素、天空盒等，它们可能经常在视野外，但又需要持续更新和渲染。


2. 自定义剔除逻辑
如果你自己实现了剔除逻辑（比如基于八叉树、空间分区），可以关闭 Three.js 默认的视锥体剔除以避免冲突。

3. 调试目的
有时为了调试方便，希望看到所有物体，不管它们是否在相机视野内。

## 5.WeakMap

WeakMap 是 JavaScript 中的一种特殊的数据结构，它的键必须是 对象（Object），而且这些键是“弱引用”的。


```
const wm = new WeakMap();
const key = {};
wm.set(key, 'value');
console.log(wm.get(key)); // 'value'
```


Three.js 中的 `properties = new WeakMap()` 主要用于实现一种 **私有属性存储机制**，它有几个非常重要的优势：

---

### ✅ 1. **防止内存泄漏（Memory Leak Prevention）**

当使用普通对象 `{}` 存储对象相关数据时，比如：

```js
var properties = {};
properties[object] = { ... };
```

即使这个 `object` 已经不再被其他地方使用，只要它还在 `properties` 中作为键存在，JavaScript 引擎就不会将其垃圾回收（GC），这可能导致内存泄漏。

而 `WeakMap` 的键是 **弱引用**，这意味着：

> 如果某个对象只被 `WeakMap` 引用，那么它仍然可以被垃圾回收器回收。

所以使用 `WeakMap` 可以避免因长期持有对象而导致的内存泄漏问题。

---

### ✅ 2. **数据封装性更强（不污染对象本身）**

如果你直接将数据附加到对象上，比如：

```js
object._internalData = { ... };
```

虽然方便，但可能会造成命名冲突（例如多个库都试图写 `_internalData`），或者暴露了内部状态。

使用 `WeakMap` 可以将这些数据完全封装在一个外部结构中，不会修改原始对象。

---

### ✅ 3. **支持多类扩展属性，互不干扰**

Three.js 有很多模块，比如 `WebGLRenderer`, `WebGLGeometries`, `WebGLMaterials` 等，它们可能都需要为同一个对象（如 `Mesh` 或 `Material`）保存一些与渲染相关的临时状态。

通过 `WeakMap`，每个模块都可以安全地维护自己的属性，而不会互相干扰。

---

## 🆚 对比：WeakMap vs 普通 Object `{}`

| 特性 | `WeakMap` | 普通 `Object` |
|------|-----------|----------------|
| 键类型 | 必须是对象 | 字符串或 Symbol |
| 弱引用 | ✅ 是 | ❌ 否 |
| 内存泄漏风险 | ❌ 不会 | ✅ 可能 |
| 遍历支持 | ❌ 不支持 | ✅ 支持 |
| 封装性 | ✅ 更好 | ❌ 易冲突 |

---

## 🧪 示例对比

### 使用 `WeakMap`（Three.js 方式）：

```js
const properties = new WeakMap();

const mesh = new THREE.Mesh(...);

properties.set(mesh, {
    program: someProgram,
    updateMorphTargets: true
});

console.log(properties.get(mesh)); // 获取内部属性
```

### 使用普通对象：

```js
const properties = {};

const mesh = new THREE.Mesh(...);

properties[mesh] = { /* 数据 */ };

// ⚠️ 实际运行中，mesh 会被转成 "[object Object]" 字符串，导致所有对象共享同一项！
```

> ⚠️ 上面这种写法其实是有严重 bug 的！因为 `mesh` 是一个对象，当作为普通对象的键时，会被自动转换为字符串 `"[object Object]"`，导致所有对象都映射到同一个值。

---

## 📝 总结

Three.js 使用 `new WeakMap()` 而不是 `{}` 来存储对象相关的元数据，主要是为了：

- ✅ 避免内存泄漏（自动垃圾回收）
- ✅ 提高封装性（不在对象上添加属性）
- ✅ 支持模块化扩展（各模块独立存储）

因此，在需要将额外信息绑定到对象上、又不想影响对象本身或引起内存问题的情况下，`WeakMap` 是更安全、更现代的选择。


如果你正在阅读的是 Three.js 渲染器源码（如 `WebGLRenderer`、`WebGLGeometries` 等），你会发现 `WeakMap` 被广泛用于缓存几何体、材质、程序等资源的状态，是非常关键的设计模式之一。

