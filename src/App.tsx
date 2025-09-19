import { useEffect, useState } from "react";
import "./App.css";
import { BoardLayout } from "./components/Board/Board";
import { boards, tableaus, tasks } from "./data/mockData";

function App() {
	const [boardId, setBoardId] = useState<string>("");

	useEffect(() => {
		let local = localStorage.getItem("mockBoards");
		if (!local) {
			localStorage.setItem("mockBoards", JSON.stringify(boards));
		}

		local = localStorage.getItem("mockTableaus");
		if (!local) {
			localStorage.setItem("mockTableaus", JSON.stringify(tableaus));
		}

		local = localStorage.getItem("mockTasks");
		if (!local) {
			localStorage.setItem("mockTasks", JSON.stringify(tasks));
		}

		const id = localStorage.getItem("currentId") ?? "board-1";
		localStorage.setItem("currentId", id);
		setBoardId(id);
	}, []);

	return (
		<>
			<h1>Taccard</h1>
			<BoardLayout boardId={boardId} />
		</>
	);
}

export default App;
