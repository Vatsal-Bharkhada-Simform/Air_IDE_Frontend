import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
	return (
		<TooltipProvider delayDuration={300}>
			<RouterProvider router={router} />
		</TooltipProvider>
	);
}

export default App;
