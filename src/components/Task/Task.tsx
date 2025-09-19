import "./Task.scss";
import { memo, useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

interface TaskProps {
	task: Task;
}

function TaskCardComponent({ task }: TaskProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState(false);

	// Drag portion of task
	useEffect(() => {
		if (!ref.current) return;

		const el = ref.current;
		return draggable({
			element: el,
			getInitialData: () => ({ type: "task", task }),
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		});
	}, [task]);

	return (
		<div ref={ref} className={`task ${dragging ? "dragging" : ""}`}>
			<h3 className="title">{task.title}</h3>
			<div className="assignee">
				<p>🧑</p>
				<p>{task.assignee ?? "No assignee"}</p>
			</div>
			<div className="description">
				<p>{task.description}</p>
			</div>
		</div>
	);
}

export const TaskCard = memo(
	TaskCardComponent,
	(prevProps, nextProps) =>
		prevProps.task.id === nextProps.task.id &&
		prevProps.task.title === nextProps.task.title &&
		prevProps.task.description === nextProps.task.description &&
		prevProps.task.assignee === nextProps.task.assignee
);
