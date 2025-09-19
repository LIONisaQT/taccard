import type { Board, Tableau, Task } from "../types";

export const saveBoard = (board: Board) => {
	const storedBoards = localStorage.getItem("mockBoards");
	let boards: Record<string, Board>;
	if (!storedBoards) {
		boards = { [board.id]: board };
	} else {
		boards = JSON.parse(storedBoards) as Record<string, Board>;
		boards[board.id] = board;
	}

	localStorage.setItem("mockBoards", JSON.stringify(boards));
};

export const saveTableau = (tableau: Tableau) => {
	const storedTableaus = localStorage.getItem("mockTableaus");
	let tableaus: Record<string, Tableau>;
	if (!storedTableaus) {
		tableaus = { [tableau.id]: tableau };
	} else {
		tableaus = JSON.parse(storedTableaus) as Record<string, Tableau>;
		tableaus[tableau.id] = tableau;
	}

	localStorage.setItem("mockTableaus", JSON.stringify(tableaus));
};

export const deleteTableauLocal = (id: string): boolean => {
	const storedTableaus = localStorage.getItem("mockTableaus");
	const tableaus = storedTableaus
		? (JSON.parse(storedTableaus) as Record<string, Tableau>)
		: {};

	const tableau = tableaus[id];
	if (!tableau) return false;

	if (tableau.taskIds.length > 0) {
		const confirm = window.confirm(
			`This tableau has ${tableau.taskIds.length} task(s). Deleting it will also delete those tasks. Continue?`
		);
		if (!confirm) return false;

		const storedTasks = localStorage.getItem("mockTasks");
		const tasks: Record<string, Task> = storedTasks
			? JSON.parse(storedTasks)
			: {};

		tableau.taskIds.forEach((tId) => {
			delete tasks[tId];
		});

		localStorage.setItem("mockTasks", JSON.stringify(tasks));
	}

	delete tableaus[id];
	localStorage.setItem("mockTableaus", JSON.stringify(tableaus));

	return true;
};

export const saveTask = (task: Task) => {
	const storedTasks = localStorage.getItem("mockTasks");
	let tasks: Record<string, Task>;
	if (!storedTasks) {
		tasks = { [task.id]: task };
	} else {
		tasks = JSON.parse(storedTasks) as Record<string, Task>;
		tasks[task.id] = task;
	}

	localStorage.setItem("mockTasks", JSON.stringify(tasks));
};

export const deleteTaskFromTableau = (task: Task): boolean => {
	const storedTableaus = localStorage.getItem("mockTableaus");
	const tableaus = storedTableaus
		? (JSON.parse(storedTableaus) as Record<string, Tableau>)
		: {};

	tableaus[task.tableauId].taskIds = tableaus[task.tableauId].taskIds.filter(
		(id) => id !== task.id
	);
	localStorage.setItem("mockTableaus", JSON.stringify(tableaus));
	return true;
};
