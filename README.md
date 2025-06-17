# LibreTV Portal

LibreTV的官方门户网站，一个美观现代的静态网站，用于介绍LibreTV项目和提供部署指南。

## 🌟 特性

- **现代设计**: 使用最新的Web设计趋势，包括毛玻璃效果、渐变背景等
- **响应式布局**: 完美适配桌面端、平板和移动设备
- **丰富动画**: 集成AOS动画库和Particles.js粒子效果
- **高性能**: 优化的代码和资源，快速加载
- **SEO友好**: 完整的meta标签和结构化数据
- **一键部署**: 支持Vercel、Netlify等平台快速部署

## 🚀 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/LibreSpark/LibreTV.git
cd LibreTV/LibreTV-portal
```

2. 安装依赖（可选）
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:3000`

### 一键部署

#### Vercel部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LibreSpark/LibreTV/tree/main/LibreTV-portal)

#### Netlify部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LibreSpark/LibreTV)

## 📁 项目结构

```
LibreTV-portal/
├── index.html          # 主页面
├── styles/
│   └── main.css        # 主样式文件
├── scripts/
│   └── main.js         # 主JavaScript文件
├── assets/
│   ├── logo.png        # Logo文件
│   └── logos/          # 各种图标
├── vercel.json         # Vercel配置
├── package.json        # 项目配置
└── README.md          # 说明文档
```

## 🎨 设计特色

- **现代色彩方案**: 以蓝色为主色调的科技感配色
- **流畅动画**: 页面滚动时的渐入动画效果
- **粒子背景**: 动态粒子效果增强视觉体验
- **交互反馈**: 悬停和点击时的丰富交互效果
- **毛玻璃效果**: 现代的半透明毛玻璃元素

## 🛠️ 技术栈

- **HTML5**: 语义化标签和现代特性
- **CSS3**: 
  - CSS Grid和Flexbox布局
  - CSS自定义属性（CSS变量）
  - 现代动画和过渡效果
  - 响应式设计
- **JavaScript (ES6+)**:
  - 现代JavaScript特性
  - Intersection Observer API
  - Web API集成
- **第三方库**:
  - [AOS](https://michalsnik.github.io/aos/) - 滚动动画
  - [Particles.js](https://vincentgarreau.com/particles.js/) - 粒子效果
- **Web字体**: Google Fonts (Inter)

## 📱 响应式设计

网站采用移动优先的响应式设计，确保在各种设备上都有出色的显示效果：

- **桌面端** (≥1200px): 完整的多列布局
- **平板端** (768px-1199px): 适配的两列布局
- **移动端** (≤767px): 单列堆叠布局，优化的导航菜单

## ⚡ 性能优化

- **延迟加载**: 图片懒加载减少初始加载时间
- **代码分割**: JavaScript模块化加载
- **缓存策略**: 静态资源长期缓存
- **压缩优化**: CSS和JavaScript代码压缩
- **CDN加速**: 字体和库文件使用CDN

## 🔧 自定义配置

### 修改主题色彩

在 `styles/main.css` 中修改CSS变量：

```css
:root {
    --primary-color: #00ccff;      /* 主色调 */
    --secondary-color: #ff3c78;    /* 次要色调 */
    --accent-color: #8b5cf6;       /* 强调色 */
    /* ... 其他颜色变量 */
}
```

### 修改粒子效果

在 `scripts/main.js` 中的 `initParticles()` 函数中修改配置：

```javascript
particlesJS('particles-js', {
    particles: {
        number: { value: 50 },     // 粒子数量
        color: { value: '#00ccff' }, // 粒子颜色
        // ... 其他配置
    }
});
```

### 修改动画效果

可以通过修改AOS库的配置来调整动画：

```javascript
AOS.init({
    duration: 800,        // 动画持续时间
    easing: 'ease-out-cubic', // 缓动函数
    once: true,          // 只播放一次
    offset: 100,         // 触发偏移量
});
```

## 📈 SEO优化

网站包含完整的SEO优化：

- **Meta标签**: 完整的描述、关键词和作者信息
- **Open Graph**: 社交媒体分享优化
- **Twitter Cards**: Twitter分享卡片
- **结构化数据**: JSON-LD格式的结构化数据
- **语义化HTML**: 正确的HTML5语义标签
- **友好URL**: 清晰的页面结构和锚点

## 🌐 浏览器支持

- **现代浏览器**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **移动浏览器**: iOS Safari 14+, Chrome Mobile 88+
- **特性降级**: 对不支持的浏览器提供基础功能

## 🔒 安全特性

- **内容安全策略**: 通过HTTP头部实现
- **XSS保护**: X-XSS-Protection头部
- **点击劫持保护**: X-Frame-Options头部
- **MIME类型嗅探保护**: X-Content-Type-Options头部

## 📝 开发指南

### 添加新页面

1. 创建新的HTML文件
2. 在导航菜单中添加链接
3. 确保使用相同的样式和脚本引用

### 修改样式

1. 优先使用CSS变量进行主题修改
2. 遵循现有的命名约定
3. 保持响应式设计兼容性

### 添加新功能

1. 在 `scripts/main.js` 中添加新函数
2. 确保使用现代JavaScript特性
3. 添加必要的错误处理

## 🤝 贡献指南

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目基于MIT许可证开源 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 🙏 致谢

- [AOS](https://michalsnik.github.io/aos/) - 滚动动画库
- [Particles.js](https://vincentgarreau.com/particles.js/) - 粒子效果库
- [Google Fonts](https://fonts.google.com/) - Web字体服务
- [Vercel](https://vercel.com/) - 部署平台

## 📞 联系我们

- **GitHub**: [LibreSpark/LibreTV](https://github.com/LibreSpark/LibreTV)
- **Issues**: [问题反馈](https://github.com/LibreSpark/LibreTV/issues)
- **主项目**: [LibreTV](https://libretv.is-an.org/)

---

**LibreTV Portal** - 自由观影，畅享精彩 🎬
