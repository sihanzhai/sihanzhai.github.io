# GitHub Pages 访问日志记录方案

由于GitHub Pages只支持静态文件，无法运行后端服务，这里提供几种适用于GitHub Pages的访问日志记录方案。

## 方案对比

| 方案 | 难度 | 成本 | 推荐度 | 说明 |
|------|------|------|--------|------|
| Logtail | ⭐ 简单 | 免费 | ⭐⭐⭐⭐⭐ | 免费层500MB/月，设置简单 |
| Loggly | ⭐ 简单 | 免费 | ⭐⭐⭐⭐ | 免费层200MB/天 |
| Vercel/Netlify Functions | ⭐⭐ 中等 | 免费 | ⭐⭐⭐⭐ | 需要部署到Vercel/Netlify |

## 推荐方案：使用Logtail（最简单）

### 1. 注册Logtail账号
访问 https://logtail.com 注册免费账号。

### 2. 创建Source
1. 登录后，点击 "Add Source"
2. 选择 "JavaScript" 或 "Custom"
3. 复制 Source Token

### 3. 配置脚本
编辑 `assets/js/visitor-logger-simple.js`，设置：
```javascript
const LOGTAIL_SOURCE_TOKEN = 'your-source-token-here';
```

### 4. 在页面中引入脚本
编辑 `_includes/scripts.html`：
```html
<script src="{{ base_path }}/assets/js/visitor-logger-simple.js"></script>
```

### 5. 查看日志
登录 Logtail 控制台即可查看访问日志，包括：
- IP地址（通过Logtail服务器获取）
- 访问时间
- 访问页面
- 浏览器信息
- 等等

## 方案2：使用Vercel/Netlify Functions

### 使用Vercel
1. 将网站部署到Vercel
2. 创建 `api/log.js`：
```javascript
export default async function handler(req, res) {
  const log = req.body;
  // 保存到数据库或文件
  // 例如：保存到Vercel KV、MongoDB等
  res.json({ success: true });
}
```

### 使用Netlify
1. 将网站部署到Netlify
2. 创建 `netlify/functions/log.js`：
```javascript
exports.handler = async (event, context) => {
  const log = JSON.parse(event.body);
  // 保存日志
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

## 当前实现

当前项目包含以下日志脚本：

1. **visitor-logger-simple.js** - 支持Logtail等第三方服务

## 快速开始

1. 注册 Logtail: https://logtail.com
2. 获取 Source Token
3. 编辑 `assets/js/visitor-logger-simple.js`，设置 `LOGTAIL_SOURCE_TOKEN`
4. 修改 `_includes/scripts.html` 使用 `visitor-logger-simple.js`
5. 部署到GitHub Pages
6. 访问网站，日志会自动记录到Logtail

## 注意事项

1. **IP地址获取**：浏览器端JavaScript无法直接获取真实IP，需要通过服务器端获取。使用Logtail等服务时，IP地址由服务端记录。

2. **隐私保护**：记录访问日志时注意遵守隐私法规（如GDPR）。

3. **性能影响**：所有脚本都设计为异步执行，不会影响页面加载速度。

4. **Token安全**：不要在代码中直接暴露token。对于GitHub Pages，可以考虑：
   - 使用环境变量（通过构建时注入）
   - 使用GitHub Secrets（通过GitHub Actions）
   - 使用serverless function作为中间层

## 查看日志

根据选择的方案：
- **Logtail**: 登录 https://logtail.com 查看
- **自定义API**: 根据你的实现查看

