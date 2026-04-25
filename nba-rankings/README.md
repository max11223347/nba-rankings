# NBARankPro - 部署指南

## 部署到 Vercel（免费）

### 方式一：命令行部署（推荐）

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 部署
```bash
cd c:\Users\阿马\.openclaw\workspace\nba-rankings
vercel
```

按照提示操作即可，完成后会获得一个 `.vercel` 域名，例如：`nba-rankings.vercel.app`

#### 3. 更新代码后重新部署
```bash
vercel --prod
```

---

### 方式二：GitHub 自动化部署

#### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 `+` → `New repository`
3. 仓库名称填写 `nba-rankings`
4. 选择 `Private`（私有）或 `Public`（公开）
5. 点击 `Create repository`

#### 2. 上传代码到 GitHub

**方法 A：使用 GitHub 网页**
1. 在新建的仓库页面，点击 `uploading an existing file`
2. 将 `nba-rankings` 文件夹内的所有文件拖拽上传
3. 点击 `Commit changes`

**方法 B：使用 Git 命令**
```bash
cd c:\Users\阿马\.openclaw\workspace\nba-rankings
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/nba-rankings.git
git push -u origin main
```

#### 3. 连接 Vercel

1. 访问 [vercel.com](https://vercel.com) 并登录（可用 GitHub 账号）
2. 点击 `Add New` → `Project`
3. 选择 `Import Git Repository`
4. 选择你刚才创建的 `nba-rankings` 仓库
5. 点击 `Deploy`

Vercel 会自动检测到这是一个静态网站，直接部署即可。

#### 4. 获取网址

部署完成后，你会获得一个 `.vercel.app` 域名，例如：
```
https://nba-rankings.vercel.app
```

#### 5. 更新代码

每次你更新代码并 push 到 GitHub，Vercel 会自动重新部署。

```bash
# 修改代码后
git add .
git commit -m "更新球员数据"
git push
```

---

### 自定义域名（可选）

1. 在 Vercel 项目设置中找到 `Domains`
2. 输入你的域名（如 `nba.mysite.com`）
3. 按照提示在你的域名提供商处添加 DNS 记录

---

## 目录结构

```
nba-rankings/
├── index.html      # 主页面
├── app.js          # 应用逻辑
├── data.js         # 球员数据
├── vercel.json     # Vercel 配置文件
├── SPEC.md         # 产品规范
└── README.md       # 部署指南（本文件）
```

---

## 常见问题

**Q: 部署需要多久？**
A: 通常 1-2 分钟完成。

**Q: 收费吗？**
A: 个人使用免费，Vercel 有免费额度。

**Q: 能让别人访问吗？**
A: 可以，只要部署成功，任何人都可以通过网址访问。

**Q: 如何更新球员数据？**
A: 直接修改 `data.js` 文件，然后重新部署即可。
