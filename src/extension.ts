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

	// new comand
	const readSymbolCommand = vscode.commands.registerCommand('python-reader.readSymbol', () => {
		const editor = vscode.window.activeTextEditor;
	
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found.');
			return;
		}
	
		const doc = editor.document;
		const cursorPos = editor.selection.active;
	
		if (doc.languageId !== 'python') {
			vscode.window.showInformationMessage('This command only works on Python files.');
			return;
		}
	
		const currentLine = doc.lineAt(cursorPos.line).text.trim();
	
		// Check for function or class definition
		if (currentLine.startsWith('def ') || currentLine.startsWith('class ')) {
			say.speak(`You are on ${currentLine}`);
			return;
		}
	
		// Check if cursor is inside a docstring
		let docstring = '';
		let foundStart = false;
		for (let i = cursorPos.line; i >= 0; i--) {
			const line = doc.lineAt(i).text.trim();
			if (line.includes(`"""`) || line.includes(`'''`)) {
				docstring = line + '\n' + docstring;
				foundStart = true;
				break;
			}
			docstring = line + '\n' + docstring;
		}
	
		if (foundStart) {
			say.speak(`Docstring says: ${docstring}`);
			return;
		}
	
		// Fallback to current line
		say.speak(currentLine || 'No symbol found on this line.');
	});

	const readNextLineCommand = vscode.commands.registerCommand('python-reader.readNextLine', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document.languageId !== 'python') return;
	
		const currentLine = editor.selection.active.line;
		const totalLines = editor.document.lineCount;
	
		if (currentLine + 1 < totalLines) {
			const newPos = new vscode.Position(currentLine + 1, 0);
			editor.selection = new vscode.Selection(newPos, newPos);
			editor.revealRange(new vscode.Range(newPos, newPos));
			const nextLine = editor.document.lineAt(currentLine + 1).text.trim();
			say.speak(nextLine || 'Blank line');
		} else {
			say.speak('End of file');
		}
	});
	
	const spellCurrentLineCommand = vscode.commands.registerCommand('python-reader.spellCurrentLine', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document.languageId !== 'python') return;
	
		const line = editor.document.lineAt(editor.selection.active.line).text;
		if (!line.trim()) {
			say.speak('Blank line');
			return;
		}
	
		// Find comment split
		const hashIndex = line.indexOf('#');
		let codePart = line;
		let commentPart = '';
	
		if (hashIndex !== -1) {
			codePart = line.slice(0, hashIndex);
			commentPart = line.slice(hashIndex + 1).trim();
		}
	
		// Function to spell code (same as before)
		const spell = (text: string) =>
			text.split('').map(char => {
				switch (char) {
					case ' ': return 'space';
					case '\t': return 'tab';
					case '(': return 'open parenthesis';
					case ')': return 'close parenthesis';
					case '{': return 'open curly brace';
					case '}': return 'close curly brace';
					case '[': return 'open square bracket';
					case ']': return 'close square bracket';
					case ':': return 'colon';
					case ',': return 'comma';
					case '.': return 'dot';
					case '\'': return 'single quote';
					case '"': return 'double quote';
					case '=': return 'equals';
					case '+': return 'plus';
					case '-': return 'minus';
					case '*': return 'asterisk';
					case '/': return 'slash';
					case '\\': return 'backslash';
					case '%': return 'percent';
					case '>': return 'greater than';
					case '<': return 'less than';
					case '!': return 'exclamation mark';
					default: return char;
				}
			}).join(', ');
	
		// Speak parts
		let toSpeak = spell(codePart);
	
		if (commentPart) {
			toSpeak += `. Start of comment: ${commentPart}`;
		}
	
		say.speak(toSpeak);
	});
	
	
	
	

	context.subscriptions.push(
		readPythonCommand, 
		readCurrentLineCommand,
		readSymbolCommand,
		readNextLineCommand,
		spellCurrentLineCommand
	);
}

export function deactivate() {
	say.stop();
}
