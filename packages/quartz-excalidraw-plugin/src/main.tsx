/// <reference types="vite/client" />
import data from "./test.excalidraw.md?raw";
// import data from './背包功能逻辑.excalidraw.md?raw';
import { decodeData, mountApp } from "./lib";

console.log(decodeData(data))
mountApp(document.getElementById("app")!, decodeData(data), {
  width: 400,
  height: 500
});