import "./Tableau.scss";
import { memo, useEffect, useRef, useState } from "react";
import { type Tableau, type Task } from "../../types";
import { TaskCard } from "../Task/Task";
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

interface TableauProps {
	tableau: Tableau;
	tasks: Task[];
	updateTableau: (id: string, updater: (t: Tableau) => Tableau) => void;
	updateTask: (id: string, updater: (t: Task) => Task) => void;
	deleteTableau: (id: string) => void;
	onReorderTableau: (
		draggedId: string,
		targetId: string,
		position: "before" | "after"
	) => void;
	onTableauDragOver: (pos: "before" | "after") => void;
	onTableauDragLeave: () => void;
}

function TableauColumnComponent({
	tableau,
	tasks,
	updateTableau,
	updateTask,
	deleteTableau,
	onReorderTableau,
	onTableauDragOver,
	onTableauDragLeave,
}: TableauProps) {
	const tableauAreaRef = useRef<HTMLDivElement>(null);
	const taskAreaRef = useRef<HTMLDivElement>(null);
	const [isTaskDraggedOver, setIsTaskDraggedOver] = useState(false);
	const [dragging, setDragging] = useState(false);

	const addTask = () => {
		const newTask: Task = {
			id: `task-${crypto.randomUUID()}`,
			tableauId: tableau.id,
			title: "New task",
		};

		updateTask(newTask.id, () => newTask);
		updateTableau(tableau.id, (t) => ({
			...t,
			taskIds: [...t.taskIds, newTask.id],
		}));
	};

	// Drop portion of task
	useEffect(() => {
		if (!taskAreaRef.current) return;
		if (!tableau) return;

		const el = taskAreaRef.current;
		return dropTargetForElements({
			element: el,
			onDragEnter: ({ source }) => {
				if (
					source.data.type === "task" &&
					source.data.tableauId !== tableau.id
				) {
					setIsTaskDraggedOver(true);
				}
			},
			onDragLeave: () => setIsTaskDraggedOver(false),
			onDrop: ({ source }) => {
				setIsTaskDraggedOver(false);

				if (source.data.type !== "task") return;

				const task = source.data.task as Task;
				if (task.tableauId === tableau.id) return;

				// Remove from old tableau
				updateTableau(task.tableauId, (oldTableau) => ({
					...oldTableau,
					taskIds: oldTableau.taskIds.filter((id) => id !== task.id),
				}));

				// Add to new tableau
				updateTableau(tableau.id, (newTableau) => ({
					...newTableau,
					taskIds: [...newTableau.taskIds, task.id],
				}));

				updateTask(task.id, (t) => ({
					...t,
					tableauId: tableau.id,
				}));
			},
		});
	}, [tableau, updateTableau, updateTask]);

	// Drag portion of tableau
	useEffect(() => {
		if (!tableauAreaRef.current) return;

		const el = tableauAreaRef.current;
		return draggable({
			element: el,
			getInitialData: () => ({ type: "tableau", tableauId: tableau.id }),
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		});
	}, [tableau]);

	// Drop portion of tableau
	useEffect(() => {
		if (!tableauAreaRef.current || !tableau) return;

		const el = tableauAreaRef.current;
		return dropTargetForElements({
			element: el,
			onDragEnter: ({ source }) => {
				if (
					source.data.type === "tableau" &&
					source.data.tableauId !== tableau.id
				) {
					const handleMove = (e: DragEvent) => {
						const rect = el.getBoundingClientRect();
						const midpoint = rect.left + rect.width / 2;
						const pos: "before" | "after" =
							e.clientX < midpoint ? "before" : "after";
						onTableauDragOver(pos);
					};

					el.addEventListener("dragover", handleMove);
					return () => el.removeEventListener("dragover", handleMove);
				}
			},
			onDragLeave: () => onTableauDragLeave(),
			onDrop: ({ source, location }) => {
				onTableauDragLeave();
				if (source.data.type !== "tableau") return;

				const draggedId = source.data.tableauId as string;
				const targetId = tableau.id;
				if (draggedId === targetId) return;

				const rect = el.getBoundingClientRect();
				const midpoint = rect.left + rect.width / 2;
				const position =
					location.current.input.clientX < midpoint ? "before" : "after";

				onReorderTableau(draggedId, targetId, position);
			},
		});
	}, [tableau, onReorderTableau, onTableauDragOver, onTableauDragLeave]);

	return (
		<div
			ref={tableauAreaRef}
			className={`tableau ${dragging ? "dragging" : ""}`}
		>
			<div className="tableau-header">
				<h2 className="title">{tableau.name}</h2>
				<button className="hidden-button edit-title">
					<p>🖋️</p>
				</button>
				<button
					className="hidden-button trash"
					onClick={() => deleteTableau(tableau.id)}
				>
					<p>🗑️</p>
				</button>
			</div>
			<div
				ref={taskAreaRef}
				className={`tasks ${isTaskDraggedOver ? "dragged-over" : ""}`}
			>
				{tasks.map((task) => (
					<TaskCard key={task.id} task={task} />
				))}
				<div className="add-task">
					<button className="add-task-btn" onClick={() => addTask()}>
						Add new task
					</button>
				</div>
			</div>
		</div>
	);
}

export const TableauColumn = memo(
	TableauColumnComponent,
	(prevProps, nextProps) =>
		prevProps.tableau.id === nextProps.tableau.id &&
		prevProps.tableau.name === nextProps.tableau.name &&
		prevProps.tableau.taskIds.length === prevProps.tableau.taskIds.length &&
		prevProps.tasks === nextProps.tasks
);
