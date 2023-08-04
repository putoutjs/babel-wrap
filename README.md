## 🗿 Using Babel Plugins with Putout

You can add `Babel` to the `plugins` section of `.putout.json` with `babel/` prefix.

*You can disable a rule, or use a match in a similar way.*

*☝️Remember to omit `babel-plugin-` or `@babel/plugin`: putout will set it up for you :)*

*Example*
Let's add `babel-plugin-transform-inline-consecutive-adds` to `.putout.json`:

```json
{
    "plugins": [
        "babel/transform-inline-consecutive-adds"
    ]
}
```

Then create a file and process it with the help of **Babel Plugin**.

```sh
coderaiser@cloudcmd:~$ cat > a.js
const t = [];
t.push(1);
t.push(2);

coderaiser@cloudcmd:~$ PUTOUT_PRINTER=babel putout a.js -f codeframe
/home/coderaiser/a.js:4:0
  2 | t.push(1);
  3 | t.push(2);
> 4 |
    | ^ transform inline consecutive adds

✖ 1 errors in 1 files
  fixable with the `--fix` option
coderaiser@cloudcmd:~$ putout --fix a.js
coderaiser@cloudcmd:~$ cat a.js
const t = [1, 2];
```

Using 🐊**Putout** as a runner for `babel` `plugins` you can not only change file content, but also see what exactly will be changed. You can use your already written `babel` `plugins` or reuse work in progress plugins made for `babel`,

☝️ *Remember 🐊**Putout** `plugins` gave more accurate information about changing places, and works faster (no need to find information about changes in transformed file).*

### Babel plugins list

Here you can find **Babel Plugins** which feats the most main purpose of 🐊**Putout** and advised to use:

<details><summary><a href="https://babeljs.io/docs/en/babel-plugin-transform-inline-consecutive-adds">transform-inline-consecutive-adds</a></summary>

```diff
-const foo = {};
-foo.a = 42;
-foo.b = ["hi"];
-foo.c = bar();
-foo.d = "str";
+const foo = {
+  a: 42,
+  b: ["hi"],
+  c: bar(),
+  d: "str"
+};

-const bar = [];
-bar.push(1);
-bar.push(2);
+const bar = [1, 2];
```

</details>

<details><summary><a href="https://github.com/babel/babel/tree/master/codemods/babel-plugin-codemod-object-assign-to-object-spread">codemod-object-assign-to-object-spread</a></summary>

```diff
function merge(a) {
-   return Object.assign({}, a, {
-       hello: 'world'
-   });
+   return {
+       ...a,
+       hello: 'world'
+   };
};
```

</details>

<details><summary><a href="https://github.com/babel/babel/tree/master/codemods/babel-plugin-codemod-optional-catch-binding">codemod-optional-catch-binding</a></summary>

```diff
try {
    throw 0;
-} catch (err) {
+} catch {
    console.log("it failed, but this code executes");
}
```

</details>

<details><summary><a href="https://github.com/putoutjs/babel-plugin-angularjs-annotate">angularjs-annotate</a></summary>

```diff
-angular.module("MyMod").controller("MyCtrl", ($scope, $timeout) => {});
+angular.module("MyMod").controller("MyCtrl", ["$scope", "$timeout", ($scope, $timeout) => {}]);
```

</details>

Please send pull requests with **Babel Plugins** which can be used as codemods, or simplify, fix, makes code more readable.
