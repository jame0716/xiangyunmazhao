# Matt Pocock Skills — 使用指南

## 安装概况

已安装 **14 个 Skill**，存放在 `.agents/skills/`，symlink 到 `.claude/skills/`。

## 配置摘要

| 配置项 | 选择 |
|--------|------|
| Issue 追踪器 | GitHub (`jame0716/xiangyunmazhao`) |
| Triage 标签 | 默认5种标签 |
| Domain 文档 | 单上下文 (`CONTEXT.md` + `docs/adr/`) |

配置文件位置：
- `CLAUDE.md` → `## Agent skills` 区块
- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

---

## 14 个 Skill 速查表

### 📋 规划类 — 写代码前先想清楚

| 命令 | 作用 | 适用场景 |
|------|------|----------|
| `/to-prd` | 需求 → 结构化 PRD 文档 | 接到新需求时 |
| `/to-issues` | PRD → 拆解为 Issue 列表 | PRD 完成后 |
| `/grill-me` | 拷问方案，找出逻辑漏洞 | 方案确定后、动工前 |
| `/grill-with-docs` | 基于项目文档考问方案 | 有 CONTEXT.md 后 |
| `/zoom-out` | 跳出细节，架构全局审视 | 定期回顾 |

### 💻 开发类

| 命令 | 作用 | 适用场景 |
|------|------|----------|
| `/tdd` | 红-绿-重构 TDD 循环 | 日常开发 |
| `/diagnose` | 复现→定位→修复→验证 | 遇到 Bug |
| `/improve-codebase-architecture` | 诊断架构问题并改进 | 代码变乱时 |
| `/prototype` | 快速原型验证 | 探索可行性 |

### 🏷️ 项目管理

| 命令 | 作用 | 适用场景 |
|------|------|----------|
| `/triage` | Issue 分类、优先级排序、分配 | Issue 积压时 |
| `/handoff` | Agent 间无损耗上下文交接 | 切换 Agent 时 |

### 🛠️ 工具

| 命令 | 作用 | 适用场景 |
|------|------|----------|
| `/caveman` | 极限压缩 token，最少字最大信息 | Token 紧张时 |
| `/write-a-skill` | 编写自定义 Skill | 想扩展时 |

---

## 典型工作流

```
/setup-matt-pocock-skills   ← 已完成，无需再运行
  ↓
/to-prd       需求来了先写 PRD
  ↓
/to-issues    PRD 拆成具体 Issue
  ↓
/grill-me     动工前审视方案
  ↓
/tdd          用 TDD 方式开发（或直接写）
  ↓
/diagnose     遇到 Bug
  ↓
/triage       管理 Issue 状态
```

## 更多信息

- 官方仓库: https://github.com/mattpocock/skills
- 中文翻译: https://github.com/vinvcn/mattpocock-skills-zh-CN
