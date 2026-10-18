import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const cli = fileURLToPath(new URL("../node_modules/@tauri-apps/cli/tauri.js", import.meta.url));

if (!existsSync(cli)) {
  console.error("Tauri CLI 未安装，请先运行 npm install。");
  process.exit(1);
}

function findWindowsBuildEnvironment() {
  const vswhere = join(
    process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)",
    "Microsoft Visual Studio", "Installer", "vswhere.exe",
  );
  if (!existsSync(vswhere)) {
    throw new Error("未找到 Visual Studio Installer 的 vswhere.exe，请安装 Visual Studio C++ 桌面开发组件。");
  }

  const result = spawnSync(vswhere, [
    "-all", "-products", "*", "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "-property", "installationPath",
  ], { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error("无法通过 vswhere 检查 Visual Studio 安装。");
  }

  const installations = result.stdout.split(/\r?\n/).map((path) => path.trim()).filter(Boolean);
  for (const installation of installations) {
    const vcvars = join(installation, "VC", "Auxiliary", "Build", "vcvars64.bat");
    if (!existsSync(vcvars)) continue;

    const setup = spawnSync(process.env.ComSpec ?? "cmd.exe", [
      "/d", "/s", "/c", `chcp 65001 >nul && call "${vcvars}" >nul && set`,
    ], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024, windowsVerbatimArguments: true });
    if (setup.error || setup.status !== 0) continue;

    const env = { ...process.env };
    for (const line of setup.stdout.split(/\r?\n/)) {
      const separator = line.indexOf("=");
      if (separator > 0) env[line.slice(0, separator)] = line.slice(separator + 1);
    }

    const libraryPaths = (env.LIB ?? "").split(delimiter);
    const hasLibrary = (name) => libraryPaths.some((path) => path && existsSync(join(path, name)));
    if (hasLibrary("msvcrt.lib") && hasLibrary("kernel32.lib")) {
      console.log(`使用 Visual Studio 编译环境：${installation}`);
      return env;
    }
  }

  throw new Error("未找到包含 C++ 运行时库和 Windows SDK 的 Visual Studio 安装。请在 Visual Studio Installer 中补装 C++ 桌面开发组件及 Windows SDK。");
}

let env = process.env;
const needsWindowsBuildEnvironment = args[0] === "dev" || args[0] === "build"
  || (args[0] === "android" && (args[1] === "dev" || args[1] === "build"));
if (process.platform === "win32" && needsWindowsBuildEnvironment) {
  try {
    env = findWindowsBuildEnvironment();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const child = spawn(process.execPath, [cli, ...args], { env, stdio: "inherit" });
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
