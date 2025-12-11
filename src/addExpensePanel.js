"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AddExpensePanel = void 0;
var vscode = require("vscode");
var expenseManager_1 = require("./expenseManager");
var AddExpensePanel = /** @class */ (function () {
    function AddExpensePanel(panel, extensionUri) {
        var _this = this;
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
        this._panel.webview.html = this._getHtmlForWebview();
        this._setWebviewMessageListener();
    }
    AddExpensePanel.createOrShow = function (extensionUri) {
        var column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (AddExpensePanel.currentPanel) {
            AddExpensePanel.currentPanel._panel.reveal(column);
            return;
        }
        var panel = vscode.window.createWebviewPanel('addExpense', 'Add New Expense', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [extensionUri]
        });
        AddExpensePanel.currentPanel = new AddExpensePanel(panel, extensionUri);
    };
    AddExpensePanel.prototype._setWebviewMessageListener = function () {
        var _this = this;
        this._panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var expenseManager;
            return __generator(this, function (_a) {
                switch (message.command) {
                    case 'addExpense':
                        expenseManager = expenseManager_1.ExpenseManager.getInstance();
                        expenseManager.addExpense(message.date, parseFloat(message.amount), message.description);
                        vscode.window.showInformationMessage('Expense added successfully!');
                        this._panel.webview.postMessage({ command: 'resetForm' });
                        return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        }); }, undefined, this._disposables);
    };
    AddExpensePanel.prototype._getHtmlForWebview = function () {
        var webview = this._panel.webview;
        var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <link href=\"".concat(styleUri, "\" rel=\"stylesheet\">\n            <title>Add Expense</title>\n        </head>\n        <body>\n            <div class=\"container\">\n                <h1>Add New Expense</h1>\n                \n                <div class=\"form-group\">\n                    <label for=\"date\">Date:</label>\n                    <input type=\"date\" id=\"date\" class=\"form-control\" value=\"").concat(new Date().toISOString().split('T')[0], "\">\n                </div>\n                \n                <div class=\"form-group\">\n                    <label for=\"amount\">Amount:</label>\n                    <input type=\"number\" id=\"amount\" class=\"form-control\" step=\"0.01\" min=\"0\" placeholder=\"0.00\">\n                </div>\n                \n                <div class=\"form-group\">\n                    <label for=\"description\">Description:</label>\n                    <textarea id=\"description\" class=\"form-control\" rows=\"3\" placeholder=\"Enter expense description...\"></textarea>\n                </div>\n                \n                <div class=\"button-group\">\n                    <button id=\"addBtn\" class=\"btn btn-primary\">Add Expense</button>\n                    <button id=\"resetBtn\" class=\"btn btn-secondary\">Reset</button>\n                </div>\n                \n                <div id=\"message\" class=\"message\"></div>\n            </div>\n            \n            <script>\n                (function() {\n                    const vscode = acquireVsCodeApi();\n                    \n                    const dateInput = document.getElementById('date');\n                    const amountInput = document.getElementById('amount');\n                    const descriptionInput = document.getElementById('description');\n                    const addBtn = document.getElementById('addBtn');\n                    const resetBtn = document.getElementById('resetBtn');\n                    const messageDiv = document.getElementById('message');\n                    \n                    addBtn.addEventListener('click', () => {\n                        const date = dateInput.value;\n                        const amount = amountInput.value;\n                        const description = descriptionInput.value;\n                        \n                        if (!date || !amount || !description) {\n                            showMessage('Please fill in all fields', 'error');\n                            return;\n                        }\n                        \n                        if (parseFloat(amount) <= 0) {\n                            showMessage('Amount must be greater than 0', 'error');\n                            return;\n                        }\n                        \n                        vscode.postMessage({\n                            command: 'addExpense',\n                            date: date,\n                            amount: amount,\n                            description: description\n                        });\n                    });\n                    \n                    resetBtn.addEventListener('click', () => {\n                        dateInput.value = new Date().toISOString().split('T')[0];\n                        amountInput.value = '';\n                        descriptionInput.value = '';\n                        messageDiv.textContent = '';\n                    });\n                    \n                    window.addEventListener('message', event => {\n                        const message = event.data;\n                        if (message.command === 'resetForm') {\n                            resetBtn.click();\n                            showMessage('Expense added successfully!', 'success');\n                        }\n                    });\n                    \n                    function showMessage(text, type) {\n                        messageDiv.textContent = text;\n                        messageDiv.className = `message ${type}`;\n                        messageDiv.style.display = 'block';\n                        \n                        setTimeout(() => {\n                            messageDiv.style.display = 'none';\n                        }, 3000);\n                    }\n                    \n                    // Focus amount input on load\n                    amountInput.focus();\n                })();\n            </script>\n        </body>\n        </html>");
    };
    AddExpensePanel.prototype.dispose = function () {
        AddExpensePanel.currentPanel = undefined;
        this._panel.dispose();
        this._disposables.forEach(function (d) { return d.dispose(); });
    };
    return AddExpensePanel;
}());
exports.AddExpensePanel = AddExpensePanel;
