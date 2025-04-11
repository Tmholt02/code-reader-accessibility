import * as vscode from 'vscode';
const say = require('say');


export function activate(context: vscode.ExtensionContext) {
	console.log('Python Reader extension is now active!');

	// Read selected text or entire Python file
	const readPythonCommand = vscode.commands.registerCommand('python-reader.readPython', () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showInformationMessage('No active editor found.');
			return;
		}

		const doc = editor.document;

		if (doc.languageId !== 'python') {
			vscode.window.showInformationMessage('This extension only works with Python files.');
			return;
		}

		let textToRead = editor.document.getText(editor.selection);
		if (!textToRead || textToRead.trim() === '') {
			textToRead = editor.document.getText();
		}

		if (textToRead.trim() === '') {
			vscode.window.showInformationMessage('There is no text to read.');
			return;
		}

		vscode.window.showInformationMessage('Reading Python code...');
		say.speak(textToRead);
	});

	// Read the current line aloud
	const readCurrentLineCommand = vscode.commands.registerCommand('python-reader.readCurrentLine', () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showInformationMessage('No active editor found.');
			return;
		}

		const doc = editor.document;

		if (doc.languageId !== 'python') {
			vscode.window.showInformationMessage('This extension only works with Python files.');
			return;
		}

		const currentLine = editor.document.lineAt(editor.selection.active.line).text;

		if (!currentLine.trim()) {
			vscode.window.showInformationMessage('Current line is empty.');
			return;
		}

		vscode.window.showInformationMessage('Reading current line...');
		say.speak(currentLine);
	});

	context.subscriptions.push(readPythonCommand, readCurrentLineCommand);
}

export function deactivate() {
	say.stop();
}
