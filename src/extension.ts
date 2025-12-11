import * as vscode from 'vscode';
import { AddExpensePanel } from './addExpensePanel';
import { ViewExpensesPanel } from './viewExpensesPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('Expense Tracker extension is now active!');

  // Register Add Expense command
  const addExpenseDisposable = vscode.commands.registerCommand('expenseTracker.addExpense', () => {
    AddExpensePanel.render(context.extensionUri, context);
  });

  // Register View Expenses command
  const viewExpensesDisposable = vscode.commands.registerCommand('expenseTracker.viewExpenses', () => {
    ViewExpensesPanel.render(context.extensionUri, context);
  });

  context.subscriptions.push(addExpenseDisposable, viewExpensesDisposable);
}

export function deactivate() {
  // Clean up
  AddExpensePanel.dispose();
  ViewExpensesPanel.dispose();
}
