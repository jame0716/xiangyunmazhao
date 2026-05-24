# Qwen2.5-Coder 14B 工具调用微调 — 完整指南（小白版）

> 读完这篇你就知道怎么在云 GPU 上训练自己的 AI 编程助手
> 历时 6 小时，从零到产出 8.4GB 训练版模型

---

## 第一篇：训练篇（科普）

### 1.1 为什么要"训练"大模型

大模型出厂时读了很多书（预训练），但它不懂**你的工作方式**。比如你让它"帮我看看 main.py 写了什么"，它可能直接猜内容，而不是真正去读文件。

训练就是教它：**当用户说 X 时，你应该调用工具 Y**。

### 1.2 什么是 QLoRA

完整训练一个 14B 模型需要 32GB 以上显存。你的笔记本只有 8GB。QLoRA 的思路：

```
完整模型：140 亿参数 × 16bit = 28GB  →  装不下
QLoRA：  140 亿参数 × 4bit = 7GB    →  刚好！
         + LoRA 适配器（2000 万参数）= 0.3GB
         总共约 7.5GB，8GB 显卡跑得动
```

**类比**：原始模型 = 一本百科全书，LoRA 适配器 = 贴在上面的便利贴。你只在便利贴上写字，不动百科全书本身。

### 1.3 训练数据长什么样

```jsonl
{"instruction": "看看 main.py 的内容",
 "tool_call": "我叫工具:\n<read_file>\n<path>main.py</path>\n</read_file>",
 "output": "读取 main.py。"}

{"instruction": "Python 的 list 和 tuple 区别？",
 "tool_call": "",
 "output": "list 可变用 []，tuple 不可变用 ()。"}
```

- `instruction` = 用户说的话
- `tool_call` = AI 应该怎么调用工具（非空 = 需要工具，空 = 直接回答）
- `output` = 简短说明

### 1.4 工具类型

| 工具 | XML标签 | 做什么 |
|------|---------|--------|
| 读文件 | `<read_file><path>文件路径</path></read_file>` | 读取代码 |
| 写文件 | `<write_to_file><path>路径</path><content>代码</content></write_to_file>` | 创建/修改文件 |
| 跑命令 | `<execute_command><command>命令</command><requires_approval>false</requires_approval></execute_command>` | 安装包、构建、测试 |
| 搜文件 | `<search_files><pattern>**/*.py</pattern></search_files>` | 全局搜索 |
| 列目录 | `<list_files><path>src</path><depth>1</depth></list_files>` | 看目录结构 |

---

## 第二篇：GPU 服务器选择

### 2.1 各型号对比

| GPU | 显存 | 价格 | 能训多大模型 | 推荐场景 |
|------|------|------|-------------|---------|
| RTX 3060 | 12GB | ¥0.6/时 | 7B | 入门测试 |
| RTX 3090 | 24GB | ¥1.5/时 | 14B | **性价比之选** |
| RTX 5090 | 32GB | ¥2.78/时 | 14B（更快） | **速度之选** |
| RTX Pro 6000 | 96GB | ¥5.9/时 | 70B | 不推荐（浪费钱） |

### 2.2 为什么选 5090 而不是 Pro 6000

```
14B QLoRA 训练需要约 15GB 显存
5090 有 32GB → 绰绰有余
Pro 6000 有 96GB → 用不到 80GB，白白多花一倍钱
```

> **规则：选刚好够用的 GPU，不选最大的。** 14B 训练 5090 足够，3090 也能跑。

### 2.3 平台选择

| 平台 | 价格 | 特点 |
|------|------|------|
| **AutoDL** | ¥1.5-2.78/时 | 国内，便宜，适合个人 |
| 阿里云 PAI | ¥5-15/时 | 企业级 |
| 矩池云 | ¥1.2/时 | 便宜但卡少 |

> 推荐 AutoDL：充 ¥10 够训 3-4 次。

---

## 第三篇：方案实操篇

### 3.0 整体流程

```
准备数据 → 上传云端 → 下载基座 → QLoRA训练 → 合并LoRA → 导出GGUF → 下载本地 → 导入Ollama → 在Cline中使用
```

