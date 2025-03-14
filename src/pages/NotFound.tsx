import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import Typography from "@mui/material/Typography";
import { MouseEvent } from "react";

/**
 * NotFound page component
 * Displayed when a user navigates to a non-existent route
 */
const NotFound: React.FC = () => {
  /**
   * Handler for the "Go Back" button click
   * @param {MouseEvent<HTMLButtonElement>} e - The click event
   */
  const handleGoBack = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    window.history.back();
  };

  return (
    <Container>
      <div className="flex flex-col items-center justify-center py-20">
        <FileQuestion size={100} className="text-gray-400 mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>

        <Typography variant="h5" color="textSecondary" paragraph>
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </Typography>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>

          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;
