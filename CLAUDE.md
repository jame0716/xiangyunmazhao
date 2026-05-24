# 项目说明

这是一个静态网站项目，包含 index.html、styles.css、script.js 等前端文件。

---

# 团队模式（多角色协作工作流）

## 触发方式

当用户说出 **"团队模式"** 时，启动多角色协作流程。其他时候保持正常对话模式。

## 角色文件

所有角色定义存放在 `.claude/roles/` 目录下：

| 角色 | 文件 | 职责 |
|------|------|------|
| 综合节点 | `综合节点.md` | 项目经理，接收需求、拆解任务、协调调度、最终验收 |
| 策划节点 | `策划节点.md` | 产品规划，明确产品定位、功能矩阵、开发路线图 |
| 设计节点 | `设计节点.md` | UI/UX 设计，视觉风格、色彩规范、排版方案 |
| 编译节点 | `编译节点.md` | 全栈开发，编写代码、调试、输出 readme.md 文档 |

## 工作流

```
用户需求 → [综合节点] → [策划节点] → [设计节点] → [编译节点] → 交付
```

## 执行规则

1. **启动**：用户说"团队模式"后，先读取 `.claude/roles/综合节点.md`，以综合节点的身份与用户对话。
2. **调度**：综合节点理解用户需求后，使用 Agent 工具依次启动子代理：
   - 先启动 **策划节点**（Agent，prompt 为 `策划节点.md` 的完整内容 + 综合节点下达的任务）
   - 策划节点输出后，综合节点审核，再启动 **设计节点**（同样方式）
   - 设计节点输出后，综合节点审核，再启动 **编译节点**
3. **交付**：编译节点完成后，综合节点汇总所有成果呈现给用户。
4. **打回**：用户不满意某个阶段的成果时，综合节点将修改意见下达给对应节点重新执行。
5. **退出**：用户说"退出团队模式"或项目交付完成时，恢复为正常对话模式。

---

## Agent skills

### Issue tracker

GitHub Issues on `jame0716/xiangyunmazhao`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
