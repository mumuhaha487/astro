// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "turtle-soup",
		title: "海龟汤",
		description:
			"AI做主持人，和朋友一起玩海龟汤",
		image: "https://image.0ha.top/file/1774869394866_174de96932bd7f2e45cd5e14890b9a67.png",
		category: "mobile",
		techStack: ["Python", "Flask", "OpenAI"],
		status: "completed",
		sourceCode: "https://github.com/mumuhaha487/Turtle_Soup",
		visitUrl: "https://turtle.vmss.cn/",
		startDate: "2025-09-11",
		endDate: "2024-06-01",
		featured: true,
		tags: ["Python", "Flask", "OpenAI"],
	},
	{
		id: "09md_edit",
		title: "在线markdown编辑器",
		description:
			"（暂时不对外开放，可以自己部署）和图床和git仓库对接，变成类似于分离式纯静态博客编写后台",
		image: "https://image.0ha.top/file/1774869580831_image.png",
		category: "web",
		techStack: ["nodejs", "Python", "cloudfare", "markdown"],
		status: "in-progress",
		sourceCode: "https://github.com/mumuhaha487/09md_edit",
		startDate: "2024-03-01",
		featured: true,
		tags: ["nodejs", "Python", "cloudfare", "markdown"],
	},

];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter(
		(p) => p.status === "completed",
	).length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
