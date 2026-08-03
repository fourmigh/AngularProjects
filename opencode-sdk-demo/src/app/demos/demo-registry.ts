export interface DemoEntry {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  code: string;
  notes: string;
}

const CODE_01 = `import { opencode } from '@opencode-ai/sdk';

// 所有操作的第一步：创建客户端实例。
// 调用 opencode() 会自动启动一个 OpenCode 服务器进程（如果还未运行），
// 默认监听 http://127.0.0.1:4096
const client = opencode();

async function main() {
  // 检查服务器是否健康运行
  const health = await client.global.health();
  console.log('服务器状态:', health);

  // 获取应用信息，确认连接详情
  const appInfo = await client.app.info();
  console.log('应用信息:', appInfo);
}

main().catch(console.error);`;

const CODE_02 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode();

async function main() {
  // 1. 创建一个新会话，title 可选，用于标识
  const session = await client.session.create({
    title: '我的第一个会话'
  });
  console.log('创建会话成功，ID:', session.id);

  // 2. 列出所有已有会话
  const sessions = await client.session.list();
  console.log('共有', sessions.length, '个会话');

  // 3. 获取单个会话详情
  const detail = await client.session.get(session.id);
  console.log('会话详情:', detail);

  // 4. 删除会话（释放资源）
  // await client.session.delete(session.id);
}

main().catch(console.error);`;

const CODE_03 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode();

async function main() {
  // 1. 创建会话，用于承载对话上下文
  const session = await client.session.create({ title: '聊天示例' });
  console.log('会话 ID:', session.id);

  // 2. 发送消息，等待 AI 回复
  // prompt() 是最核心的方法，接收一个 PromptRequest 对象
  const response = await client.session.prompt({
    sessionId: session.id,
    // parts 是消息内容，支持文本、图像等多种类型
    parts: [{ type: 'text', text: '请用一句话介绍什么是 OpenCode' }],
    // 可选：指定使用哪个 Agent 或模型
    // agent: "build",
    // model: { providerID: "anthropic", modelID: "claude-sonnet" }
  });

  // 3. 打印 AI 回复
  response.parts.forEach(part => {
    if (part.type === 'text') {
      console.log('AI:', part.text);
    }
  });
}

main().catch(console.error);`;

const CODE_04 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode();

async function main() {
  const session = await client.session.create({ title: '流式输出示例' });

  console.log('AI 正在思考...\\n');

  // 1. subscribe() 返回一个异步迭代器，可以实时接收
  //    AI 生成过程中的各种事件
  for await (const event of client.session.subscribe({
    sessionId: session.id
  })) {
    // 2. MessagePartUpdated 事件：AI 生成了新的文本片段
    if (event.type === 'MessagePartUpdated') {
      const delta = event.properties.delta;
      if (delta) {
        process.stdout.write(delta); // 实时输出，不换行
      }
    }

    // 3. SessionIdle 表示 AI 回复完成
    if (event.type === 'SessionIdle') {
      console.log('\\n\\n回复完成');
      break;
    }
  }
}

main().catch(console.error);`;

const CODE_05 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode();

async function main() {
  const session = await client.session.create({ title: '结构化输出' });

  // 1. 定义 JSON Schema，告诉 AI 你期望的数据格式
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', description: '人物全名' },
      age: { type: 'number', description: '年龄' },
      occupation: { type: 'string', description: '职业' },
    },
    required: ['name', 'age'],
  };

  // 2. 发送消息，并指定 format 为 json_schema
  const response = await client.session.prompt({
    sessionId: session.id,
    parts: [{ type: 'text', text: '提取信息：张三，30岁，软件工程师' }],
    format: {
      type: 'json_schema',
      schema: schema,
      retryCount: 2,  // 如果结果不符合 schema，自动重试
    },
  });

  // 3. 解析 JSON 结果
  const text = response.parts.find(p => p.type === 'text')?.text ?? '';
  const data = JSON.parse(text);
  console.log('姓名:', data.name);
  console.log('年龄:', data.age);
  console.log('职业:', data.occupation);
}

main().catch(console.error);`;

const CODE_06 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode({ config: { cwd: process.cwd() } });

async function main() {
  // 1. 列出当前工作目录的文件
  console.log('当前目录文件:');
  const files = await client.file.list();
  files.forEach(f => {
    const icon = f.type === 'directory' ? '[DIR]' : '[FILE]';
    console.log('  ' + icon, f.path);
  });

  // 2. 读取文件内容
  const content = await client.file.read({ path: 'package.json' });
  console.log('\\npackage.json:', content);
}

