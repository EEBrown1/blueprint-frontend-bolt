import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, ChevronRight, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import { useChatStore } from '../../stores/chatStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  blueprintId: string;
}

const ChatInterface = ({ blueprintId }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    currentBlueprintId, 
    isTyping, 
    setCurrentBlueprint, 
    sendMessage,
    clearChat
  } = useChatStore();
  
  useEffect(() => {
    setCurrentBlueprint(blueprintId);
  }, [blueprintId, setCurrentBlueprint]);
  
  const currentMessages = currentBlueprintId ? messages[currentBlueprintId] || [] : [];
  
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    sendMessage(message);
    setMessage('');
    setShowSuggestions(false);
    
    // Focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
    setShowSuggestions(false);
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);
  
  const suggestions = [
    "What are the dimensions of the living room?",
    "How many bedrooms are in this plan?",
    "Where are the electrical outlets located?",
    "What materials do I need for the bathroom renovation?",
    "Can you identify the load-bearing walls?"
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="p-3 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-medium text-gray-800">Blueprint AI Assistant</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearChat}
          className="text-gray-600"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Clear Chat
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {currentMessages.map((msg) => (
          <motion.div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : msg.role === 'system'
                  ? 'bg-gray-100 text-gray-700 border border-gray-200'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              
              {msg.measurements && msg.measurements.length > 0 && (
                <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                  <div className="font-medium mb-1">Measurements:</div>
                  <ul className="list-disc pl-4">
                    {msg.measurements.map((measurement, i) => (
                      <li key={i}>{measurement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {msg.elements && msg.elements.length > 0 && (
                <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                  <div className="font-medium mb-1">Elements:</div>
                  <ul className="list-disc pl-4">
                    {msg.elements.map((element, i) => (
                      <li key={i}>
                        {element.name}: {element.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-200 rounded-lg px-4 py-2 text-gray-800">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <AnimatePresence>
        {showSuggestions && currentMessages.length <= 1 && (
          <motion.div 
            className="px-4 pb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Suggested questions</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSuggestions(false)}
                  className="h-6 w-6"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm text-left w-full px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center group"
                  >
                    <span className="text-gray-800">{suggestion}</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-3 border-t">
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this blueprint..."
              className="w-full rounded-md border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary p-3 resize-none min-h-[60px] max-h-32"
              rows={1}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={message.trim() === '' || isTyping}
            className="h-10 w-10 rounded-full flex-shrink-0"
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;