import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Paperclip, X, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";

const suggestions = [
  "Explique-moi les algorithmes de tri",
  "Résume le cours de Base de Données",
  "Aide-moi à préparer l'examen de Réseaux",
  "Quelles sont les étapes d'un projet UML ?",
];

type Message = { 
  role: "user" | "ai"; 
  content: string;
  file?: { name: string; type: string; preview?: string };
};

const EFriAI = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [chat, setChat] = useState<any>(null);

  // ✅ CHARGER L'HISTORIQUE DEPUIS LOCALSTORAGE
  useEffect(() => {
    if (user?.email) {
      const savedMessages = localStorage.getItem(`gemini_chat_${user.email}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Erreur chargement historique:', error);
        }
      }
    }
  }, [user]);

  // ✅ SAUVEGARDER L'HISTORIQUE
  useEffect(() => {
    if (user?.email && messages.length > 0) {
      localStorage.setItem(`gemini_chat_${user.email}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // INITIALISER GEMINI
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const listModels = async () => { try { const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`); 
    const data = await response.json(); console.log("Modèles disponibles pour votre clé :", data.models); } 
    catch (e) { console.error("Impossible de lister les modèles", e); } }; 
    listModels();
    
    if (!apiKey) {
      console.error('Clé API Gemini manquante');
      toast({
        title: "Erreur de configuration",
        description: "La clé API Gemini n'est pas configurée",
        variant: "destructive",
      });
      return;
    }

    try {
      const ai = new GoogleGenerativeAI(apiKey);
      setGenAI(ai);
      console.log('✅ Gemini AI initialisé');
    } catch (error) {
      console.error('Erreur initialisation Gemini:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser l'IA",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ✅ INITIALISER CHAT AVEC HISTORIQUE
  useEffect(() => {

    if (!genAI) return;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Convertir l'historique en format Gemini
    const history = messages
      .filter(m => !m.file) // Exclure messages avec fichiers (pas supportés dans l'historique)
      .map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    const newChat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    setChat(newChat);
  }, [genAI, messages.length === 0]); // Réinitialiser seulement au début

  // AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ HANDLER FICHIER
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Seuls les images (JPG, PNG, GIF, WEBP) et PDF sont acceptés",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Preview pour les images
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ CONVERTIR FICHIER EN BASE64
  const fileToGenerativePart = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ✅ ENVOYER MESSAGE
  const sendMessage = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    if (!genAI) {
      toast({
        title: "IA non disponible",
        description: "L'assistant IA n'est pas encore prêt",
        variant: "destructive",
      });
      return;
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
      let result;

      if (currentFile) {
        // ✅ AVEC FICHIER
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const filePart = await fileToGenerativePart(currentFile);
        
        const prompt = `Tu es un assistant pédagogique pour l'IFRI (Institut de Formation et de Recherche en Informatique) au Bénin.
Analyse ce fichier et réponds à la question de l'étudiant en français ou en anglais selon la langue utilisée par l'étudiant.

Question: ${text || "Analyse ce fichier et explique son contenu"}`;

        result = await model.generateContent([prompt, filePart]);
      } else {
        // ✅ SANS FICHIER (avec historique)
        if (!chat) {
          throw new Error("Chat non initialisé");
        }

        const prompt = `Tu es un assistant pédagogique pour l'Institut de Formation et de Recherche en Informatique
         (IFRI) au Bénin.  Tu aides les étudiants en Génie Logiciel, Intelligence Artificielle, Sécurité Informatique,
          et autres filières informatiques.  Contexte de l'IFRI: - Formation en Licence (L1, L2, L3) et Master (M1, M2) - Domaines: 
          Programmation, Bases de données, Réseaux, IA, Sécurité informatique, UML, Internet et Multimédia, Systèmes embarqués et internet des objets,
          Génie Logiciel, etc. - Étudiants francophones d'Afrique de l'Ouest  Règles: - Réponds en français ou en anglais selon le prompt de l'étudiant
          - Sois clair, concis et pédagogique - Utilise des exemples adaptés au contexte africain quand pertinent - Si tu cites du code, utilise des commentaires en français
          - Encourage l'apprentissage autonome  
          
          Question de l'étudiant: ${text}`;

        result = await chat.sendMessage(prompt);
      }

      const response = result.response;
      const aiText = response.text();

      const aiMsg: Message = { role: "ai", content: aiText };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error('Erreur Gemini:', error);
      
      const errorMsg: Message = {
        role: "ai",
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer. 🔧"
      };
      setMessages(prev => [...prev, errorMsg]);

      toast({
        title: "Erreur",
        description: error.message || "Impossible de contacter l'IA",
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

  // ✅ EFFACER L'HISTORIQUE
  const clearHistory = () => {
    if (!confirm("Voulez-vous vraiment effacer tout l'historique ?")) return;
    
    setMessages([]);
    if (user?.email) {
      localStorage.removeItem(`gemini_chat_${user.email}`);
    }
    
    toast({
      title: "Historique effacé",
      description: "La conversation a été réinitialisée",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-20 lg:pb-0">
      {/* Header avec bouton clear */}
      {messages.length > 0 && (
        <div className="p-3 border-b border-border bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-secondary" />
            <span className="font-inter text-sm font-medium">
              {messages.length} message{messages.length > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 font-inter text-xs transition-colors"
          >
            <Trash2 size={14} />
            Effacer l'historique
          </button>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-secondary" />
            </div>
            <h2 className="font-poppins font-semibold text-xl text-foreground mb-2">
              Assistant IA e-FRI
            </h2>
            <p className="font-inter text-sm text-muted-foreground mb-2 max-w-md">
              Posez une question, uploadez un document ou une image pour obtenir de l'aide.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="p-3 rounded-xl border border-border bg-background text-left font-inter text-sm text-foreground hover:border-secondary hover:shadow-sm transition-all"
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-xl font-inter text-sm ${
              msg.role === "user" 
                ? "bg-secondary text-secondary-foreground rounded-tr-none" 
                : "bg-muted text-foreground rounded-tl-none"
            }`}>
              {/* Fichier attaché */}
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
              
              <div className="prose prose-sm max-w-none">
                {msg.content.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0 whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-muted p-4 rounded-xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preview fichier sélectionné */}
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
              <p className="font-inter text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border bg-background">
        <input
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
          disabled={loading || !genAI}
          className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-background font-inter text-sm outline-none focus:border-secondary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={(!input.trim() && !selectedFile) || loading || !genAI}
          className="p-3 rounded-xl bg-secondary text-secondary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default EFriAI;