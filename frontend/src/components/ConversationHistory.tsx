
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Clock,
  Bookmark,
  Filter
} from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';

interface ConversationHistoryProps {
  userRole: 'student' | 'mentor' | 'admin';
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ userRole }) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    getBookmarkedMessages
  } = useConversations(userRole);

  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarked, setShowBookmarked] = useState(false);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const bookmarkedMessages = getBookmarkedMessages();

  const handleNewConversation = () => {
    createNewConversation();
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat History</CardTitle>
          <Button size="sm" onClick={handleNewConversation}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={!showBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBookmarked(false)}
              className="flex-1"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              All
            </Button>
            <Button
              variant={showBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBookmarked(true)}
              className="flex-1"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Saved
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {!showBookmarked ? (
            <div className="space-y-1 p-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversationId === conversation.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-800 truncate">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {conversation.messages[conversation.messages.length - 1]?.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatLastActivity(conversation.lastActivity)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {conversation.messages.length} msgs
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {bookmarkedMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No bookmarked messages</p>
                </div>
              ) : (
                bookmarkedMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-800 mb-2">{message.text}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
