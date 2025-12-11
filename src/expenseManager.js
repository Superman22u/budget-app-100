"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ExpenseManager = void 0;
var vscode = require("vscode");
var ExpenseManager = /** @class */ (function () {
    function ExpenseManager() {
        this.expenses = [];
        this.storageKey = 'expense-tracker-data';
        this.changeEventEmitter = new vscode.EventEmitter();
        this.onExpensesChanged = this.changeEventEmitter.event;
        this.loadExpenses();
    }
    ExpenseManager.getInstance = function () {
        if (!ExpenseManager.instance) {
            ExpenseManager.instance = new ExpenseManager();
        }
        return ExpenseManager.instance;
    };
    ExpenseManager.prototype.loadExpenses = function () {
        var data = vscode.workspace.getConfiguration().get(this.storageKey);
        if (data) {
            try {
                this.expenses = JSON.parse(data);
            }
            catch (_a) {
                this.expenses = [];
            }
        }
    };
    ExpenseManager.prototype.saveExpenses = function () {
        var data = JSON.stringify(this.expenses);
        vscode.workspace.getConfiguration().update(this.storageKey, data, true);
        this.changeEventEmitter.fire();
    };
    ExpenseManager.prototype.addExpense = function (date, amount, description) {
        var expense = {
            id: Date.now().toString(),
            date: date,
            amount: amount,
            description: description,
            timestamp: Date.now()
        };
        this.expenses.push(expense);
        this.expenses.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
        this.saveExpenses();
    };
    ExpenseManager.prototype.getExpenses = function () {
        return __spreadArray([], this.expenses, true);
    };
    ExpenseManager.prototype.getSummary = function () {
        if (this.expenses.length === 0) {
            return {
                totalAmount: 0,
                count: 0,
                byDate: {},
                average: 0
            };
        }
        var byDate = {};
        var totalAmount = 0;
        this.expenses.forEach(function (expense) {
            totalAmount += expense.amount;
            if (!byDate[expense.date]) {
                byDate[expense.date] = 0;
            }
            byDate[expense.date] += expense.amount;
        });
        return {
            totalAmount: totalAmount,
            count: this.expenses.length,
            byDate: byDate,
            average: totalAmount / this.expenses.length
        };
    };
    ExpenseManager.prototype.deleteExpense = function (id) {
        this.expenses = this.expenses.filter(function (expense) { return expense.id !== id; });
        this.saveExpenses();
    };
    ExpenseManager.prototype.clearAllExpenses = function () {
        this.expenses = [];
        this.saveExpenses();
    };
    return ExpenseManager;
}());
exports.ExpenseManager = ExpenseManager;
