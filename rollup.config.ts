import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import replace from "@rollup/plugin-replace";
import autoExternal from "rollup-plugin-auto-external";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";

const input = "src/index.ts";
/**
 * 由于use-sync-external-store该包只导出了CJS模块
 * 所以这里需要做一个外部扩展单独的特殊识别
 * 否则代码里的特殊导出处理则无效了
 */
const external = ["use-sync-external-store/shim"];
const plugins = [
  nodeResolve(),
  babel({
    exclude: "node_modules/**",
    babelHelpers: "bundled",
  }),
  typescript(),
  autoExternal(),
  terser(),
];

const curDate = new Date();
const curDay = curDate.getDate();
// 打包文件的头部声明
const banner =
  "/**\n" +
  " * react-hooks-simple-state\n" +
  " * 一款简单易用的React数据状态管理器\n" +
  " * created by jokerma <linlovexiaojun@gmail.com>\n" +
  ` * (c) 2024-01-11-${curDate.getFullYear()}-${curDate.getMonth() + 1}-${curDay < 10 ? `0${curDay}` : curDay}\n` +
  " * Released under the MIT License.\n" +
  " */";

export default [
  // CJS
  {
    input,
    output: {
      file: "dist/react-hook-simple-state.cjs.js",
      format: "cjs",
      exports: "auto",
    },
    external: [...external],
    plugins: [
      ...plugins,
      replace({
        preventAssignment: true,
      }),
    ]
  },
  // ESM
  {
    input,
    output: {
      file: "dist/react-hook-simple-state.esm.js",
      format: "es",
    },
    external: [...external],
    plugins: [
      ...plugins,
      replace({
        preventAssignment: true,
      }),
    ],
  },
  {
    input,
    output: {
      file: "dist/react-hook-simple-state.d.ts",
      format: "es",
      banner,
    },
    plugins: [dts()],
  },
];
