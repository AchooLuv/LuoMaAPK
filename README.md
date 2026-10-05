# LuoMa APK

[LuoMa](https://github.com/AchooLuv/LuoMa) 的 **APK 发布仓库**。源码仓库是私有的，这里只放编译好的安装包，外加一个展示功能特性的静态落地页。

## 落地页

仓库根目录就是一个纯静态站点，**无需构建**，可直接部署到任意静态托管：

```
index.html    页面结构与文案
styles.css    样式（配色取自 APP 的 colorConfig.ts）
app.js        分页导航 + 键盘方向键 + 拉取最新版本信息
assets/       应用图标
```

本地预览：

```bash
python -m http.server 8000
```

### 部署到 Vercel

1. 在 Vercel 里 **Add New → Project**，导入本仓库
2. Framework Preset 选 **Other**（没有 `package.json`，Vercel 会按静态站点处理）
3. Build Command 与 Output Directory **留空**，Root Directory 保持仓库根目录
4. Deploy

页面里的版本号、APK 文件名与大小由 `app.js` 在浏览器端调用 GitHub API
（`/repos/AchooLuv/LuoMaAPK/releases/latest`）自动填充，**发新版本无需改代码**。
接口不可用时会退回指向 Releases 页面的固定链接，页面照常可用。

## 下载

到 [Releases](../../releases) 页面下载最新版本。

| | |
|---|---|
| 架构 | 仅 **arm64-v8a**（其他架构设备无法安装） |
| 系统要求 | Android 9（API 28）及以上 |

## 安装

1. 下载 `.apk` 文件
2. 系统会提示「未知来源应用」，需要允许安装

## 说明

- 校验值（MD5 / SHA256）写在每个 Release 的说明里，可自行比对
- 下载内容保存在应用私有目录，**卸载应用会一并删除**
- 该应用用于磁力链／种子的下载与播放，请仅用于合法内容
