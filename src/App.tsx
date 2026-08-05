import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
	return (
		<ThemeProvider defaultTheme="light" storageKey="air-ide-theme">
			<TooltipProvider delay={300}>
				<RouterProvider router={router} />
			</TooltipProvider>
		</ThemeProvider>
	);
}

export default App;
