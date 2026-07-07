import { supabase } from "../lib/supabase.ts";
import { Expense } from "../types";

export const ExpenseService = {
  async addExpense(tripId: string, expense: Expense, currency: string = "USD"): Promise<Expense> {
    const { error } = await supabase
      .from("expenses")
      .insert({
        id: expense.id,
        trip_id: tripId,
        title: expense.title,
        category: expense.category,
        amount: Number(expense.amount) || 0,
        currency,
        date: expense.date,
        description: expense.description || null
      });

    if (error) throw error;
    return expense;
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) throw error;
  }
};
