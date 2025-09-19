import "./Board.scss";
import type { Board, Tableau, Task } from "../../types";
import { TableauColumn } from "../Tableau/Tableau";
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { saveBoard } from "../../utils/localDb";

interface BoardProps {
	boardId: string;
}

export function BoardLayout({ boardId }: BoardProps) {
	const [board, setBoard] = useState<Board>();
	const [tableaus, setTableaus] = useState<Record<string, Tableau>>({});
	const [tasks, setTasks] = useState<Record<string, Task>>({});
	const ref = useRef<HTMLDivElement>(null);
	const [dragTarget, setDragTarget] = useState<{
		tableauId: string;
		position: "before" | "after";
	} | null>(null);

	// Load board when ID comes through
	useEffect(() => {
		if (!boardId) return;

		const storedBoards = JSON.parse(localStorage.getItem("mockBoards") || "{}");
		const storedTableaus = JSON.parse(
			localStorage.getItem("mockTableaus") || "{}"
		);
		const storedTasks = JSON.parse(localStorage.getItem("mockTasks") || "{}");

		setBoard(storedBoards[boardId]);
		setTableaus(storedTableaus);
		setTasks(storedTasks);
	}, [boardId]);

	// Get tasks for tableau
	const tasksByTableau = useMemo(() => {
		if (!board) return {};

		const result: Record<string, Task[]> = {};
		board.tableauIds.forEach((tId) => {
			const tableau = tableaus[tId];
			if (!tableau) return;
			result[tId] = tableau.taskIds.map((taskId) => tasks[taskId]);
		});

		return result;
	}, [board, tableaus, tasks]);

	const updateTableau = useCallback(
		(id: string, updater: (t: Tableau) => Tableau) => {
			setTableaus((prev) => {
				const updated = { ...prev, [id]: updater(prev[id]) };
				localStorage.setItem("mockTableaus", JSON.stringify(updated));
				return updated;
			});
		},
		[]
	);

	const updateTask = useCallback((id: string, updater: (t: Task) => Task) => {
		setTasks((prev) => {
			const updated = { ...prev, [id]: updater(prev[id]) };
			localStorage.setItem("mockTasks", JSON.stringify(updated));
			return updated;
		});
	}, []);

	const addNewTableau = () => {
		if (!board) return;

		const newTableau: Tableau = {
			id: `tableau-${crypto.randomUUID()}`,
			boardId: boardId,
			name: "New tableau",
			taskIds: [],
		};

		setTableaus((prev) => ({
			...prev,
			[newTableau.id]: newTableau,
		}));

		setBoard((prev) =>
			prev ? { ...prev, tableauIds: [...prev.tableauIds, newTableau.id] } : prev
		);

		localStorage.setItem(
			"mockTableaus",
			JSON.stringify({ ...tableaus, [newTableau.id]: newTableau })
		);
	};

	const deleteTableau = (tableauId: string) => {
		if (!board) return;

		const tableau = tableaus[tableauId];
		if (!tableau) return;

		if (tableau.taskIds.length > 0) {
			const confirm = window.confirm(
				`This tableau has ${tableau.taskIds.length} task(s).` +
					`Deleting ${tableau.name} will delete those tasks as well. Continue?`
			);

			if (!confirm) return;
		}

		setTableaus((prev) => {
			const updated = { ...prev };
			delete updated[tableauId];

			localStorage.setItem("mockTableaus", JSON.stringify(updated));
			return updated;
		});

		setTasks((prev) => {
			const updated = { ...prev };
			tableau.taskIds.forEach((taskId) => delete updated[taskId]);
			localStorage.setItem("mockTasks", JSON.stringify(updated));
			return updated;
		});

		setBoard((prev) =>
			prev
				? {
						...prev,
						tableauIds: prev.tableauIds.filter((id) => id !== tableauId),
				  }
				: prev
		);
	};

	const reorderTableau = useCallback(
		(
			draggedId: string,
			targetId: string,
			position: "before" | "after" = "before"
		) => {
			if (!board) return;

			const currentOrder = board.tableauIds;
			const draggedIndex = currentOrder.indexOf(draggedId);
			const targetIndex = currentOrder.indexOf(targetId);

			if (draggedIndex === -1 || targetIndex === -1) return;

			const newOrder = [...currentOrder];
			newOrder.splice(draggedIndex, 1);

			const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
			newOrder.splice(insertIndex, 0, draggedId);

			setBoard((prev) => (prev ? { ...prev, tableauIds: newOrder } : prev));
		},
		[board]
	);

	// Update board when anything changes
	useEffect(() => {
		if (!boardId) return;
		if (!board) return;

		saveBoard(board);
	}, [board, boardId]);

	if (!board) {
		return (
			<div className="board">
				<h3>Unknown board</h3>
				<p>No data found for {boardId}</p>
			</div>
		);
	}

	return (
		<div ref={ref} className="board">
			<h1>{board.name}</h1>
			<div className="tableaus">
				{board.tableauIds.map((id) => {
					const before =
						dragTarget?.tableauId === id && dragTarget?.position === "before";
					const after =
						dragTarget?.tableauId === id && dragTarget?.position === "after";
					return (
						<Fragment key={id}>
							{before && <div className="placeholder-gap" />}
							<TableauColumn
								key={id}
								tableau={tableaus[id]}
								tasks={tasksByTableau[id] ?? []}
								updateTableau={updateTableau}
								updateTask={updateTask}
								deleteTableau={deleteTableau}
								onReorderTableau={reorderTableau}
								onTableauDragOver={(pos) =>
									setDragTarget({ tableauId: id, position: pos })
								}
								onTableauDragLeave={() => setDragTarget(null)}
							/>
							{after && <div className="placeholder-gap" />}
						</Fragment>
					);
				})}
				<div className="add-tableau">
					<button className="add-tableau-btn" onClick={addNewTableau}>
						<p>Add new tableau</p>
					</button>
				</div>
			</div>
		</div>
	);
}
