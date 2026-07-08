import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
	return (
		<TooltipProvider delay={100} closeDelay={100}>
			<RouterProvider router={router} />
		</TooltipProvider>
	);
}

export default App;
