import { Link } from 'react-router-dom';
import { FileText, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="flex items-center mb-8">
        <FileText className="h-10 w-10 text-primary mr-2" />
        <span className="text-3xl font-bold text-gray-900">TalkToMe</span>
        <span className="text-3xl font-normal text-primary ml-1">Blueprint</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        Oops! The page you're looking for doesn't exist.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Link to="/">
          <Button size="lg">
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;