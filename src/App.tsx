import { Button } from "@/components/ui/button";
import { useRootSelector } from "./store/store";

function App() {
	const { queries } = useRootSelector((state) => state.api);

	console.log(queries);
	return (
		<>
			<Button>Click me</Button>
		</>
	);
}

export default App;
