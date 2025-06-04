import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center">
          <FileText className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-900">TalkToMe</span>
          <span className="text-xl font-normal text-primary ml-1">Blueprint</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/settings" className="text-gray-700 hover:text-primary transition-colors">
            Settings
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white fixed inset-0 top-16 z-40 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5 mr-3 text-primary" />
                Dashboard
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-3 text-primary" />
                Settings
              </Link>
              <hr className="my-2" />
              <div className="py-2 px-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
              </div>
              <button 
                className="flex items-center py-2 px-4 text-left hover:bg-gray-100 rounded-md text-red-600"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;