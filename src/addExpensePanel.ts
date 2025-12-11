import * as vscode from 'vscode';
import { ExpenseManager } from './expenseManager';

export class AddExpensePanel {
  private static panel: vscode.WebviewPanel | undefined;
  private static context: vscode.ExtensionContext | undefined;

  public static render(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    // If panel already exists, reveal it
    if (AddExpensePanel.panel) {
      AddExpensePanel.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    // Otherwise create new panel
    AddExpensePanel.context = context;
    AddExpensePanel.panel = vscode.window.createWebviewPanel('addExpense', 'Add New Expense', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [extensionUri],
    });

    // Set HTML content
    AddExpensePanel.panel.webview.html = AddExpensePanel.getWebviewContent(AddExpensePanel.panel.webview, extensionUri);

    // Handle messages from webview
    AddExpensePanel.panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'addExpense':
            try {
              const expenseManager = ExpenseManager.getInstance();
              expenseManager.addExpense(message.date, parseFloat(message.amount), message.description);

              // Send success message back to webview
              AddExpensePanel.panel?.webview.postMessage({
                command: 'expenseAdded',
                success: true,
              });

              vscode.window.showInformationMessage('Expense added successfully!');
            } catch (error) {
              vscode.window.showErrorMessage('Failed to add expense: ' + error);
            }
            break;

          case 'closePanel':
            AddExpensePanel.dispose();
            break;
        }
      },
      undefined,
      context.subscriptions
    );

    // Handle panel disposal
    AddExpensePanel.panel.onDidDispose(
      () => {
        AddExpensePanel.panel = undefined;
      },
      null,
      context.subscriptions
    );
  }

  private static getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));

    // Get nonce for CSP
    const nonce = getNonce();

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
            <title>Add Expense</title>
        </head>
        <body>
            <div class="container">
                <h1>Add New Expense</h1>
                
                <div class="form-group">
                    <label for="date">Date:</label>
                    <input type="date" id="date" class="form-control" 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group">
                    <label for="amount">Amount:</label>
                    <input type="number" id="amount" class="form-control" 
                           step="0.01" min="0.01" placeholder="0.00" required>
                </div>
                
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" class="form-control" rows="3" 
                              placeholder="Enter expense description..." required></textarea>
                </div>
                
                <div class="button-group">
                    <button id="addBtn" class="btn btn-primary">Add Expense</button>
                    <button id="resetBtn" class="btn btn-secondary">Reset Form</button>
                    <button id="closeBtn" class="btn">Close</button>
                </div>
                
                <div id="message" class="message"></div>
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                const dateInput = document.getElementById('date');
                const amountInput = document.getElementById('amount');
                const descriptionInput = document.getElementById('description');
                const addBtn = document.getElementById('addBtn');
                const resetBtn = document.getElementById('resetBtn');
                const closeBtn = document.getElementById('closeBtn');
                const messageDiv = document.getElementById('message');
                
                // Add expense
                addBtn.addEventListener('click', () => {
                    const date = dateInput.value;
                    const amount = amountInput.value;
                    const description = descriptionInput.value.trim();
                    
                    // Validation
                    if (!date) {
                        showMessage('Please select a date', 'error');
                        return;
                    }
                    
                    if (!amount || parseFloat(amount) <= 0) {
                        showMessage('Please enter a valid amount (greater than 0)', 'error');
                        amountInput.focus();
                        return;
                    }
                    
                    if (!description) {
                        showMessage('Please enter a description', 'error');
                        descriptionInput.focus();
                        return;
                    }
                    
                    // Send to extension
                    vscode.postMessage({
                        command: 'addExpense',
                        date: date,
                        amount: amount,
                        description: description
                    });
                    
                    showMessage('Adding expense...', 'info');
                    addBtn.disabled = true;
                });
                
                // Reset form
                resetBtn.addEventListener('click', () => {
                    dateInput.value = new Date().toISOString().split('T')[0];
                    amountInput.value = '';
                    descriptionInput.value = '';
                    messageDiv.style.display = 'none';
                    addBtn.disabled = false;
                    amountInput.focus();
                });
                
                // Close panel
                closeBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'closePanel'
                    });
                });
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'expenseAdded' && message.success) {
                        showMessage('Expense added successfully!', 'success');
                        resetBtn.click();
                        
                        // Re-enable button after delay
                        setTimeout(() => {
                            addBtn.disabled = false;
                        }, 2000);
                    }
                });
                
                function showMessage(text, type) {
                    messageDiv.textContent = text;
                    messageDiv.className = \`message \${type}\`;
                    messageDiv.style.display = 'block';
                    
                    // Auto-hide success messages
                    if (type === 'success') {
                        setTimeout(() => {
                            messageDiv.style.display = 'none';
                        }, 3000);
                    }
                }
                
                // Focus amount input on load
                amountInput.focus();
                
                // Handle Enter key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addBtn.click();
                    }
                });
            </script>
        </body>
        </html>`;
  }

  public static dispose() {
    if (AddExpensePanel.panel) {
      AddExpensePanel.panel.dispose();
      AddExpensePanel.panel = undefined;
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
