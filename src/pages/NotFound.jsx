import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";

function NotFound() {
	return (
		<Container>
			<div className="flex flex-col items-center justify-center py-20">
				<FileQuestion size={100} className="text-gray-400 mb-6" />

				<h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>

				<p className="text-lg text-gray-600 mb-8 text-center max-w-md">The page you are looking for doesn't exist or has been moved.</p>

				<div className="flex gap-4">
					<Button variant="outline" onClick={() => window.history.back()}>
						Go Back
					</Button>

					<Link to="/">
						<Button>Return Home</Button>
					</Link>
				</div>
			</div>
		</Container>
	);
}

export default NotFound;