### 3.1 本地准备

```bash
# Windows 上需要准备的
F:\ai-training\
├── data-tool-call.jsonl      # 训练数据（2846条）
├── cloud-train-14b.py         # 训练脚本
└── 本指南
```

### 3.2 AutoDL 操作

**Step 1：注册充钱**
- autodl.com → 实名 → 充 ¥10

**Step 2：创建实例**
- 选 RTX 5090 → 镜像 `PyTorch 2.x + CUDA 12.x + Python 3.12`
- **数据盘选 100GB**（默认 30GB 不够！）

**Step 3：上传文件**
- 点 JupyterLab → 左侧文件树 → 上传脚本和数据
- 文件默认到 `/root/` 目录

**Step 4：安装依赖**
```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip install "transformers==5.5.0" "trl==0.24.0" "datasets==4.3.0" \
    diffusers hf_transfer pydantic sentencepiece tyro unsloth_zoo xformers --no-deps
```

**Step 5：下载基座模型**
```bash
pip install modelscope
python -c "
from modelscope import snapshot_download
snapshot_download('Qwen/Qwen2.5-Coder-14B-Instruct', cache_dir='/root/models-ms')
"
```

**Step 6：开始训练**
```bash
python cloud-train-14b.py
```

**Step 7：合并导出**
训练完成后 LoRA 在 `/root/lora-adapter/`。合并 + 导出 GGUF：
```bash
python merge-v2.py
mkdir -p /root/gguf-final
python /root/.unsloth/llama.cpp/convert_hf_to_gguf.py /root/merged \
    --outtype f16 --outfile /root/gguf-final/model-f16.gguf
/root/.unsloth/llama.cpp/build/bin/llama-quantize \
    /root/gguf-final/model-f16.gguf /root/gguf-final/model-q4_k_m.gguf Q4_K_M
```

**Step 8：下载到本地**
- 网页 → 文件存储 → 下载 `/root/gguf-final/model-q4_k_m.gguf`

**Step 9：导入 Ollama**
```bash
ollama create qwen2.5-coder-14b-toolcall -f Modelfile
```

**Step 10：Cline 使用**
- Cline 齿轮 → Model ID → `qwen2.5-coder-14b-toolcall`

**Step 11：关机！**
- 网页端关机，否则持续扣费

---

## 第四篇：训练规划

### 4.1 数据量计算

| 训练目标 | 基础需求 | 推荐数据量 |
|----------|---------|-----------|
| 学会5种工具 | 每种80-100条 | 500条 |
| 多步骤推理 | 150条 | 300条 |
| 自我纠错 | 100条 | 200条 |
| 纯对话识别 | 150条 | 200条 |
| 链式思考 | 500条 | 800条 |
| Cline 适配 | 300条 | 500条 |

### 4.2 本项目的数据

| 文件 | 条数 | 内容 |
|------|------|------|
| data-tool-call.jsonl | 2846 | 基础工具调用 ✅ 已训练 |
| data-advanced.jsonl | 1000 | 多步推理+纠错 |
| data-round3.jsonl | 1498 | 链式思考+Cline专项 |
| **合计** | **5344** | |

### 4.3 重要发现：Cline 不能用训练版模型

**Qwen2.5-Coder 架构不支持 Ollama 原生工具 API。**

```
2846 条训练教的是 → 文本中输出 XML 工具调用 ✅
Cline 需要的是    → Ollama function calling 协议 ❌
```

无论怎么训练，Coder 系列都无法在 Cline 中当代理。**但 Continue.dev 不依赖原生 API——而是用 prompt 引导模型输出 XML。**

### 4.4 训练轮次规划

| 轮次 | 数据量 | 目标 | 状态 |
|------|--------|------|------|
| 第1轮 | 986条 | 初次验证 | ✅ |
| 第2轮 | 2846条 | 基础工具调用 | ✅ GGUF产出 → Continue可用 |
| 第3轮 | +1400条 Cline格式 | Cline文本层适配 | ⏳ 规划中 → Continue增强 |
| 第4轮 | 追加多轮对话 | Continue精通 | ⏳ 规划中 |

