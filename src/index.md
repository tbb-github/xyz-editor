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