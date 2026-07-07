import React from "react";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Filter, 
  Activity,
  Hotel,
  Utensils,
  Car,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { Trip, Expense } from "../types";

interface ExpenseTrackerViewProps {
  trip: Trip | null;
  onAddExpense: (tripId: string, amount: number, title: string, category: string) => void;
  onRemoveExpense: (tripId: string, expenseId: string) => void;
}

const CATEGORIES = [
  { value: "hotel", label: "Lodging / Hotel", icon: Hotel, color: "text-earth-dark" },
  { value: "food", label: "Dining & Gastronomy", icon: Utensils, color: "text-earth-sage" },
  { value: "shopping", label: "Haute Couture Shopping", icon: ShoppingBag, color: "text-[#A0522D]" },
  { value: "transport", label: "Car Rental / Chauffeur", icon: Car, color: "text-earth-accent" },
  { value: "entertainment", label: "Museums & Excursions", icon: Sparkles, color: "text-earth-accent" },
  { value: "other", label: "Miscellaneous Bills", icon: Activity, color: "text-earth-text/50" }
];

export default function ExpenseTrackerView({ trip, onAddExpense, onRemoveExpense }: ExpenseTrackerViewProps) {
  // Add form states
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("hotel");
  const [filterCat, setFilterCat] = React.useState("all");

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-earth-bg text-earth-text/50">
        <Wallet className="w-16 h-16 text-earth-border animate-float" />
        <h3 className="font-serif italic font-light text-earth-text text-lg">No Active Itinerary Loaded</h3>
        <p className="text-xs text-earth-text/50 max-w-sm">Please load or select an active trip from the Dashboard to record luxury transaction lists.</p>
      </div>
    );
  }

  // SUM CALCULATIONS
  const totalLedgerExpenses = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  
  // Calculate potential activity costs integrated
  const totalActivityCosts = trip.itinerary.reduce((sum, day) => {
    const morningCost = day.morning?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const afternoonCost = day.afternoon?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const eveningCost = day.evening?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    return sum + morningCost + afternoonCost + eveningCost;
  }, 0);

  const totalSpent = totalLedgerExpenses + totalActivityCosts;
  const remainingCash = trip.budget - totalSpent;
  const percentageSpent = Math.min(100, (totalSpent / trip.budget) * 100);
  const isOverBudget = totalSpent > trip.budget;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onAddExpense(trip.id, Number(amount), title.trim(), category);
    setTitle("");
    setAmount("");
  };

  const filteredExpenses = trip.expenses?.filter(e => {
    if (filterCat === "all") return true;
    return e.category === filterCat;
  }) || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-bg text-earth-text">
      
      {/* Title */}
      <div>
        <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">Luxury Expense Ledger</h1>
        <p className="text-xs text-earth-text/50 mt-1">Monitor real-time accounts and expenditures mapped to **{trip.destination}**.</p>
      </div>

      {/* Analytics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Progress Card */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-white border border-earth-border space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#4A4A3A] font-mono font-semibold uppercase">LEDGER SPENDING TRACKER</p>
              <h3 className="font-serif italic font-light text-2xl text-[#4A4A3A] mt-1">
                ${totalSpent.toLocaleString()} <span className="text-sm text-earth-text/50">of ${trip.budget.toLocaleString()}</span>
              </h3>
            </div>
            
            {isOverBudget ? (
              <div className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-600 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>OVER BUDGET WARNING</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-earth-light-sage/40 border border-earth-border/50 flex items-center gap-2 text-earth-sage text-xs font-mono font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>BUDGET SAFE</span>
              </div>
            )}
          </div>

          <div className="w-full h-3 bg-earth-light-sage rounded-full overflow-hidden relative">
            <div 
              style={{ width: `${percentageSpent}%` }} 
              className={`h-full transition-all duration-500 ${isOverBudget ? "bg-rose-500" : "bg-earth-accent"}`}
            />
          </div>

          <div className="flex justify-between text-xs font-mono text-earth-text/50">
            <span>{percentageSpent.toFixed(1)}% Used</span>
            <span>${Math.max(0, remainingCash).toLocaleString()} remaining reserves</span>
          </div>
        </div>

        {/* Quick analytics card */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-white border border-earth-border flex flex-col justify-between h-[160px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-earth-border pb-2">
            <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-semibold">SUMMARY LOG</span>
            <TrendingUp className="w-4 h-4 text-earth-accent" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-earth-text/75">Ledger Billings:</span>
              <span className="font-mono text-earth-text">${totalLedgerExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-earth-text/75">Activity Costs:</span>
              <span className="font-mono text-earth-text">${totalActivityCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-earth-border pt-2">
              <span className="text-earth-accent">Overall Expenses:</span>
              <span className="font-mono text-earth-accent">${totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Add Form (Left) & Ledger Items (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Add Transaction form block */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-white border border-earth-border space-y-6 shadow-sm">
            <h3 className="font-serif italic font-light text-earth-text text-lg">Record New Transaction</h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/75">Transaction Title</label>
                <input 
                  id="expense-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Private cruise, Caviar tasting..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-sm font-medium shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/75">Expense Amount</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="expense-amount-input"
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-sm font-medium font-mono shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/75">Expense Category</label>
                <select 
                  id="expense-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-sm font-medium shadow-inner"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <button
                id="expense-add-submit"
                type="submit"
                className="w-full py-3 rounded-full bg-earth-accent hover:bg-earth-accent/90 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 font-sans shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Log to Ledger</span>
              </button>

            </form>
          </div>
        </div>

        {/* Expense Transactions Lists ledger */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-serif italic font-light text-earth-text text-lg">Transactions Ledger</h3>
            
            {/* Category Filter selector tabs */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              <button
                id="filter-category-all"
                onClick={() => setFilterCat("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans shrink-0 transition-all border
                  ${filterCat === "all" 
                    ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                    : "bg-white border border-earth-border text-earth-text/75 hover:bg-earth-light-sage/20"
                  }
                `}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  id={`filter-category-${cat.value}`}
                  key={cat.value}
                  onClick={() => setFilterCat(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans shrink-0 transition-all border
                    ${filterCat === cat.value 
                      ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                      : "bg-white border border-earth-border text-earth-text/75 hover:bg-earth-light-sage/20"
                    }
                  `}
                >
                  {cat.label.split(" / ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-2 shadow-sm">
            {filteredExpenses.length > 0 ? (
              <div className="divide-y divide-earth-border/60">
                {filteredExpenses.map((exp) => {
                  const catMatch = CATEGORIES.find(c => c.value === exp.category) || CATEGORIES[5];
                  const Icon = catMatch.icon;
                  
                  return (
                    <div key={exp.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2 rounded-xl bg-earth-light-sage/30 border border-earth-border/40 ${catMatch.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-earth-text truncate">{exp.title}</p>
                          <p className="text-[10px] font-mono text-earth-text/50 capitalize">{exp.category} • logged bills</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-earth-text">${exp.amount.toLocaleString()}</span>
                        <button
                          id={`delete-expense-btn-${exp.id}`}
                          onClick={() => onRemoveExpense(trip.id, exp.id)}
                          className="p-1.5 rounded-lg text-earth-text/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-earth-text/50 font-mono">
                No logged expenditures found for this category.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