### 4.5 第3轮：Cline 文本层适配方案

**核心思路：** 模型不需要突破架构限制，只需要在文本层面理解 Cline 系统提示格式，输出纯 XML（去掉"我叫工具:"前缀）。

**Cline 实际发送的格式：**
```
你是一个AI编程助手。你可以使用以下工具：

<read_file>
读取文件
<path>文件路径</path>
</read_file>

<write_to_file>
写入文件
<path>路径</path>
<content>内容</content>
</write_to_file>
```

**训练数据格式（与第2轮的区别）：**
```jsonl
# 第2轮格式
{"tool_call": "我叫工具:\n<read_file>\n<path>main.py</path>\n</read_file>"}

# 第3轮格式（纯XML，无前缀）
{"tool_call": "<read_file>\n<path>main.py</path>\n</read_file>"}
```

**第3轮新增数据量：**

| 类型 | 条数 | 说明 |
|------|------|------|
| Cline 格式适配（纯XML） | 800 | 去掉"我叫工具"前缀 |
| 多轮对话 | 400 | 工具→结果→下一步 完整循环 |
| 纯文本回答 | 200 | 不需要工具时直接回答 |
| **合计** | **1400** | 加上已有2846=4246条 |

**执行步骤：**
1. 去 DeepSeek 网页版生成 1400 条（纯 XML 格式）
2. 合并数据 2846+1400=4246 条
3. 上传 AutoDL → 训练（模型已缓存，秒开）
4. 合并 → GGUF → 下载 → 导入 Ollama
5. Continue 配置使用新模型

**使用目标：Continue.dev**（不是 Cline）
```yaml
# ~/.continue/config.yaml
models:
  - name: Cline 14B v3
    provider: ollama
    model: my-cline-14b-v3
    roles: [chat, edit]
```

---

## 第五篇：事故与解决篇

### 5.1 事故总览

整个项目中最严重的错误是**反复删除已下载的模型文件**，导致同一个 28GB 基座模型被下载了 4 次以上，浪费 6+ 小时。

### 5.2 事故清单

| # | 事故 | 原因 | 浪费 | 教训 |
|----|------|------|------|------|
| 1 | Ollama 官方库下载 14B | 200KB/s 未及时换源 | 4小时 | **模型一律 ModelScope 下载** |
| 2 | 训练脚本删除源文件 | pipeline.sh 第2步 `rm` | 重下28GB | **脚本不写 rm** |
| 3 | 合并后删合并模型 | pipeline.sh 第4步 `rm` | 无法重试 | **先验证再删** |
| 4 | ModelScope 临时目录文件损坏 | 下载中断未校验 | 反复重试 | **下载完校验每个文件大小** |
| 5 | HF 镜像也下载失败 | AutoDL 网络不稳 | 浪费时间 | **本地下载+SFTP上传** |
| 6 | SFTP 上传反复断连 | SSH 不稳定 | 仅传2/6 | **用 AutoDL 网页上传** |
| 7 | PyTorch 被降级为 CPU 版 | pip 安装依赖未加 --no-deps | 重装2.6GB | **保护 torch 不被覆盖** |
| 8 | GGUF 导出磁盘满 | 默认30GB不够14B合并 | 导出失败 | **创建实例选100GB** |
| 9 | 训练前不卸 Ollama 模型 | 显存被占 | 训练OOM | **训练前 ollama stop** |
| 10 | 中文用户名导致 Triton 崩溃 | Unicode路径 | 反复报错 | **设 TRITON_CACHE_DIR** |

### 5.3 最严重的错误：反复删除重下

```
第1次：ModelScope 下载 28GB → 损坏
第2次：重下 28GB → pipeline.sh 第2步删了源文件
第3次：重下 28GB → pipeline.sh 第4步删了合并模型
第4次：HF 镜像下载 28GB → 卡死
第5次：ModelScope 自动重试 → 成功但1个shard损坏
第6次：单文件修复 → 终于成功
```

**如果第一次就保留所有文件，只修复损坏的1个shard（75秒），6小时变5分钟。**

