import { useRootSelector } from "./store/store";

function App() {
	const { queries } = useRootSelector((state) => state.api);

	console.log(queries);
	return <></>;
}

export default App;
