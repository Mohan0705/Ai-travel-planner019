import React from "react";
import { 
  Sparkles, 
  Send, 
  MapPin, 
  HelpCircle, 
  Compass, 
  ShieldAlert, 
  Utensils, 
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { ChatMessage, Trip } from "../types";
import { useAuth } from "../context/AuthContext.tsx";
import { ChatService } from "../services/ChatService.ts";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

interface ChatAssistantViewProps {
  currentTrip: Trip | null;
}

const CHAT_PROMPTS = [
  { text: "Suggest 3 unique hidden gems.", icon: Compass },
  { text: "What are local culinary specialties?", icon: Utensils },
  { text: "Draft an efficient packing checklist.", icon: Sparkles },
  { text: "Highlight critical safety guidelines.", icon: ShieldAlert }
];

export default function ChatAssistantView({ currentTrip }: ChatAssistantViewProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Initialize and load history
  React.useEffect(() => {
    let active = true;
    async function loadHistory() {
      const destinationText = currentTrip 
        ? `I see we are currently planning your spectacular ${currentTrip.travelStyle} tour to **${currentTrip.destination}, ${currentTrip.country}**.`
        : "I can assist you in researching hidden gems, seasonal weather conditions, packing recommendations, local safety, or drafting optimized budget curves.";

      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "model",
        text: `Greetings! I am **Voyage Concierge**, your private digital travel assistant. 

${destinationText} 

What specific culinary questions, local transits, or safety conditions can I verify for you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (currentUser) {
        try {
          setLoading(true);
          const history = await ChatService.getChatHistory(currentUser.id, currentTrip?.id);
          if (active) {
            if (history.length > 0) {
              setMessages(history);
            } else {
              setMessages([welcomeMsg]);
            }
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
          if (active) setMessages([welcomeMsg]);
        } finally {
          if (active) setLoading(false);
        }
      } else {
        if (active) {
          setMessages([welcomeMsg]);
        }
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [currentTrip, currentUser]);

  // Scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    // Save user message in Supabase if logged in
    if (currentUser) {
      try {
        await ChatService.saveMessage(currentUser.id, {
          role: "user",
          text: textToSend,
          tripId: currentTrip?.id
        });
      } catch (err) {
        console.error("Failed to persist user chat message to database:", err);
      }
    }

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentTrip
        })
      });

      if (!response.ok) {
        throw new Error("Chat api request failed.");
      }

      const data = await response.json();
      const aiResponseText = data.text || "Pardon, I encountered a temporary latency. Please verify again.";

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "model",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save AI response in Supabase if logged in
      if (currentUser) {
        try {
          await ChatService.saveMessage(currentUser.id, {
            role: "model",
            text: aiResponseText,
            tripId: currentTrip?.id
          });
        } catch (err) {
          console.error("Failed to persist model chat response to database:", err);
        }
      }

    } catch (err) {
      console.error("Chat message delivery failed", err);
      const errResponseText = "I am experiencing brief cloud connection lapses. Let's research this locally or try again once your Gemini API key is configured.";
      
      const errMsg: ChatMessage = {
        id: `msg-ai-err-${Date.now()}`,
        role: "model",
        text: errResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errMsg]);

      if (currentUser) {
        try {
          await ChatService.saveMessage(currentUser.id, {
            role: "model",
            text: errResponseText,
            tripId: currentTrip?.id
          });
        } catch (dbErr) {
          console.error("Failed to persist error message to database:", dbErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen bg-earth-bg text-earth-text">
      
      {/* Header Info */}
      <div className="p-4 border-b border-earth-border/60 bg-white/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-earth-accent/10 border border-earth-accent/20 text-earth-accent relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-earth-bg" />
          </div>
          <div>
            <h2 className="font-serif italic font-light text-earth-text text-lg">Voyage Concierge</h2>
            <p className="text-[10px] font-mono text-earth-text/50 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-earth-accent" />
              <span>Multi-Agent Specialist is online</span>
            </p>
          </div>
        </div>

        {currentTrip && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-earth-border text-xs shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-earth-accent" />
            <span className="text-earth-text/75">Context: <strong className="text-earth-text font-serif italic font-medium">{currentTrip.destination}</strong></span>
          </div>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => {
          const isAI = m.role === "model";
          return (
            <div key={m.id} className={`flex gap-3 max-w-2xl ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 font-sans border
                ${isAI 
                  ? "bg-earth-accent/10 text-earth-accent border-earth-accent/30" 
                  : "bg-earth-light-sage text-earth-text border-earth-border"
                }
              `}>
                {isAI ? "V" : "U"}
              </div>

              {/* Text Bubbles */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-line border shadow-sm
                  ${isAI 
                    ? "bg-white text-earth-text border-earth-border" 
                    : "bg-earth-accent/10 text-earth-text border-earth-accent/20"
                  }
                `}>
                  {m.text}
                </div>
                <p className="text-[9px] font-mono text-earth-text/40 text-right px-2">{m.timestamp}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-earth-accent/10 text-earth-accent border border-earth-accent/30 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse font-sans">
              V
            </div>
            <div className="p-4 rounded-2xl bg-white border border-earth-border flex items-center gap-1.5 py-3 px-4 shadow-sm">
              <span className="w-1.5 h-1.5 bg-earth-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-earth-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-earth-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompts Row */}
      {messages.length <= 2 && (
        <div className="px-6 py-2 border-t border-earth-border/40 flex gap-3 overflow-x-auto shrink-0 bg-earth-light-sage/20">
          {CHAT_PROMPTS.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                id={`chat-preset-prompt-${idx}`}
                key={idx}
                onClick={() => handleSendMessage(prompt.text)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-earth-border hover:border-earth-accent/40 text-xs font-medium text-earth-text hover:bg-earth-light-sage/35 transition-all shrink-0 font-sans shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-earth-accent" />
                <span>{prompt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input Form Box */}
      <div className="p-4 border-t border-earth-border/60 bg-white/50 backdrop-blur-md shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto flex gap-3 p-1.5 bg-white border border-earth-border rounded-full items-center shadow-md">
          <input
            id="chat-user-input"
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your travel inquiry here... (e.g. recommend 3 cafes in Paris)"
            className="flex-1 bg-transparent border-none text-earth-text focus:outline-none px-4 text-xs md:text-sm font-medium placeholder-earth-text/40"
          />
          <button
            id="chat-submit-message"
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-full bg-earth-accent text-white hover:bg-earth-accent/90 transition-all disabled:opacity-40 disabled:hover:bg-earth-accent cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
