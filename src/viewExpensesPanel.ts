import * as vscode from 'vscode';
import { ExpenseManager } from './expenseManager';

export class ViewExpensesPanel {
  private static panel: vscode.WebviewPanel | undefined;
  private static context: vscode.ExtensionContext | undefined;
  private static expenseManager = ExpenseManager.getInstance();

  public static render(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    // If panel already exists, reveal it
    if (ViewExpensesPanel.panel) {
      ViewExpensesPanel.panel.reveal(vscode.ViewColumn.One);
      ViewExpensesPanel.update();
      return;
    }

    // Otherwise create new panel
    ViewExpensesPanel.context = context;
    ViewExpensesPanel.panel = vscode.window.createWebviewPanel('viewExpenses', 'View Expenses', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [extensionUri],
    });

    // Set initial HTML
    ViewExpensesPanel.update();

    // Handle messages from webview
    ViewExpensesPanel.panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'deleteExpense':
            ViewExpensesPanel.expenseManager.deleteExpense(message.id);
            ViewExpensesPanel.update();
            vscode.window.showInformationMessage('Expense deleted!');
            break;

          case 'clearAll':
            const selection = await vscode.window.showWarningMessage(
              'Are you sure you want to clear ALL expenses? This action cannot be undone.',
              { modal: true },
              'Yes',
              'No'
            );

            if (selection === 'Yes') {
              ViewExpensesPanel.expenseManager.clearAllExpenses();
              ViewExpensesPanel.update();
              vscode.window.showInformationMessage('All expenses cleared!');
            }
            break;

          case 'refresh':
            ViewExpensesPanel.update();
            break;

          case 'closePanel':
            ViewExpensesPanel.dispose();
            break;
        }
      },
      undefined,
      context.subscriptions
    );

    // Handle panel disposal
    ViewExpensesPanel.panel.onDidDispose(
      () => {
        ViewExpensesPanel.panel = undefined;
      },
      null,
      context.subscriptions
    );

    // Listen for expense changes
    ViewExpensesPanel.expenseManager.onExpensesChanged(() => {
      ViewExpensesPanel.update();
    });
  }

  private static update() {
    if (!ViewExpensesPanel.panel || !ViewExpensesPanel.context) {
      return;
    }

    ViewExpensesPanel.panel.webview.html = ViewExpensesPanel.getWebviewContent(ViewExpensesPanel.panel.webview, ViewExpensesPanel.context.extensionUri);
  }

  private static getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const expenses = ViewExpensesPanel.expenseManager.getExpenses();
    const summary = ViewExpensesPanel.expenseManager.getSummary();

    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));

    const nonce = getNonce();

    const expensesHtml =
      expenses.length > 0
        ? expenses
            .map(
              (expense) => `
                <tr>
                    <td>${expense.date}</td>
                    <td class="amount">$${expense.amount.toFixed(2)}</td>
                    <td>${expense.description}</td>
                    <td>
                        <button class="btn-delete" data-id="${expense.id}">Delete</button>
                    </td>
                </tr>
            `
            )
            .join('')
        : `<tr><td colspan="4" class="no-data">No expenses recorded yet</td></tr>`;

    const summaryByDate = Object.entries(summary.byDate)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(
        ([date, amount]) => `
                <tr>
                    <td>${date}</td>
                    <td class="amount">$${amount.toFixed(2)}</td>
                </tr>
            `
      )
      .join('');

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" 
                  content="default-src 'none'; 
                          style-src ${webview.cspSource} 'unsafe-inline'; 
                          script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>View Expenses</title>
        </head>
        <body>
            <div class="container">
                <div class="header-row">
                    <h1>Expense Summary</h1>
                    <button id="closeBtn" class="btn-close">✕</button>
                </div>
                
                <div class="summary-cards">
                    <div class="card">
                        <h3>Total Expenses</h3>
                        <p class="total">$${summary.totalAmount.toFixed(2)}</p>
                    </div>
                    <div class="card">
                        <h3>Number of Expenses</h3>
                        <p class="count">${summary.count}</p>
                    </div>
                    <div class="card">
                        <h3>Average Expense</h3>
                        <p class="average">$${summary.average.toFixed(2)}</p>
                    </div>
                </div>
                
                <h2>Expenses by Date</h2>
                <div class="table-container">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryByDate || '<tr><td colspan="2" class="no-data">No expenses by date</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <h2>All Expenses</h2>
                <div class="table-container">
                    <table class="expenses-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expensesHtml}
                        </tbody>
                    </table>
                </div>
                
                ${
                  expenses.length > 0
                    ? `
                    <div class="action-buttons">
                        <button id="clearAllBtn" class="btn-danger">Clear All Expenses</button>
                        <button id="refreshBtn" class="btn-secondary">Refresh</button>
                    </div>
                `
                    : ''
                }
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                // Delete buttons
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-delete')) {
                        const id = e.target.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this expense?')) {
                            vscode.postMessage({
                                command: 'deleteExpense',
                                id: id
                            });
                        }
                    }
                });
                
                // Clear all button
                const clearAllBtn = document.getElementById('clearAllBtn');
                if (clearAllBtn) {
                    clearAllBtn.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'clearAll'
                        });
                    });
                }
                
                // Refresh button
                const refreshBtn = document.getElementById('refreshBtn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'refresh'
                        });
                    });
                }
                
                // Close button
                const closeBtn = document.getElementById('closeBtn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'closePanel'
                        });
                    });
                }
                
                // Auto-refresh every 10 seconds to sync data
                setInterval(() => {
                    vscode.postMessage({ command: 'refresh' });
                }, 10000);
            </script>
        </body>
        </html>`;
  }

  public static dispose() {
    if (ViewExpensesPanel.panel) {
      ViewExpensesPanel.panel.dispose();
      ViewExpensesPanel.panel = undefined;
    }
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