### 5.4 用户手动修复的方案（成功路径）

用户发现 `/root/models/` 下有完整模型（训练时下载的），但 `model-00003-of-00006.safetensors` 只有 337MB（正常 4.61GB）。用户使用 ModelScope SDK 的**单文件下载**功能：

```python
from modelscope.hub.file_download import model_file_download
model_file_download('Qwen/Qwen2.5-Coder-14B-Instruct',
                    'model-00003-of-00006.safetensors',
                    cache_dir='/root/models-ms')
```

仅仅 75 秒下载完单个 4.61GB 文件，然后 6 个分片全部校验通过，合并导出成功。

---

## 第六篇：正确做法篇

### 6.1 铁律

```
1. 绝不删除已下载的模型文件
2. 下载完校验每个文件大小（不是统计文件数量）
3. 先决策再执行——想清楚全流程再动手
4. 模型从 ModelScope 下载，pip 从阿里云镜像，代码从 GitHub（开梯子）
5. 训练前 ollama stop 卸模型
6. AutoDL 创建实例选 100GB 数据盘
7. 一条命令能解决的问题不分两步做
```

### 6.2 正确的文件管理

```
AutoDL /root/ 目录：
├── models-ms/          ← 基座模型（28GB）— 永久保留
├── lora-adapter/       ← 训练产物（263MB）— 永久保留
├── output/             ← 训练检查点 — 保留
├── merged/             ← 合并后权重 — 导出完可删
├── gguf-final/         ← 最终 GGUF — 下载后保留
└── 其他脚本和数据       ← 保留
```

### 6.3 正确的问题排查流

```
文件出错 → 校验具体哪个文件损坏 → 只修复损坏的 → 继续
（不是：文件出错 → 删掉全部 → 重下28GB → 又出错 → 循环）
```

### 6.4 一页纸速查

| 你要做什么 | 命令/操作 |
|-----------|----------|
| 下模型 | `modelscope snapshot_download` |
| 装依赖 | `pip install --no-deps` + 阿里云镜像 |
| 训前检查 | `ollama stop` + `nvidia-smi` |
| 训完导出 | `merge → convert → quantize` |
| 下载到本地 | AutoDL 网页 → 文件存储 → 下载 |
| 导入 Ollama | `ollama create 模型名 -f Modelfile` |
| Cline 使用 | 齿轮 → Model ID → 填模型名 |
| GitHub 下载 | 开梯子(10808) `curl -x socks5://...` |
| 磁盘满了 | `df -h` 查看，删 output/ 和 cache |
| 关机 | AutoDL 网页 → 关机 |

### 6.5 训练数据量参考

| 模型规模 | QLoRA 最优数据量 | 收益递减点 |
|----------|-----------------|-----------|
| 7-8B | 2000-3000条 | ~5000条 |
| 14B | 3000-5000条 | ~7000条 |
| 30B+ | 5000-10000条 | 视任务而定 |

---

## 附录：关键文件位置

```
本机：
  F:\ai-training\
  ├── data-tool-call.jsonl          2846条训练数据
  ├── data-advanced.jsonl           1000条高级数据
  ├── data-round3.jsonl             1498条推理数据
  ├── gguf-download\model-q4_k_m.gguf  最终产物(9GB)
  ├── cloud-train-14b.py            训练脚本
  ├── merge-v2.py                   合并脚本
  ├── pipeline.sh                   自动流水线
  └── mcp-server.py                 Claude Code MCP

AutoDL：
  /root/lora-adapter/               LoRA适配器(263MB)
  /root/output/checkpoint-1780/     训练检查点
  /root/gguf-final/model-q4_k_m.gguf  最终GGUF(8.4GB)
```

---

> **后记**：这个项目踩了几乎所有能踩的坑——下载损坏、磁盘满、版本冲突、脚本删文件、显存不足、网络超时。但最终产出了一个 8.4GB 的 GGUF 模型，2846 条训练数据让它学会了基础工具调用。下一轮用 5344 条数据训练，加入推理和 Cline 专项，模型会更聪明。
