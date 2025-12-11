"use strict";
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var addExpensePanel_1 = require("./addExpensePanel");
var viewExpensesPanel_1 = require("./viewExpensesPanel");
function activate(context) {
    // Register Add Expense command
    var addExpenseDisposable = vscode.commands.registerCommand('expenseTracker.addExpense', function () {
        addExpensePanel_1.AddExpensePanel.createOrShow(context.extensionUri);
    });
    // Register View Expenses command
    var viewExpensesDisposable = vscode.commands.registerCommand('expenseTracker.viewExpenses', function () {
        viewExpensesPanel_1.ViewExpensesPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(addExpenseDisposable, viewExpensesDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
