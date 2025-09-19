import type { Task, Tableau, Board } from "../types";

// --- Tasks ---
export const tasks: Record<string, Task> = {
	"task-1": {
		id: "task-1",
		tableauId: "tableau-1",
		title: "Set up project repo",
		description: "Initialize GitHub repository with README and license.",
	},
	"task-2": {
		id: "task-2",
		tableauId: "tableau-1",
		title: "Design database schema",
		description: "Outline entities: Board, Tableau, Task.",
	},
	"task-3": {
		id: "task-3",
		tableauId: "tableau-2",
		title: "Implement login page",
		description: "Basic form with email/password validation.",
	},
	"task-4": {
		id: "task-4",
		tableauId: "tableau-3",
		title: "Review pull request #42",
		description: "Check code style and add comments.",
	},
	"task-5": {
		id: "task-5",
		tableauId: "tableau-4",
		title: "Deploy to staging",
		description: "Push latest build to staging environment.",
	},
};

// --- Tableaus ---
export const tableaus: Record<string, Tableau> = {
	"tableau-1": {
		id: "tableau-1",
		boardId: "board-1",
		name: "Not started",
		taskIds: ["task-1", "task-2"],
	},
	"tableau-2": {
		id: "tableau-2",
		boardId: "board-1",
		name: "In progress",
		taskIds: ["task-3"],
	},
	"tableau-3": {
		id: "tableau-3",
		boardId: "board-1",
		name: "Under review",
		taskIds: ["task-4"],
	},
	"tableau-4": {
		id: "tableau-4",
		boardId: "board-1",
		name: "Done",
		taskIds: ["task-5"],
	},
};

// --- Boards ---
export const boards: Record<string, Board> = {
	"board-1": {
		id: "board-1",
		name: "Demo Project",
		tableauIds: ["tableau-1", "tableau-2", "tableau-3", "tableau-4"],
	},
};
