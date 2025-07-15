import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Edit3, 
  Trash2, 
  Download, 
  Copy, 
  Search,
  Bookmark,
  CheckCircle2,
  Star
} from 'lucide-react';
import { askBot } from '@/utils/aiService';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  edited?: boolean;
  originalText?: string;
  reactions?: string[];
  bookmarked?: boolean;
  isFeedbackPrompt?: boolean;
}

interface EnhancedChatBotProps {
  userRole?: 'student' | 'mentor' | 'admin';
  height?: string;
}

const EnhancedChatBot: React.FC<EnhancedChatBotProps> = ({ 
  userRole = 'student', 
  height = 'h-96' 
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `Hi! I'm your AI ${userRole === 'student' ? 'learning' : userRole === 'mentor' ? 'mentoring' : 'administrative'} assistant. How can I help you today?`,
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messageCount, setMessageCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender}: ${msg.text}`
    ).join('\n');

    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    console.log("Token:", token)

    if (!token) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to use the bot',
        variant: 'destructive'
      });
      setIsTyping(false);
      return;
    }

    try {
      const result = await askBot(token, userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.answer,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: 'Bot error',
        description: error.message || 'Something went wrong while fetching bot response.',
        variant: 'destructive'
      });
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`${height} flex flex-col`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            AI {userRole === 'student' ? 'Learning' : userRole === 'mentor' ? 'Mentoring' : 'Administrative'} Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button aria-label="Search" variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)} className="h-8 w-8 p-0">
              <Search className="w-4 h-4" />
            </Button>
            <Button aria-label="Export Conversation" variant="ghost" size="sm" onClick={exportConversation} className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {showSearch && (
          <div className="mt-2">
            <input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Settings className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`bg-white text-gray-800 p-3 rounded-lg border ${message.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.edited && (
                        <Badge variant="secondary" className="text-xs">edited</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="sr-only" aria-live="polite">Bot is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me anything about your ${userRole === 'student' ? 'studies' : userRole === 'mentor' ? 'mentoring' : 'administration'}...`}
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatBot;
