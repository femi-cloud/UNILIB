// src/pages/EFriAI.tsx

import { useState, useRef, useEffect } from "react";
import { User, Loader2, Paperclip, X, FileText, Trash2, ArrowUp, Menu } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";
import SpinningBlobs from "@/components/ui/spinningBlobs";
import ChatSidebar, { Conversation } from "@/components/ui/ChatSidebar";
import { sendAIMessage } from "@/lib/api";
import MessageContent from "@/components/ui/MessageContent";

const suggestions = [
  "Quelles ressources sont disponibles pour moi ?",
  "Aide-moi à préparer l'examen de Réseaux",
  "Explique-moi les algorithmes de tri",
  "Quels cours pratiques me recommandes-tu ?",
];

type Message = {
  role: "user" | "ai";
  content: string;
  file?: { name: string; type: string; preview?: string };
  contextUsed?: boolean;
};

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateTitle = (message: string) => {
  const maxLength = 30;
  const cleaned = message.replace(/\n/g, ' ').trim();
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
};

const EFriAI = () => {
  const { user } = useSession();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useUnilibContext, setUseUnilibContext] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    if (user?.email) {
      const savedConversations = localStorage.getItem(`gemini_conversations_${user.email}`);
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          if (Array.isArray(parsed)) {
            const sorted = parsed.sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt);
            setConversations(sorted);
            
            if (sorted.length > 0) {
              setCurrentConversationId(sorted[0].id);
              setMessages(sorted[0].messages);
            }
          }
        } catch (error) {
          console.error('Erreur chargement conversations:', error);
          localStorage.removeItem(`gemini_conversations_${user.email}`);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.email && conversations.length > 0) {
      localStorage.setItem(`gemini_conversations_${user.email}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages,
            updatedAt: Date.now(),
            title: conv.messages.length === 0 && messages.length > 0 
              ? generateTitle(messages[0].content)
              : conv.title
          };
        }
        return conv;
      }));
    }
  }, [messages, currentConversationId]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Clé API Gemini manquante (côté client)');
      return;
    }
    try {
      const ai = new GoogleGenerativeAI(apiKey);
      setGenAI(ai);
      console.log('✅ Gemini AI initialisé');
    } catch (error) {
      console.error('Erreur initialisation Gemini:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "Nouvelle conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    if (!confirm("Supprimer cette conversation ?")) return;
    
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
        setMessages(remaining[0].messages);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
    
    toast({ title: "Conversation supprimée" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Format non supporté", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux (max 10 MB)", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToGenerativePart = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ inlineData: { data: base64, mimeType: file.type } });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    if (!currentConversationId) {
      const newConv: Conversation = {
        id: generateId(),
        title: generateTitle(text),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
    }

    const userMsg: Message = {
      role: "user",
      content: text || "(Fichier joint)",
      file: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        preview: filePreview || undefined,
      } : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const currentFile = selectedFile;
    removeFile();

    try {
      let aiText: string;
      let contextUsed = false;

      if (currentFile && genAI) {
        console.log('📎 Fichier détecté, utilisation du client Gemini');
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        const filePart = await fileToGenerativePart(currentFile);
        const prompt = `Tu es un assistant pédagogique pour l'IFRI au Bénin.
Analyse ce fichier et réponds à la question de l'étudiant.
Question: ${text || "Analyse ce fichier et explique son contenu"}`;
        
        const result = await model.generateContent([prompt, filePart]);
        aiText = result.response.text();
      } 
      else {
        console.log('💬 Message texte, appel backend avec contexte');
        
        try {
          const response = await sendAIMessage(text, useUnilibContext);
          console.log('✅ Réponse backend reçue:', response);
          aiText = response.response;
          contextUsed = response.context_used;
        } catch (backendError: any) {
          console.warn('❌ Backend indisponible:', backendError.message);
          
          if (genAI) {
            console.log('🔄 Fallback vers Gemini client');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            
            const prompt = `Tu es l'assistant pédagogique de Unilib, la plateforme de l'IFRI au Bénin.\nQuestion: ${text}`;
            const result = await model.generateContent(prompt);
            aiText = result.response.text();
          } else {
            throw backendError;
          }
        }
      }

      const aiMsg: Message = { role: "ai", content: aiText, contextUsed };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error('❌ Erreur IA:', error);
      
      let errorMessage = "Désolé, je rencontre un problème technique. 🔧";
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        errorMessage = "⏳ **L'assistant est très sollicité !** Le quota quotidien est atteint. Patientez 1 minute.";
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage = "🔧 **Modèle Gemini indisponible.** Contactez l'administrateur.";
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "🔑 **Clé API invalide.** Contactez l'administrateur.";
      }
      
      setMessages(prev => [...prev, { role: "ai", content: errorMessage }]);
      
      toast({
        title: "Erreur",
        description: error.message || "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = () => {
    if (!currentConversationId) return;
    if (!confirm("Effacer cette conversation ?")) return;
    
    handleDeleteConversation(currentConversationId);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] pb-20 lg:pb-0">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 border-b border-border bg-background flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="font-inter text-sm font-medium text-foreground">
                Assistant IA e-FRI
              </span>
              {messages.length > 0 && (
                <span className="font-inter text-xs text-muted-foreground">
                  • {messages.length} message{messages.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 font-inter text-xs"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SpinningBlobs disabled={false} />
              <h2 className="font-poppins font-semibold text-xl text-foreground mb-2">
                Assistant IA e-FRI
              </h2>
              <p className="font-inter text-sm text-muted-foreground mb-4 max-w-md">
                {useUnilibContext 
                  ? "Je connais toutes les ressources disponibles sur Unilib !"
                  : "Posez une question sur vos cours à l'IFRI."
                }
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="p-3 rounded-xl border border-border bg-background text-left font-inter text-sm hover:border-secondary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && (
                <div className="flex-shrink-0">
                  <SpinningBlobs disabled={false} size="small" />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-xl font-inter text-sm ${
                msg.role === "user"
                  ? "bg-secondary text-secondary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none"
              }`}>
                {msg.file && (
                  <div className="mb-3 p-2 bg-background/50 rounded-lg border border-border/50">
                    {msg.file.preview ? (
                      <img src={msg.file.preview} alt={msg.file.name} className="max-w-full h-auto rounded" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span className="text-xs">{msg.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {msg.role === "ai" ? (
                  <MessageContent content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <SpinningBlobs disabled={false} size="small" />
              </div>
              <div className="bg-muted p-4 rounded-xl rounded-tl-none">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {selectedFile && (
          <div className="px-4 pb-2">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                  <FileText size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="font-inter text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={removeFile} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ✅ FORMULAIRE ADAPTÉ À TON DESIGN */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border bg-background">
          <div className="w-[90%] md:w-[70%] max-w-[800px] h-16 bg-none mx-auto flex items-center border-2 border-border rounded-full shadow-md p-3">            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Joindre un fichier"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-background font-inter text-sm outline-none focus:border-secondary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || loading || !genAI}
              className="p-3 rounded-full bg-blue-500 disabled:bg-neutral-400 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EFriAI;