
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  edited?: boolean;
  originalText?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  reactions?: string[];
  bookmarked?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  userRole: 'student' | 'mentor' | 'admin';
}

export const useConversations = (userRole: 'student' | 'mentor' | 'admin') => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem(`conversations_${userRole}`);
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((conv: any) => ({
        ...conv,
        lastActivity: new Date(conv.lastActivity),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })));
    }
  }, [userRole]);

  // Save conversations to localStorage when they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(`conversations_${userRole}`, JSON.stringify(conversations));
    }
  }, [conversations, userRole]);

  const createNewConversation = (title?: string): string => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: title || `Conversation ${conversations.length + 1}`,
      messages: [{
        id: '1',
        text: `Hi! I'm your AI ${userRole === 'student' ? 'learning' : userRole === 'mentor' ? 'mentoring' : 'administrative'} assistant. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date()
      }],
      lastActivity: new Date(),
      userRole
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? {
            ...conv,
            messages: [...conv.messages, message],
            lastActivity: new Date()
          }
        : conv
    ));
  };

  const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            lastActivity: new Date()
          }
        : conv
    ));
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? {
            ...conv,
            messages: conv.messages.filter(msg => msg.id !== messageId),
            lastActivity: new Date()
          }
        : conv
    ));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const getActiveConversation = (): Conversation | null => {
    return conversations.find(conv => conv.id === activeConversationId) || null;
  };

  const getBookmarkedMessages = (): Message[] => {
    return conversations.flatMap(conv => 
      conv.messages.filter(msg => msg.bookmarked)
    );
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    deleteConversation,
    getActiveConversation,
    getBookmarkedMessages
  };
};
