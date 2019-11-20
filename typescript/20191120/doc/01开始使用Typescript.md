# 开始使用 TypeScript
原文：https://juejin.im/book/5da08714518825520e6bb810/section/5da0874f518825237369ef68

## 安装 TypeScript
```npm
npm install -g TypeScript
```
## 创建环境
创建 src 目录：
```
src/index.ts
```

用npm将目录初始化：
```
npm init
```

此时我们要使用 TypeScript 的话通常也需要初始化：
```
tsc --init
```
这个时候你会发现目录下多了一个`tsconfig.json`文件.

```json
{
  "compilerOptions": {
    "target": "es5",                            // 指定 ECMAScript 目标版本: 'ES5'
    "module": "commonjs",                       // 指定使用模块: 'commonjs', 'amd', 'system', 'umd' or 'es2015'
    "moduleResolution": "node",                 // 选择模块解析策略
    "experimentalDecorators": true,             // 启用实验性的ES装饰器
    "allowSyntheticDefaultImports": true,       // 允许从没有设置默认导出的模块中默认导入。
    "sourceMap": true,                          // 把 ts 文件编译成 js 文件的时候，同时生成对应的 map 文件
    "strict": true,                             // 启用所有严格类型检查选项
    "noImplicitAny": true,                      // 在表达式和声明上有隐含的 any类型时报错
    "alwaysStrict": true,                       // 以严格模式检查模块，并在每个文件里加入 'use strict'
    "declaration": true,                        // 生成相应的.d.ts文件
    "removeComments": true,                     // 删除编译后的所有的注释
    "noImplicitReturns": true,                  // 不是函数的所有返回路径都有返回值时报错
    "importHelpers": true,                      // 从 tslib 导入辅助工具函数
    "lib": ["es6", "dom"],                      // 指定要包含在编译中的库文件
    "typeRoots": ["node_modules/@types"],
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [                                  // 需要编译的ts文件一个*表示文件匹配**表示忽略文件的深度问题
    "./src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
  ]
}
```

package.json:

```json
"scripts": {
    "build": "tsc",
    "dev": "tsc -w"
  },
```


./src/index.ts  :
```ts
function greeter(person: string) {
    return "Hello, " + person
}

const user = "Jane User"
```

运行`npm run dev`
## 
