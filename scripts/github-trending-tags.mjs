const categories = [
  ["AI", /\b(?:ai|llms?|large language models?|agents?|generative|inference|rag|machine learning|deep learning|neural|computer vision|models?)\b|人工智能|大模型|智能体|机器学习|推理模型/i],
  ["安全", /\b(?:security|secure|cybersecurity|vulnerabilit(?:y|ies)|pentest(?:ing)?|exploit|forensic|malware|reverse engineering|decompil(?:er|ation)|encryption|password|audit|xss|sqli|injection)\b|安全|渗透|逆向|漏洞|审计|取证/i],
  ["教程", /\b(?:tutorials?|guides?|lessons?|courses?|education|beginners?|handbook|textbook|learning|learn|books?)\b|教程|入门|教学|课程|学习|实践指南|从零开始/i],
  ["Skill", /\bskills?\b|\.agents\b/i],
  ["开发工具", /\b(?:coding|developer|development|code|git|cli|terminal|editor|ide|plugins?|framework|api|sdk|debugg(?:er|ing)|worktree)\b|开发工具|代码|编程|编辑器|框架/i],
  ["云服务", /\b(?:cloud|server|storage|database|containers?|docker|kubernetes|s3|self-host(?:ed|ing)?|infrastructure|backend|sandbox)\b|云原生|服务器|容器|数据库|对象存储|自托管/i],
  ["音视频", /\b(?:video|audio|voice|speech|music|photo|image|media|streaming|camera|transcription)\b|视频|音频|语音|音乐|图像|图片|短剧|影视/i],
  ["游戏", /\b(?:games?|gaming|godot|steam|roms?)\b|游戏|手游/i],
  ["移动端", /\b(?:android|ios|ipad|iphone|mobile|smartphone)\b|安卓|移动端|手机端/i],
  ["数据", /\b(?:data|analytics|visuali[sz]ation|gis|crawler|scrap(?:er|ing)|search engine)\b|数据|可视化|爬虫|地图/i],
  ["金融", /\b(?:trading|finance|financial|stocks?|crypto|investment)\b|金融|股票|交易|投资/i],
  ["效率", /\b(?:productivity|automation|launcher|clipboard|management|organizer|collaboration)\b|自动化|效率|协作|管理/i],
  ["网络", /\b(?:network|proxy|vpn|torrent|download|wifi|http|browser)\b|网络|网络代理|下载|浏览器/i],
];

export function classifyRepository({ repo = "", description = "", summary = "" }) {
  const source = `${repo} ${description} ${summary}`;
  const tags = categories.filter(([, pattern]) => pattern.test(source)).map(([tag]) => tag);
  return tags.length ? tags.slice(0, 4) : ["其他"];
}
