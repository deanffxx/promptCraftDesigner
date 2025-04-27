# 提示词工具（React + Vite + Ant Design + Electron）

## 项目简介

本项目是一个基于 React + Vite + Ant Design 的智能提示词工具，支持下拉选项自定义、内容生成、复制等功能。已支持一键打包为桌面应用（Windows/Mac），客户无需本地服务器即可直接使用。

---

## 主要功能
- 智能提示词输入与输出
- 下拉选项自定义、增删改
- 选项配置弹窗
- 一键复制内容
- 暗色主题，界面美观
- 支持打包为桌面应用（Electron）

---

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发环境：
   ```bash
   npm run dev
   ```
3. 访问：浏览器打开 [http://localhost:5173](http://localhost:5173)

---

## 打包为静态资源

1. 打包：
   ```bash
   npm run build
   ```
2. 生成的静态资源在 `dist/` 目录。
3. **注意：** 直接双击 `index.html` 可能因浏览器安全策略无法正常访问，推荐用本地服务器或打包为桌面应用。

---

## 打包为桌面应用（Electron）

### 1. 安装 Electron 相关依赖
```bash
npm install --save-dev electron electron-builder
```

### 2. 新建 Electron 主进程文件
在项目根目录新建 `electron-main.js`：
```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 3. 修改 `package.json` 脚本
```json
"main": "electron-main.js",
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "electron": "electron .",
  "dist": "npm run build && electron-builder"
}
```

### 4. 配置 electron-builder（可选）
在 `package.json` 增加：
```json
"build": {
  "appId": "com.yourcompany.yourapp",
  "productName": "提示词工具",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron-main.js"
  ]
}
```

### 5. 打包流程
1. 运行 `npm run build` 生成前端静态资源
2. 运行 `npm run electron` 本地调试桌面应用
3. 运行 `npm run dist` 生成安装包（Windows 为 exe，Mac 为 dmg/app）

---

## 常见问题
- **为什么不能直接双击 index.html 访问？**
  > 现代浏览器安全策略限制，建议用本地服务器或桌面应用。
- **如何让客户一键使用？**
  > 推荐用 Electron 打包为桌面应用，客户双击即可用。
- **如何支持 Win/Mac？**
  > 在对应平台打包即可，或用云端自动化工具（如 GitHub Actions）多平台打包。

---

## 反馈与支持
如有问题或建议，请联系开发者。
