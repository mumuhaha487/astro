import type { TimelineItem } from "../components/features/timeline/types";

export const timelineData: TimelineItem[] = [
	{
		id: "current-study",
		title: "学习数据科学与大数据技术",
		description:
			"学习数据科学与大数据技术，专注于 Web开发和软件工程。",
		type: "education",
		startDate: "2022-09-01",
		location: "Beijing",
		organization: "某个二本大学",
		skills: ["Java", "Python", "JavaScript", "HTML/CSS", "MySQL"],
		achievements: [
			"Completed data structures and algorithms course project",
			"Participated in multiple course project developments",
		],
		icon: "material-symbols:school",
		color: "#059669",
		featured: true,
	},
	{
		id: "mizuki-blog-project",
		title: "海龟汤",
		description:
			"开发了一款基于AI作为主持人的AI海龟汤项目",
		type: "project",
		startDate: "2024-06-01",
		endDate: "2024-08-01",
		skills: ["Astro", "TypeScript", "Tailwind CSS", "Git"],
		achievements: [
			"基于OpenAI的海龟汤项目",
			"实现多人聊天并且多人同时参与",
			"支持用户自定义海龟汤汤面，汤底",
		],
		links: [
			{
				name: "GitHub Repository",
				url: "https://github.com/mumuhaha487/Turtle_Soup",
				type: "project",
			},
			{
				name: "查看 Demo",
				url: "https://turtle.vmss.cn/",
				type: "website",
			},
		],
		icon: "material-symbols:code",
		color: "#7C3AED",
		featured: true,
	},
	{
		id: "summer-internship-2024",
		title: "CSDN博主",
		description:
			"在CSDN上发布了多篇关于IT的文章。",
		type: "work",
		startDate: "2021-07-01",
		endDate: "2021-08-31",
		location: "未知",
		organization: "CSDN",
		position: "博主",
		skills: ["Python", "JavaScript", "CSS3", "Git", "Figma"],
		achievements: [
			"完成了多篇关于IT的文章",
			"拥有10000+粉丝",
			"拥有236万的访问量",
		],
		icon: "material-symbols:work",
		color: "#DC2626",
		featured: true,
	},
	{
		id: "web-development-course",
		title: "蓝桥杯省级二等奖",
		description:
			"在蓝桥杯省级比赛中获得了二等奖。",
		type: "achievement",
		startDate: "2024-01-15",
		endDate: "2024-05-30",
		organization: "Mooc Website",
		skills: ["C/C++","算法","数据结构"],
		achievements: [
			"获得了二等奖",
		],
		links: [
			{
				name: "Course Certificate",
				url: "/",
				type: "certificate",
			},
		],
		icon: "material-symbols:verified",
		color: "#059669",
	},
	{
		id: "student-management-system",
		title: "统一权限管理系统",
		description:
			"开发了一款基于Flask的统一权限管理系统，用于管理学生的个人信息。",
		type: "project",
		startDate: "2023-11-01",
		endDate: "2023-12-15",
		skills: ["Python", "MySQL", "Flask"],
		achievements: [
			"完成了统一权限管理系统",
			"实现了用户登录注册功能",
			"实现了用户权限管理功能",
			"实现了用户个人信息管理功能",
		],
		icon: "material-symbols:database",
		color: "#EA580C",
	},
	{
		id: "high-school-graduation",
		title: "高中毕业",
		description:
			"高中毕业与江西，获得了某公立二本大学的录取。并且录取为数据科学与大数据技术专业",
		type: "education",
		startDate: "2019-09-01",
		endDate: "2026-06-30",
		location: "江西,上饶",
		organization: "一所江西的高中",
		achievements: [
			"目前来讲应该还是莫得的",
		],
		icon: "material-symbols:school",
		color: "#2563EB",
	},
	{
		id: "first-programming-experience",
		title: "第一次编程经历",
		description:
			"在高中课后中第一次接触编程，学习了Python的基本语法。",
		type: "education",
		startDate: "2021-03-01",
		skills: ["Python", "Basic Programming Concepts"],
		achievements: [
			"完成了第一个'Hello World'程序",
			"学习了基本的循环和条件语句，",
			"发展了编程的兴趣",
		],
		icon: "material-symbols:code",
		color: "#7C3AED",
	},
];
