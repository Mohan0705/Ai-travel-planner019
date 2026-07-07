import React from "react";
import { 
  Compass, 
  LayoutDashboard, 
  PlaneTakeoff, 
  Map, 
  MessageSquare, 
  Wallet, 
  Bell, 
  LogOut, 
  User, 
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { User as UserType } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  unreadCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuth,
  unreadCount
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: "discover", label: "Discover Voyage", icon: Compass },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Plan New Trip", icon: PlaneTakeoff },
    { id: "itinerary", label: "Active Itinerary", icon: Map },
    { id: "chat", label: "Concierge Chat", icon: MessageSquare },
    { id: "expenses", label: "Expense & Budget", icon: Wallet },
    { id: "notifications", label: "Alert Center", icon: Bell, badge: unreadCount },
  ];

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-earth-dark border-b border-earth-border/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-earth-accent animate-pulse" />
          <span className="font-serif italic text-lg tracking-wide text-[#E6E1D3]">Voyage AI</span>
        </div>
        <button 
          id="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-earth-border/60 hover:text-white rounded-lg hover:bg-white/5"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Primary Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen w-72 bg-earth-dark text-[#E6E1D3] border-r border-earth-border/10
        flex flex-col justify-between transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-earth-border/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-earth-sage/10 border border-earth-sage/30">
              <Sparkles className="w-6 h-6 text-earth-sage" />
            </div>
            <div>
              <h1 className="font-serif italic text-xl tracking-wide text-white leading-none">Voyage AI</h1>
              <p className="text-[10px] uppercase font-mono tracking-widest text-earth-accent mt-1.5">Luxe Travel Studio</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                    ${isActive 
                      ? "bg-earth-dark-accent text-white border-l-4 border-earth-accent font-semibold" 
                      : "text-earth-border/65 hover:text-white hover:bg-white/5"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-earth-accent" : "text-earth-border/60"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-earth-accent text-white font-mono font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Profile Section */}
        <div className="p-4 border-t border-earth-border/10 bg-earth-dark-accent/40">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-earth-sage/20 border-2 border-earth-sage text-earth-border flex items-center justify-center text-earth-border font-bold uppercase font-sans">
                    {currentUser.username[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-earth-light-sage rounded-full border-2 border-earth-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
                  <p className="text-xs text-earth-border/60 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={onLogout}
                className="w-full flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl border border-earth-border/10 text-earth-border/65 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-all text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-earth-border/60 text-center mb-3">Login to unlock cloud saving, history logs, & persistent itineraries.</p>
              <button
                id="sidebar-signin-btn"
                onClick={onOpenAuth}
                className="w-full flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-earth-accent hover:bg-earth-accent/90 text-white font-semibold text-xs transition-all tracking-wider uppercase font-display"
              >
                <User className="w-4 h-4" />
                Access Account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
