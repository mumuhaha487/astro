// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	// Frontend Skills
	{
		id: "javascript",
		name: "JavaScript",
		description:
			"现代 JavaScript 开发，包括 ES6+ 语法、异步编程和模块化开发。",
		icon: "logos:javascript",
		category: "frontend",
		level: "advanced",
		experience: { years: 3, months: 6 },
		projects: [
			"mizuki-blog",
			"portfolio-website",
			"data-visualization-tool",
		],
		color: "#F7DF1E",
	},
	{
		id: "typescript",
		name: "TypeScript",
		description:
			"类型安全的 JavaScript 超集，用于增强代码质量和开发效率。",
		icon: "logos:typescript-icon",
		category: "frontend",
		level: "advanced",
		experience: { years: 2, months: 8 },
		projects: ["mizuki-blog", "portfolio-website", "task-manager-app"],
		color: "#3178C6",
	},
	{
		id: "react",
		name: "React",
		description:
			"一个用于构建用户界面的 JavaScript 库，用于构建用户界面。",
		icon: "logos:react",
		category: "frontend",
		level: "advanced",
		experience: { years: 2, months: 10 },
		projects: ["portfolio-website", "task-manager-app"],
		color: "#61DAFB",
	},
	{
		id: "vue",
		name: "Vue.js",
		description:
			"一个渐进式 JavaScript 框架，易于学习和使用，适合快速开发。",
		icon: "logos:vue",
		category: "frontend",
		level: "intermediate",
		experience: { years: 1, months: 8 },
		projects: ["data-visualization-tool"],
		color: "#4FC08D",
	},
	{
		id: "nextjs",
		name: "Next.js",
		description:
			"一个用于 React 应用程序的框架，支持服务器端渲染、静态站点生成和全栈开发。",
		icon: "logos:nextjs-icon",
		category: "frontend",
		level: "intermediate",
		experience: { years: 1, months: 4 },
		projects: ["e-commerce-frontend", "blog-platform"],
		color: "#616161", // 更改为深灰色，避免纯黑色
	},
	{
		id: "astro",
		name: "Astro",
		description:
			"一个用于构建现代用户界面的框架，支持多框架集成和出色的性能。",
		icon: "logos:astro-icon",
		category: "frontend",
		level: "advanced",
		experience: { years: 1, months: 2 },
		projects: ["mizuki-blog"],
		color: "#FF5D01",
	},
	{
		id: "tailwindcss",
		name: "Tailwind CSS",
		description:
			"一个用于快速构建现代用户界面的工具优先 CSS 框架，无需配置。",
		icon: "logos:tailwindcss-icon",
		category: "frontend",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["mizuki-blog", "portfolio-website"],
		color: "#06B6D4",
	},
	{
		id: "webpack",
		name: "Webpack",
		description:
			"一个用于打包现代 JavaScript 应用程序的静态模块打包器。",
		icon: "logos:webpack",
		category: "frontend",
		level: "intermediate",
		experience: { years: 1, months: 10 },
		projects: ["custom-build-tool", "spa-application"],
		color: "#8DD6F9",
	},
	{
		id: "vite",
		name: "Vite",
		description:
			"一个用于构建现代用户界面的工具，支持快速开发和热更新。",
		icon: "logos:vitejs",
		category: "frontend",
		level: "intermediate",
		experience: { years: 1, months: 2 },
		projects: ["vue-project", "react-project"],
		color: "#646CFF",
	},

	// Backend Skills
	{
		id: "nodejs",
		name: "Node.js",
		description:
			"一个基于 Chrome V8 引擎的 JavaScript 运行环境，用于服务器端开发。",
		icon: "logos:nodejs-icon",
		category: "backend",
		level: "intermediate",
		experience: { years: 2, months: 3 },
		projects: ["data-visualization-tool", "e-commerce-platform"],
		color: "#339933",
	},
	{
		id: "python",
		name: "Python",
		description:
			"一种通用的编程语言，适用于 Web开发、数据分析、机器学习等。",
		icon: "logos:python",
		category: "backend",
		level: "intermediate",
		experience: { years: 1, months: 10 },
		color: "#3776AB",
	},
	{
		id: "java",
		name: "Java",
		description:
			"一种主流的编程语言，适用于企业应用程序开发，跨平台和面向对象。",
		icon: "logos:java",
		category: "backend",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		projects: ["enterprise-system", "microservices-api"],
		color: "#ED8B00",
	},
	{
		id: "go",
		name: "Go",
		description:
			"一种高效的编程语言，由 Google 开发，适用于云原生和微服务开发。",	
		icon: "logos:go",
		category: "backend",
		level: "beginner",
		experience: { years: 0, months: 8 },
		projects: ["microservice-demo"],
		color: "#00ADD8",
	},
	{
		id: "rust",
		name: "Rust",
		description:
			"一种系统编程语言，关注安全、速度和并发行，无垃圾收集器。",	
		icon: "logos:rust",
		category: "backend",
		level: "beginner",
		experience: { years: 0, months: 6 },
		projects: ["system-tool", "performance-critical-app"],
		color: "#CE422B",
	},
	{
		id: "cpp",
		name: "C++",
		description:
			"A high-performance systems programming language widely used in game development, system software, and embedded development.",
		icon: "logos:c-plusplus",
		category: "backend",
		level: "intermediate",
		experience: { years: 1, months: 4 },
		projects: ["game-engine", "system-optimization"],
		color: "#00599C",
	},
	{
		id: "c",
		name: "C",
		description:
			"一种低级的系统编程语言，是操作系统和嵌入式系统开发的基础。",
		icon: "logos:c",
		category: "backend",
		level: "intermediate",
		experience: { years: 1, months: 2 },
		projects: ["embedded-system", "kernel-module"],
		color: "#A8B9CC",
	},
	{
		id: "php",
		name: "PHP",
		description:
			"一种广泛使用的服务器端脚本语言，特别适用于 Web开发。",
		icon: "logos:php",
		category: "backend",
		level: "intermediate",
		experience: { years: 1, months: 6 },
		projects: ["cms-system", "e-commerce-backend"],
		color: "#777BB4",
	},
	{
		id: "django",
		name: "Django",
		description:
			"一种高级的 Python 基础础，快速开发和简洁的、实用的设计。",	
		icon: "logos:django-icon",
		category: "backend",
		level: "beginner",
		experience: { years: 0, months: 6 },
		projects: ["blog-backend"],
		color: "#092E20",
	},

	// Database Skills
	{
		id: "mysql",
		name: "MySQL",
		description:
			"一种广泛使用的开源关系型数据库管理系统，适用于 Web应用程序。",	
		icon: "logos:mysql-icon",
		category: "database",
		level: "advanced",
		experience: { years: 2, months: 6 },
		projects: ["e-commerce-platform", "blog-system"],
		color: "#4479A1",
	},
	{
		id: "postgresql",
		name: "PostgreSQL",
		description:
			"一种功能强大的开源关系型数据库管理系统，适用于 Web应用程序。",		
		icon: "logos:postgresql",
		category: "database",
		level: "intermediate",
		experience: { years: 1, months: 5 },
		projects: ["e-commerce-platform"],
		color: "#336791",
	},
	{
		id: "redis",
		name: "Redis",
		description:
			"一种高性能的内存数据结构存储，用于数据库、缓存和消息代理。",
		icon: "logos:redis",
		category: "database",
		level: "intermediate",
		experience: { years: 1, months: 3 },
		projects: ["e-commerce-platform", "real-time-chat"],
		color: "#DC382D",
	},
	{
		id: "mongodb",
		name: "MongoDB",
		description:
			"一种文档型的 NoSQL 数据库，具有灵活的数据模型。",
		icon: "logos:mongodb-icon",
		category: "database",
		level: "intermediate",
		experience: { years: 1, months: 2 },
		color: "#47A248",
	},
	{
		id: "sqlite",
		name: "SQLite",
		description:
			"一种轻量级的嵌入式关系型数据库，适用于移动应用程序和小型项目。",	
		icon: "simple-icons:sqlite",
		category: "database",
		level: "intermediate",
		experience: { years: 1, months: 8 },
		projects: ["mobile-app", "desktop-tool"],
		color: "#003B57",
	},
	{
		id: "firebase",
		name: "Firebase",
		description:
			"一种移动和 Web应用程序开发平台，提供实时数据库和认证服务。",
		icon: "simple-icons:firebase",
		category: "database",
		level: "intermediate",
		experience: { years: 0, months: 10 },
		projects: ["task-manager-app"],
		color: "#FFCA28",
	},

	// Tools
	{
		id: "git",
		name: "Git",
		description:
			"一种分布式版本控制管理系统，用于代码管理和团队协作。",
		icon: "logos:git-icon",
		category: "tools",
		level: "advanced",
		experience: { years: 3, months: 0 },
		color: "#F05032",
	},
	{
		id: "vscode",
		name: "VS Code",
		description:
			"一种轻量级但功能强大的代码编辑器，具有丰富的插生态系统。",
		icon: "logos:visual-studio-code",
		category: "tools",
		level: "expert",
		experience: { years: 3, months: 6 },
		color: "#007ACC",
	},
	{
		id: "webstorm",
		name: "WebStorm",
		description:
			"一种专业的 JavaScript 和 Web开发 IDE，由智能代码辅助功能驱动。",
		icon: "logos:webstorm",
		category: "tools",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["react-project", "vue-project"],
		color: "#00CDD7",
	},
	{
		id: "intellij",
		name: "IntelliJ IDEA",
		description:
			"一种专业的 Java 开发 IDE，由智能代码辅助功能驱动。",
		icon: "logos:intellij-idea",
		category: "tools",
		level: "intermediate",
		experience: { years: 1, months: 8 },
		projects: ["java-enterprise", "spring-boot-app"],
		color: "#616161", // 更改为深灰色，避免纯黑色
	},
	{
		id: "pycharm",
		name: "PyCharm",
		description:
			"一种专业的 Python IDE，由智能代码分析和调试功能驱动。",
		icon: "logos:pycharm",
		category: "tools",
		level: "intermediate",
		experience: { years: 1, months: 4 },
		projects: ["python-web-app", "data-analysis"],
		color: "#21D789",
	},
	{
		id: "rider",
		name: "Rider",
		description:
			"一种跨平台的 .NET IDE，支持 C#、VB.NET、F# 等语言。",
		icon: "logos:rider",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 8 },
		projects: ["dotnet-api", "desktop-app"],
		color: "#616161", // 更改为深灰色，避免纯黑色
	},
	{
		id: "goland",
		name: "GoLand",
		description:
			"一种专业的 Go 语言 IDE，由智能代码辅助功能驱动。",
		icon: "logos:goland",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 6 },
		projects: ["go-microservice"],
		color: "#3D7BF7",
	},
	{
		id: "docker",
		name: "Docker",
		description:
			"一种容器化平台，简化了应用程序部署和环境管理。",
		icon: "logos:docker-icon",
		category: "tools",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#2496ED",
	},
	{
		id: "kubernetes",
		name: "Kubernetes",
		description:
			"一种容器编排平台，用于自动化部署、扩展和管理容器化应用程序。",
		icon: "logos:kubernetes",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 4 },
		projects: ["microservices-deployment"],
		color: "#326CE5",
	},
	{
		id: "nginx",
		name: "Nginx",
		description:
			"一种高性能的 Web服务器和反向代理服务器。",	
		icon: "logos:nginx",
		category: "tools",
		level: "intermediate",
		experience: { years: 1, months: 2 },
		projects: ["web-server-config", "load-balancer"],
		color: "#009639",
	},
	{
		id: "apache",
		name: "Apache HTTP Server",
		description:
			"一种稳定可靠的 HTTP服务器软件。",
		icon: "logos:apache",
		category: "tools",
		level: "intermediate",
		experience: { years: 1, months: 6 },
		projects: ["traditional-web-server", "php-hosting"],
		color: "#D22128",
	},
	{
		id: "linux",
		name: "Linux",
		description:
			"一种开源的操作系统，用于服务器部署和开发环境。",
		icon: "logos:linux-tux",
		category: "tools",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		projects: ["server-management", "shell-scripting"],
		color: "#FCC624",
	},

	// Other Skills
	{
		id: "graphql",
		name: "GraphQL",
		description:
			"一种 API 查询语言和运行时，提供了更高效、更强大和更灵活的数据获取方式。",
		icon: "logos:graphql",
		category: "other",
		level: "beginner",
		experience: { years: 0, months: 6 },
		projects: ["modern-api"],
		color: "#E10098",
	},
	{
		id: "elasticsearch",
		name: "Elasticsearch",
		description:
			"一种分布式搜索和分析引擎，用于全文搜索和数据分析。",
		icon: "logos:elasticsearch",
		category: "other",
		level: "beginner",
		experience: { years: 0, months: 4 },
		projects: ["search-system"],
		color: "#005571",
	},
	{
		id: "jest",
		name: "Jest",
		description:
			"一种简单的 JavaScript 测试框架，专注于易用性。",
		icon: "logos:jest",
		category: "other",
		level: "intermediate",
		experience: { years: 1, months: 2 },
		projects: ["unit-testing", "integration-testing"],
		color: "#C21325",
	},
	{
		id: "cypress",
		name: "Cypress",
		description:
			"一种现代的端到端测试框架，用于 Web 应用程序。",	
		icon: "logos:cypress-icon",
		category: "other",
		level: "beginner",
		experience: { years: 0, months: 8 },
		projects: ["e2e-testing"],
		color: "#17202C",
	},
];
