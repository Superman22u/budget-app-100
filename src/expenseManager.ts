import * as vscode from 'vscode';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  timestamp: number;
}

export class ExpenseManager {
  private static instance: ExpenseManager;
  private expenses: Expense[] = [];
  private storageKey = 'expense-tracker-data';
  private changeEventEmitter = new vscode.EventEmitter<void>();

  public readonly onExpensesChanged = this.changeEventEmitter.event;

  private constructor() {
    this.loadExpenses();
  }

  static getInstance(): ExpenseManager {
    if (!ExpenseManager.instance) {
      ExpenseManager.instance = new ExpenseManager();
    }
    return ExpenseManager.instance;
  }

  private loadExpenses(): void {
    const data = vscode.workspace.getConfiguration().get<string>(this.storageKey);
    if (data) {
      try {
        this.expenses = JSON.parse(data);
      } catch {
        this.expenses = [];
      }
    }
  }

  private saveExpenses(): void {
    const data = JSON.stringify(this.expenses);
    vscode.workspace.getConfiguration().update(this.storageKey, data, true);
    this.changeEventEmitter.fire();
  }

  addExpense(date: string, amount: number, description: string): void {
    const expense: Expense = {
      id: Date.now().toString(),
      date,
      amount,
      description,
      timestamp: Date.now(),
    };

    this.expenses.push(expense);
    this.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.saveExpenses();
  }

  getExpenses(): Expense[] {
    return [...this.expenses];
  }

  getSummary(): {
    totalAmount: number;
    count: number;
    byDate: { [date: string]: number };
    average: number;
  } {
    if (this.expenses.length === 0) {
      return {
        totalAmount: 0,
        count: 0,
        byDate: {},
        average: 0,
      };
    }

    const byDate: { [date: string]: number } = {};
    let totalAmount = 0;

    this.expenses.forEach((expense) => {
      totalAmount += expense.amount;
      if (!byDate[expense.date]) {
        byDate[expense.date] = 0;
      }
      byDate[expense.date] += expense.amount;
    });

    return {
      totalAmount,
      count: this.expenses.length,
      byDate,
      average: totalAmount / this.expenses.length,
    };
  }

  deleteExpense(id: string): void {
    this.expenses = this.expenses.filter((expense) => expense.id !== id);
    this.saveExpenses();
  }

  clearAllExpenses(): void {
    this.expenses = [];
    this.saveExpenses();
  }
}
