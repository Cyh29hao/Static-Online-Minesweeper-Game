# 静态扫雷 Ver0.3

一个可直接打开游玩的单文件扫雷网页。

## 本地使用

1. 双击 `index.html`
2. 用浏览器打开后直接开始玩

## 操作

- 电脑：左键确认安全，右键插旗，再右键可取消旗子
- 手机：轻点确认安全，长按插旗，轻点旗子可取消
- 踩雷后：可撤回这一步 1 次，或直接查看答案

## 发布到 GitHub Pages

最省事的做法：把 **version0.3 文件夹里的内容** 上传到仓库根目录，而不是把整个 `version0.3` 文件夹再套一层上传。

### 方式 A：网页上传

1. 在 GitHub 新建一个空仓库
2. 把 `index.html`、`README.md`、`.nojekyll` 这 3 个文件上传到仓库根目录
3. 打开仓库的 `Settings`
4. 进入 `Pages`
5. 在 `Build and deployment` 里选择 `Deploy from a branch`
6. Branch 选 `main`，目录选 `/ (root)`
7. 点 `Save`
8. 等 1 到 2 分钟，打开页面给出的链接

### 方式 B：Git 命令上传

```bash
git init
git add .
git commit -m "publish v0.3"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

然后按上面的第 3 到第 8 步开启 Pages。

## GitHub Pages 链接格式

开启成功后，链接一般是：

```text
https://你的用户名.github.io/你的仓库名/
```

只要仓库根目录里有 `index.html`，别人点开链接就能直接玩。
