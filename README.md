# LibreTV Portal

LibreTV的官方门户网站，一个美观现代的静态网站，用于介绍LibreTV项目和提供部署指南。

🌐 **在线访问**: [https://libretv.is-an.org/](https://libretv.is-an.org/)

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

本项目基于Apache-2.0许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

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
