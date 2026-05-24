# DeepSeek 网页版 — 训练数据生成 Prompt

> 目标：生成 1400 条 Cline 文本层适配数据
> 格式：JSONL，一行一个 JSON，保存为 `F:\ai-training\data-cline.jsonl`

---

## 复制以下内容发给 DeepSeek

```
请帮我生成 1400 条 AI 编程助手的训练数据，格式为 JSONL，每行一个 JSON 对象。

═══════════════════════════════════════
输出格式（严格按此格式，不要修改）：
═══════════════════════════════════════

{"instruction": "用户说的话", "tool_call": "AI的工具调用XML", "output": "AI的文字回应"}

═══════════════════════════════════════
工具 XML 格式（必须严格遵守）：
═══════════════════════════════════════

<read_file>
<path>文件路径</path>
</read_file>

<write_to_file>
<path>文件路径</path>
<content>
代码内容
</content>
</write_to_file>

<execute_command>
<command>命令</command>
<requires_approval>false</requires_approval>
</execute_command>

<search_files>
<pattern>匹配模式如**/*.py</pattern>
</search_files>

<list_files>
<path>目录路径</path>
<depth>1</depth>
</list_files>

═══════════════════════════════════════
要求：
═══════════════════════════════════════

1. tool_call 是纯 XML，不要加"我叫工具:"前缀
2. XML 标签内的文本独占一行，有缩进
3. 多工具调用之间用两个空行隔开
4. 不需要工具时 tool_call 为空字符串 ""
5. instruction 用中文，涉及真实编程场景
6. 总共 1400 条，按以下分配：

═══════════════════════════════════════
各类型数量分配：
═══════════════════════════════════════

类型A：读文件场景 (300条)
  instruction: "看看 xxx 文件的内容" "打开 xxx 看一下"
  tool_call: <read_file><path>xxx</path></read_file>
  output: "正在读取 xxx。"

类型B：写文件场景 (250条)
  instruction: "创建 xxx 文件" "写一个 xxx 脚本"
  tool_call: <write_to_file><path>xxx</path><content>代码</content></write_to_file>
  output: "正在创建 xxx。"

类型C：执行命令场景 (250条)
  instruction: "运行测试" "安装依赖" "构建项目"
  tool_call: <execute_command><command>具体命令</command><requires_approval>false</requires_approval></execute_command>
  output: "正在执行命令。"

类型D：搜索文件场景 (150条)
  instruction: "找所有 Python 文件" "搜索配置文件"
  tool_call: <search_files><pattern>**/*.py</pattern></search_files>
  output: "正在搜索。"

类型E：列目录场景 (100条)
  instruction: "看看 src 目录有什么" "列出当前目录"
  tool_call: <list_files><path>src</path><depth>1</depth></list_files>
  output: "正在列目录。"

类型F：多轮对话 (400条)
  instruction: 模拟完整对话，先用工具得到结果，再执行下一步
  tool_call: 包含2-4个工具调用的XML，之间用两个空行隔开
  output: "正在分步执行。"

类型G：不需要工具 (150条)
  instruction: "Python的list和tuple区别" "什么是闭包" 等纯知识问答
  tool_call: ""
  output: 简洁的知识回答

═══════════════════════════════════════
正确示例：
═══════════════════════════════════════

{"instruction": "看看 src/main.py 的内容", "tool_call": "<read_file>\n<path>src/main.py</path>\n</read_file>", "output": "正在读取 src/main.py。"}

{"instruction": "创建一个用户登录接口", "tool_call": "<write_to_file>\n<path>src/api/auth.py</path>\n<content>\nfrom fastapi import APIRouter\nrouter = APIRouter()\n\n@router.post(\"/login\")\nasync def login(username: str, password: str):\n    return {\"token\": \"xxx\"}\n</content>\n</write_to_file>", "output": "正在创建 src/api/auth.py。"}

{"instruction": "安装依赖并运行测试", "tool_call": "<execute_command>\n<command>pip install -r requirements.txt</command>\n<requires_approval>false</requires_approval>\n</execute_command>\n\n<execute_command>\n<command>pytest tests/ -v</command>\n<requires_approval>false</requires_approval>\n</execute_command>", "output": "先装依赖，再跑测试。"}

{"instruction": "Python 的 GIL 是什么", "tool_call": "", "output": "GIL 是全局解释器锁，同一时刻只有一个线程执行 Python 字节码。"}

═══════════════════════════════════════
请开始生成，直接输出 JSONL 格式，每行一个完整 JSON 对象。
不要加代码块标记，不要加额外说明。
═══════════════════════════════════════
```

---

## 使用说明

1. 打开 [DeepSeek 网页版](https://chat.deepseek.com)
2. 粘贴上面的 prompt
3. 把输出的 JSONL 内容复制保存为 `F:\ai-training\data-cline.jsonl`
4. 告诉我，我来合并数据并准备训练
