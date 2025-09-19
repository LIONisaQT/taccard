export type Task = {
	id: string;
	tableauId: string;
	title: string;
	description?: string;
	assignee?: string | null;
	createdAt?: number;
	updatedAt?: number;
};