main().catch(console.error);`;

const CODE_07 = `import { opencode } from '@opencode-ai/sdk';

const client = opencode();

async function main() {
  // 1. 定义一个自定义工具：查询天气
  //    告诉 AI 它可以调用这个函数
  const weatherTool = {
    name: 'get_weather',
    description: '获取指定城市的天气',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名，如"上海"' },
      },
      required: ['city'],
    },
    handler: async ({ city }: { city: string }) => {
      // 这里可以替换为真实的天气 API 调用
      return { city, temperature: 22, condition: '晴朗' };
    },
  };

  const session = await client.session.create({ title: '工具调用' });

  // 2. 通过 tools 参数将工具注册给 AI
  const response = await client.session.prompt({
    sessionId: session.id,
    parts: [{ type: 'text', text: '上海现在天气如何？' }],
    tools: [weatherTool],
  });

  response.parts.forEach(p => {
    if (p.type === 'text') console.log('AI:', p.text);
  });
}

main().catch(console.error);`;

export const DEMOS: DemoEntry[] = [
  {
    id: '01-create-client',
    title: '创建客户端',
    subtitle: '初始化 SDK 连接',
    icon: 'power',
    description: '演示如何创建 OpenCode 客户端实例，建立与服务器的连接，并检查服务健康状态。这是使用 SDK 的第一步。',
    code: CODE_01,
    notes: `<p><strong>前置条件：</strong>需要安装 <code>@opencode-ai/sdk</code> 包，并确保 OpenCode 服务可访问。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/01-create-client.ts</code></pre>`,
  },
  {
    id: '02-session-basic',
    title: '会话管理',
    subtitle: '创建 / 列表 / 获取 / 删除',
    icon: 'chat',
    description: '会话是对话的容器。本示例演示会话的完整生命周期管理：创建会话、列出所有会话、获取会话详情、删除会话。',
    code: CODE_02,
    notes: `<p><strong>前置条件：</strong>同上，需要 SDK 包和运行的 OpenCode 服务。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/02-session-basic.ts</code></pre>`,
  },
  {
    id: '03-session-chat',
    title: '发送消息',
    subtitle: '基础对话能力',
    icon: 'send',
    description: '在会话中发送提示词并获取 AI 回复。使用 <code>session.prompt()</code> 方法，这是最常用的核心接口。支持指定 Agent 和模型。',
    code: CODE_03,
    notes: `<p><strong>前置条件：</strong>需要配置模型提供商（如 Anthropic、OpenAI）的 API Key。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/03-session-chat.ts</code></pre>`,
  },
  {
    id: '04-session-stream',
    title: '流式响应',
    subtitle: '实时接收 AI 输出',
    icon: 'stream',
    description: '使用 <code>subscribe()</code> 方法实时接收 AI 生成的文本片段，提供打字机效果的流畅体验。<code>MessagePartUpdated</code> 事件携带增量文本。',
    code: CODE_04,
    notes: `<p><strong>前置条件：</strong>同上，需要 API Key。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/04-session-stream.ts</code></pre>`,
  },
  {
    id: '05-structured-output',
    title: '结构化输出',
    subtitle: 'JSON Schema 约束',
    icon: 'data_object',
    description: '让 AI 按你定义的 JSON Schema 返回数据。支持自动重试验证，确保返回的数据格式完全符合预期，便于程序解析。',
    code: CODE_05,
    notes: `<p><strong>前置条件：</strong>同上，需要 API Key。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/05-structured-output.ts</code></pre>`,
  },
  {
    id: '06-file-operations',
    title: '文件操作',
    subtitle: '读写 / 列出文件',
    icon: 'folder_open',
    description: '通过 SDK 让 Agent 列出目录文件、读取文件内容。需要指定工作目录（cwd），所有文件操作基于该目录。',
    code: CODE_06,
    notes: `<p><strong>前置条件：</strong>需要在项目根目录运行。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/06-file-operations.ts</code></pre>`,
  },
  {
    id: '07-custom-tools',
    title: '自定义工具',
    subtitle: '扩展 AI 能力',
    icon: 'construction',
    description: '定义自己的工具函数让 AI 调用。工具包含名称、描述、参数 Schema 和执行 handler。SDK 自动处理类型校验和调用。',
    code: CODE_07,
    notes: `<p><strong>前置条件：</strong>同上，需要 API Key。</p>
<p><strong>运行方式：</strong></p>
<pre><code>npx ts-node src/07-custom-tools.ts</code></pre>`,
  },
];
