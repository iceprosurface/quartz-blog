/// <reference types="vite/client" />
// import data from "./test.excalidraw.md?raw";
import data2 from './背包功能逻辑.excalidraw.md?raw';
import { decodeData, mountApp } from "./lib";

mountApp(document.getElementById("app")!, decodeData(data2), {
  width: 400,
  height: 500
});