// src/components/ui/ChatSidebar.tsx

import { useState } from "react";
import { MessageSquare, Plus, Trash2, X, Menu, Clock, SquarePen } from "lucide-react";

export interface Conversation {
  id: string;
  title: string;
  messages: Array<{
    role: "user" | "ai";
    content: string;
    file?: { name: string; type: string; preview?: string };
    contextUsed?: boolean;
  }>;
  createdAt: number;
  updatedAt: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Formater la date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Grouper les conversations par date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.updatedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <>
      {/* Bouton toggle mobile */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-background border border-border rounded-lg shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          w-72 bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >

  {/* Header */}
<div className="p-3">
  <button
    onClick={onNewConversation}
    className="w-full flex items-center gap-3 px-3 py-2.5
               border border-border/50 rounded-lg
               hover:bg-muted/70 
               active:scale-[0.98]
               transition-all duration-150
               group"
  >
    <SquarePen 
      size={18} 
      className="text-foreground/80 group-hover:text-foreground transition-colors" 
    />
    
    <span className="font-inter text-sm text-foreground/80 group-hover:text-foreground transition-colors">
      Nouveau chat
    </span>
  </button>
</div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.keys(groupedConversations).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare size={32} className="text-muted-foreground mb-2" />
              <p className="font-inter text-sm text-muted-foreground">
                Aucune conversation
              </p>
              <p className="font-inter text-xs text-muted-foreground mt-1">
                Commencez une nouvelle discussion !
              </p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([dateKey, convs]) => (
              <div key={dateKey} className="mb-4">
                {/* Date header */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="font-inter text-xs text-muted-foreground font-medium">
                    {dateKey}
                  </span>
                </div>

                {/* Conversations du groupe */}
                {convs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                      relative flex items-center gap-3 px-3 py-3 mx-1 rounded-lg cursor-pointer
                      transition-colors group
                      ${currentConversationId === conv.id 
                        ? 'bg-secondary/20 border border-secondary/30' 
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    <MessageSquare size={16} className="text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm text-foreground truncate">
                        {conv.title}
                      </p>
                      <p className="font-inter text-xs text-muted-foreground truncate">
                        {conv.messages.length} message{conv.messages.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Bouton supprimer */}
                    {(hoveredId === conv.id || currentConversationId === conv.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive 
                                   hover:bg-destructive/10 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="font-inter text-xs text-muted-foreground text-center">
            {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
          </p>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;