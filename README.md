# 静态扫雷 Ver0.4

一个可本地打开、也可直接部署到 GitHub Pages 的静态扫雷网页。

## 本地使用

1. 打开 `version0.4` 文件夹
2. 双击 `index.html`
3. 保持 `app.js` 和 `index.html` 在同一目录即可直接游玩

## 操作

- 电脑：左键确认安全，右键插旗；对着旗子再右键一次可取消
- 手机：轻点确认安全，长按插旗；松手后再长按旗子可取消
- 踩雷后：可撤回这一步 1 次，或直接查看答案

## 排行榜

Ver0.4 默认自带本机排行榜：

- 每张图分别统计通关人次、最快用时、前三名
- 如果没有配置在线后端，成绩只保存在当前这台设备的浏览器里

如果你想让 GitHub Pages 上的所有玩家共享同一份排行榜，需要额外配置 Supabase。

### 1. 在 Supabase 建表

把 [supabase-schema.sql](./supabase-schema.sql) 里的 SQL 复制到 Supabase 的 SQL Editor 执行。

### 2. 打开匿名写入权限

这个示例表是公开读、匿名写的轻量配置，适合小游戏排行榜。

### 3. 填入 `app.js` 配置

打开 [app.js](./app.js)，把最上面的 `SCORE_CONFIG` 改成你自己的值：

```js
const SCORE_CONFIG = {
  supabaseUrl: "https://你的项目.supabase.co",
  anonKey: "你的 anon key",
  table: "minesweeper_scores"
};
```

填好后重新上传文件，网页就会自动切到在线排行榜。

## 用 Ver0.4 覆盖你现在的 GitHub Pages

你当前链接是：

```text
https://cyh29hao.github.io/Static-Online-Minesweeper-Game/
```

要保持这个链接不变，只需要把仓库根目录里的旧版文件替换成 `version0.4` 里的新版文件。

### 最省事的方法：网页替换

1. 打开你的仓库 `Static-Online-Minesweeper-Game`
2. 删除仓库根目录里的旧 `index.html`、旧 `README.md`、旧 `.nojekyll`
3. 上传 `version0.4` 里的这 5 个文件到仓库根目录：
   - `index.html`
   - `app.js`
   - `README.md`
   - `.nojekyll`
   - `supabase-schema.sql`
4. 等 GitHub Pages 自动重新部署
5. 1 到 2 分钟后刷新原链接

### 用 Git 命令覆盖

在 `version0.4` 目录里执行：

```bash
git init
git add .
git commit -m "publish v0.4"
git branch -M main
git remote add origin https://github.com/cyh29hao/Static-Online-Minesweeper-Game.git
git push -f origin main
```

如果你的仓库已经有内容，更稳的方式是直接在原仓库里把根目录文件替换后再提交，而不是新建仓库。

## GitHub Pages 注意事项

- Pages 仍然选择 `main` 分支和 `/ (root)`
- 仓库根目录必须有 `index.html`
- `index.html` 和 `app.js` 必须放在同一层目录
- 如果改了 `app.js` 里的排行榜配置，记得一起重新上传
