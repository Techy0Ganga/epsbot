
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your AI ${userRole === 'student' ? 'learning' : userRole === 'mentor' ? 'mentoring' : 'administrative'} assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messageCount, setMessageCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const feedbackPrompts = [
    "How has your learning experience been this week? I'd love to hear about your progress!",
    "What's been the most challenging part of your studies lately? Maybe I can help!",
    "Have you achieved any learning goals this week? Tell me about your wins!",
    "What subject or topic would you like to focus more on next week?",
    "How do you feel about your current study routine? Any improvements you'd like to make?",
    "What's been your favorite thing you learned recently?",
    "Is there anything about the platform or your learning experience you'd like to see improved?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string) => {
    const responses = {
      student: [
        "That's a great question! Let me help you understand this concept better.",
        "I can see you're working on this topic. Here's a helpful explanation...",
        "Let's break this down step by step to make it easier to understand.",
        "Great job asking for help! Learning is all about curiosity.",
        "I'm here to support your learning journey. Let's explore this together!",
        "Excellent question! This shows you're really thinking deeply about the subject.",
        "I love your curiosity! Here's what I think about that...",
        "That's a thoughtful question. Let me provide some insights..."
      ],
      mentor: [
        "Here's some insight that might help with your mentoring approach...",
        "Based on student engagement patterns, I'd suggest...",
        "This is a common challenge in mentoring. Here's what works well...",
        "Your students would benefit from this teaching strategy...",
        "Let me provide some data-driven recommendations for your students."
      ],
      admin: [
        "Here's the administrative data you requested...",
        "Based on platform analytics, I recommend...",
        "The system metrics show the following trends...",
        "For optimal platform management, consider...",
        "Here's a comprehensive overview of the current status..."
      ]
    };

    const roleResponses = responses[userRole];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  };

  const shouldShowFeedbackPrompt = () => {
    // Show feedback prompt randomly every 5-8 messages
    const randomInterval = Math.floor(Math.random() * 4) + 5; // 5-8 messages
    return messageCount > 0 && messageCount % randomInterval === 0 && userRole === 'student';
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

    // Simulate AI response delay
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Check if we should show a feedback prompt
      if (shouldShowFeedbackPrompt()) {
        setTimeout(() => {
          const feedbackPrompt = feedbackPrompts[Math.floor(Math.random() * feedbackPrompts.length)];
          const feedbackMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: feedbackPrompt,
            sender: 'bot',
            timestamp: new Date(),
            isFeedbackPrompt: true
          };
          setMessages(prev => [...prev, feedbackMessage]);
        }, 1000);
      }
      
      setIsTyping(false);
    }, 2000);
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditText(message.text);
    }
  };

  const handleSaveEdit = () => {
    if (!editingMessageId || !editText.trim()) return;

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessageId 
        ? { 
            ...msg, 
            originalText: msg.edited ? msg.originalText : msg.text,
            text: editText, 
            edited: true 
          }
        : msg
    ));

    setEditingMessageId(null);
    setEditText('');
    toast({
      title: "Message updated",
      description: "Your message has been successfully edited."
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Message deleted",
      description: "The message has been removed from the conversation."
    });
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message text has been copied."
    });
  };

  const toggleBookmark = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, bookmarked: !msg.bookmarked }
        : msg
    ));
  };

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender}: ${msg.text}`
    ).join('\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="h-8 w-8 p-0"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportConversation}
              className="h-8 w-8 p-0"
            >
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
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 bg-gray-50 rounded-lg">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-blue-500' 
                    : message.isFeedbackPrompt
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.isFeedbackPrompt ? (
                    <Star className="w-4 h-4 text-white" />
                  ) : (
                    <Settings className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`relative group ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : message.isFeedbackPrompt
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-gray-800 rounded-bl-none border border-yellow-200'
                    : 'bg-white text-gray-800 rounded-bl-none border'
                } p-3 rounded-lg`}>
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingMessageId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.text}</p>
                      
                      {message.isFeedbackPrompt && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Weekly Feedback
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.edited && (
                            <Badge variant="secondary" className="text-xs">
                              edited
                            </Badge>
                          )}
                          {message.bookmarked && (
                            <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMessage(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyMessage(message.text)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleBookmark(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="h-6 w-6 p-0 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-bl-none border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
