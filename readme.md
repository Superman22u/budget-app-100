# Expense Tracker for VS Code

A VS Code extension to track your expenses with a clean interface and summary views.

## Features

- **Add New Expenses**: Simple form to add date, amount, and description
- **View Expenses**: Beautiful summary with charts and detailed list
- **Data Persistence**: Expenses are saved automatically
- **Summary by Date**: See daily expense totals
- **Total/Average**: Quick overview of your spending

## How to Use

1. **Add Expense**:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Type "Add New Expense"
   - Fill in the form and click "Add Expense"

2. **View Expenses**:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Type "View Expenses"
   - See your expense summary and list

## Screenshots

### Add Expense Panel
![Add Expense](images/screenshot-add.png)

### View Expenses Panel
![View Expenses](images/screenshot-view.png)

## Installation

### From VSIX
1. Download the `.vsix` file
2. In VS Code, go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click "..." menu → "Install from VSIX..."
4. Select the downloaded file

## Requirements

- VS Code version 1.60.0 or higher

## Extension Settings

This extension doesn't add any VS Code settings.

## Data Storage

Expenses are stored in VS Code's global settings under:
```json
"expense-tracker-data": "[...]"