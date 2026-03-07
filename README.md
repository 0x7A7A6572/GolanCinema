# 勾栏观影 - Golan Cinema

这是一个 Tampermonkey (篡改猴) 脚本框架，用于管理和调用自定义的视频解析接口。本工具仅提供界面框架，不包含任何具体的解析功能，支持用户自行添加、删除、启用和禁用接口。

## 功能特点

*   **多平台支持**：脚本框架适配爱奇艺、优酷、腾讯视频、B站 等主流视频网站页面。
*   **接口管理**：可以自由添加、删除或修改自定义接口。


## 前置要求 (必读)

**本脚本需要搭配用户脚本管理器使用。**

请先在您的浏览器中安装 **Tampermonkey (篡改猴)** 插件：

*   [Chrome 篡改猴](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
*   [Firefox 篡改猴](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
*   [Edge 篡改猴](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

## 安装步骤

1.  确保已安装 **Tampermonkey (篡改猴)** 插件。
2.  点击浏览器右上角的 Tampermonkey 图标，选择“添加新脚本” (Create a new script)。
3.  将本项目中的 `golan-cinema.js` 文件代码完整复制。
4.  在 Tampermonkey 编辑器中全选并覆盖原有内容，粘贴刚才复制的代码。
5.  按下 `Ctrl+S` 保存脚本。

## 使用说明

1.  打开任意支持的视频播放页面（如爱奇艺、腾讯视频）。
2.  在页面左侧找到悬浮的图标。
3.  鼠标悬停在图标上，菜单会自动展开。
4.  **选择线路**：点击列表中的自定义接口，即可跳转或在当前页面加载。
5.  **自定义配置**：
    *   **新增**：点击底部的“新增”按钮添加新的自定义接口。
    *   **删除**：点击接口旁的删除图标移除不需要的接口。
    *   **恢复默认**：如果误操作，可以重置为默认接口列表。
6.  **内嵌窗口播放**：点击接口旁的播放图标，视频将在当前页面内嵌播放，支持手动指定播放位置。
7.  **置顶接口**：点击接口旁的置顶图标，将该接口固定在顶部，方便快速访问。

## 支持站点

*   爱奇艺 (iqiyi.com)
*   优酷 (youku.com)
*   乐视 (le.com)
*   腾讯视频 (v.qq.com)
*   以及更多...

## 免责声明

本脚本仅是一个用户脚本管理器框架，**不包含任何视频解析、破解或非法功能**。所有接口均由用户自行配置，脚本仅负责界面展示与跳转。
请勿用于非法用途，请尊重视频平台的版权，支持正版。
