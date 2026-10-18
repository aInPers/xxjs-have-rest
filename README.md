# 信职请假系统

基于 React、Vite 和 Tauri 2 的请假信息展示应用，支持 Windows 桌面端，并提供 Android、iOS 构建配置。请假设置保存在设备本地的 IndexedDB 中。

## 项目结构与规则

- `src/main.tsx`：React 入口；`src/app/`：应用切页逻辑。
- `src/features/`：按聊天、设置、关于、请假功能存放页面、样式、数据与本地存储代码；`src/shared/`：多个功能共用的版本信息。
- `assets/`：页面共用的图片和图标。
- `src-tauri/`：Tauri 原生项目，配置和 Rust 源码必须提交到版本库；`target/` 等生成文件由 `src-tauri/.gitignore` 排除。
- `scripts/tauri.mjs`：Windows 桌面开发和构建时通过 Visual Studio Installer 自动加载完整的 MSVC 与 Windows SDK 环境；其他 Tauri 命令直接交给官方 CLI。
- `vite.config.ts` 固定使用端口 `1420`，需与 `src-tauri/tauri.conf.json` 的 `build.devUrl` 保持一致。
- `src-tauri/tauri.conf.json` 将 Windows 桌面预览窗口固定为 390 × 844 逻辑像素，对应手机竖屏布局。
- 优先使用 Tauri CLI 和官方插件配置原生能力，避免手动复制生成文件。

## Windows 开发

安装 Node.js、带有 C++ 桌面开发组件及 Windows SDK 的 Visual Studio、WebView2 和 Rust 的 Windows MSVC 工具链。在普通 PowerShell 的项目目录运行：

```sh
rustup toolchain install stable-x86_64-pc-windows-msvc
rustup override set stable-x86_64-pc-windows-msvc
npm install
npm run tauri dev
```

启动脚本会在 Windows 桌面 `dev`、`build` 命令中自动选择包含 `msvcrt.lib` 和 `kernel32.lib` 的 Visual Studio 安装。如果没有可用安装，会提示补装 C++ 桌面开发组件及 Windows SDK。

只调试网页时可运行 `npm run dev`。构建前端运行 `npm run build`；构建桌面安装包运行 `npm run tauri build`。

## 移动端

移动端还需要安装对应平台的 Tauri 前置工具链。Android 使用 Android SDK、NDK 和 Java；iOS 需要 macOS 与 Xcode。首次在本机生成平台工程后再开发或构建：

```sh
npm run tauri android init
npm run tauri android dev
npm run tauri -- android build --apk
```

Windows 上的 Android `dev` 和 `build` 命令会自动加载 Visual Studio C++ 与 Windows SDK 编译环境。首次构建前需配置 Android SDK、NDK 与 JDK 的环境变量。通用 release APK 输出在 `src-tauri/gen/android/app/build/outputs/apk/universal/release/`；未配置签名时生成的 `-unsigned.apk` 不能直接安装，发布前须用长期保存的签名密钥签名。本机签名密钥与密码保存在被 Git 忽略的 `release-signing/`，必须安全备份；以后发布更新时需要使用同一密钥。

```sh
npm run tauri ios init
npm run tauri ios dev
npm run tauri ios build
```

## 功能

可设置请假人、起止时间、节次、类型、原因、是否住校、证明图片，以及家长、班主任、学生科、领导、校医的审批状态。校医勾选后在主流程显示已批准，未勾选时可在无需审批角色中展开查看；校医通过不影响整单的任一审批结果。请假天数和总节数自动计算，并在设置页和详情页显示。总节数包含起止节次；跑操、午休、晚自习各计一节，跨天时中间完整日期每天计 10 节。

设置中的“自动设置为当天”默认关闭。开启后，请假开始和结束日期按设备本地日期显示为当天，日期输入暂不可编辑；跨天及应用重新打开后会更新。关闭后可手动选择日期，旧版保存的数据按关闭处理。

移动端页面使用系统提供的安全区域间距，为顶部状态栏和底部手势条或导航键留出位置；桌面端不额外预留固定状态栏空白。

应用以聊天列表为首页。Android 系统返回键在其他页面返回聊天列表；在聊天列表第一次返回会提示，2 秒内再次返回退出应用。Android 主 Activity 在恢复时重新注册返回回调，应对运行中切换系统导航模式后的返回。iOS 可用页面内的返回按钮回到聊天列表。

MIT 协议。
