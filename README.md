# 骡马 LuoMa · Android 磁力链播放器

**骡马（LuoMa）** 是一款 Android 磁力链播放器：粘贴磁力链接或选择 `.torrent` 种子文件即可开始下载，支持**多任务同时下载**、**边下边播**与**断点续传**。

下载引擎基于 [libtorrent4j](https://github.com/arvidn/libtorrent)（libtorrent-rasterbar），播放基于 ExoPlayer，界面用 React Native 构建，整体为深色霓虹风格。

本仓库是**官方 APK 下载页**。源码仓库为私有。

- 功能展示页：<https://luoma.muri.life/>
- 下载最新版：<https://github.com/AchooLuv/LuoMaAPK/releases/latest>

---

## 下载

| | |
|---|---|
| 最新版本 | [Releases](../../releases/latest) |
| 架构 | 仅 **arm64-v8a**（其他架构设备无法安装） |
| 系统要求 | Android 9（API 28）及以上 |
| 应用大小 | 约 18.7 MB |

> 只支持 arm64-v8a：下载引擎的原生库只提供了这个架构的构建产物。

## 安装

1. 下载 `.apk` 文件
2. 系统会提示「未知来源应用」，需要允许安装
3. 安装完成后打开即用，无需注册或登录

## 功能特性

### 一键解析

- 直接粘贴**磁力链接**（`magnet:?xt=urn:btih:...`），无需先下载种子文件
- 也可以从本地选择 `.torrent` **种子文件**
- 多文件种子可单独选择要下载的那一个

### 边下边播

- 内置本地 HTTP Range 服务，配合 ExoPlayer **无需等待下载完成**即可播放
- 按播放位置动态调度分片优先级，优先下载正在观看的部分
- 支持全屏横屏播放，系统返回键退出全屏

### 多任务并行

- 多个**磁力任务同时下载**，可单独或批量暂停／继续
- **下载／上传限速**，任务优先级分高／普通／低
- 每个任务独立保存进度，**断点续传**，关闭应用后重新打开可继续
- 历史记录按加入时间分组，可标记死种并一键清理

## 常见问题

**Q：为什么装不上，提示「应用未安装」？**

只支持 arm64-v8a 架构。2019 年之后的主流 Android 手机基本都是这个架构，但少数低端机或模拟器可能是 armeabi-v7a / x86_64，无法安装。

**Q：会消耗多少流量？**

只在你添加任务并开始下载时消耗。上传是 BT 协议的一部分（下载的同时会向其他 peer 提供已下载的分片），可以在设置里把上传限速调到最低。

**Q：关闭应用后下载会继续吗？**

不会。应用退到后台会继续下载，但完全退出进程后下载停止。重新打开会从上次的进度**断点续传**，不会重新开始。

**Q：下载的文件在哪里？**

在应用私有目录内。卸载应用会**连同已下载的文件一起删除**，需要保留的内容请提前导出。

**Q：为什么有的种子一直没速度？**

BT 下载速度完全取决于有多少人在做种。界面上会标记「死种」（长时间拿不到元数据或始终没有做种者），但那只是提示，不代表绝对不可用 —— 冷门资源可能只是暂时没人。

**Q：需要 root 或特殊权限吗？**

不需要。只需要网络权限。

## 技术信息

| | |
|---|---|
| 底层 | libtorrent-rasterbar |
| 下载引擎 | libtorrent4j |
| 界面框架 | React Native |
| 播放器 | ExoPlayer |
| 支持架构 | arm64-v8a |

## 关于本仓库

仓库根目录同时是功能展示页的源码 —— 纯静态站点，**无需构建**：

```
index.html    页面结构与文案
styles.css    样式（配色取自 APP 的 colorConfig.ts）
app.js        分页导航 + 键盘方向键 + 拉取最新版本信息
assets/       应用图标与分享图
robots.txt    搜索引擎抓取规则
sitemap.xml   站点地图
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

线上地址 <https://luoma.muri.life/>，域名在 Vercel 项目的 Domains 里配置。

页面里的版本号、APK 文件名与大小由 `app.js` 在浏览器端调用 GitHub API
（`/repos/AchooLuv/LuoMaAPK/releases/latest`）自动填充，**发新版本无需改代码**。
接口不可用时会退回指向 Releases 页面的固定链接，页面照常可用。

## 说明

- 校验值（MD5 / SHA256）写在每个 Release 的说明里，可自行比对
- 下载内容保存在应用私有目录，**卸载应用会一并删除**
- 该应用用于磁力链／种子的下载与播放，请仅用于合法内容
