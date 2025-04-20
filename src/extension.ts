import * as vscode from 'vscode';
const say = require('say');

const getVoiceSpeed = () => vscode.workspace.getConfiguration().get<number>('python-reader.voiceSpeed', 1.0);
const getSelectedFont = () => vscode.workspace.getConfiguration().get<string>('editor.fontFamily', 'Fira Code');
const getVsCodeTheme = () => vscode.workspace.getConfiguration().get<string>('workbench.colorTheme', 'Default Dark+');
const setVoiceSpeed = (speed: number) => vscode.workspace.getConfiguration().update('python-reader.voiceSpeed', speed, true);
const setSelectedFont = (font: string) => vscode.workspace.getConfiguration().update('editor.fontFamily', font, true);
const setVsCodeTheme = (theme: string) => vscode.workspace.getConfiguration().update('workbench.colorTheme', theme, true);

export function speakWithSpeed(text: string) {
	const speed = getVoiceSpeed();
	console.log('Voice speed setting:', speed);

	say.speak(text, undefined, speed);

}

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
		speakWithSpeed(textToRead);
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
		speakWithSpeed(currentLine);
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
			speakWithSpeed(`You are on ${currentLine}`);
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
			speakWithSpeed(`Docstring says: ${docstring}`);
			return;
		}
	
		// Fallback to current line
		speakWithSpeed(currentLine || 'No symbol found on this line.');
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
			speakWithSpeed(nextLine || 'Blank line');
		} else {
			speakWithSpeed('End of file');
		}
	});
	
	const spellCurrentLineCommand = vscode.commands.registerCommand('python-reader.spellCurrentLine', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document.languageId !== 'python') return;
	
		const doc = editor.document;
		const lineNumber = editor.selection.active.line;
		const lineText = doc.lineAt(lineNumber).text.trim();
	
		if (!lineText) {
			speakWithSpeed('Blank line');
			return;
		}
	
		if (lineText.startsWith('#')) {
			const comment = lineText.replace(/^#\s?/, '');
			speakWithSpeed(`Comment: ${comment}`);
			return;
		}
	
		const insideDocstring = () => {
			let isInDocstring = false;
			let docstringType = null;
	
			for (let i = 0; i <= lineNumber; i++) {
				const text = doc.lineAt(i).text.trim();
				if (text.includes(`'''`) || text.includes(`"""`)) {
					const triple = text.includes(`'''`) ? `'''` : `"""`;
					if (!docstringType) {
						docstringType = triple;
						isInDocstring = true;
					} else if (triple === docstringType) {
						isInDocstring = false;
						docstringType = null;
					}
				}
			}
			return isInDocstring;
		};
	
		if (insideDocstring()) {
			let docstringLines: string[] = [];
			let started = false;
			let docstringType = null;
	
			for (let i = 0; i < doc.lineCount; i++) {
				const text = doc.lineAt(i).text.trim();
	
				if ((text.includes(`'''`) || text.includes(`"""`))) {
					const triple = text.includes(`'''`) ? `'''` : `"""`;
					if (!started) {
						started = true;
						docstringType = triple;
						docstringLines.push(text.replace(triple, '').trim());
					} else if (triple === docstringType) {
						docstringLines.push(text.replace(triple, '').trim());
						break;
					} else {
						docstringLines.push(text);
					}
				} else if (started) {
					docstringLines.push(text);
				}
			}
	
			const docstring = docstringLines.join(' ').trim();
			speakWithSpeed(`Docstring: ${docstring}`);
			return;
		}
	
		const hashIndex = lineText.indexOf('#');
		let codePart = lineText;
		let commentPart = '';
	
		if (hashIndex !== -1) {
			codePart = lineText.slice(0, hashIndex);
			commentPart = lineText.slice(hashIndex + 1).trim();
		}
	
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
	
		let toSpeak = spell(codePart);
		if (commentPart) {
			toSpeak += `. Start of comment: ${commentPart}`;
		}
	
		speakWithSpeed(toSpeak);
	});
	
	
	const openSettingsPanelCommand = vscode.commands.registerCommand('python-reader.openSettingsPanel', () => {
		const panel = vscode.window.createWebviewPanel(
			'pythonReaderSettings',
			'Python Reader Settings',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
	
		// HTML content for the panel
		panel.webview.html = getWebviewContent();
	
		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'setVoiceSpeed':
						setVoiceSpeed(message.value);
						break;
					case 'setFontFamily':
						setSelectedFont(message.value);
						break;
					case 'setColorTheme':
						setVsCodeTheme(message.value);
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	});
	
	context.subscriptions.push(openSettingsPanelCommand);
	
	

	context.subscriptions.push(
		readPythonCommand, 
		readCurrentLineCommand,
		readSymbolCommand,
		readNextLineCommand,
		spellCurrentLineCommand
	);
}

export function getWebviewContent(): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>Python Reader Settings</title>
			<style>
				body {
					font-family: sans-serif;
					padding: 1rem;
				}
				label {
					font-weight: bold;
					display: block;
					margin-top: 1rem;
				}
				select, input {
					width: 100%;
					padding: 0.4rem;
					font-size: 1rem;
				}
			</style>
		</head>
		<body>
			<h2>🛠️ Python Reader Settings</h2>

			<label for="speed">Voice Speed</label>
			<select id="speed">
				<option value="0.6" ${getVoiceSpeed() === 0.6 ? 'selected' : ''}>Slow</option>
				<option value="1.0" ${getVoiceSpeed() === 1.0 ? 'selected' : ''}>Normal</option>
				<option value="1.4" ${getVoiceSpeed() === 1.4 ? 'selected' : ''}>Fast</option>
			</select>

			<label for="font">Font Family</label>
			<input id="font" type="text" placeholder="e.g., Fira Code, Courier New" value="${getSelectedFont()}" />

			<label for="theme">VS Code Theme</label>
			<input id="theme" type="text" placeholder="e.g., Default Dark+, Solarized Light" value="${getVsCodeTheme()}" />

			<script>
				const vscode = acquireVsCodeApi();

				document.getElementById('speed').addEventListener('change', (e) => {
					vscode.postMessage({ command: 'setVoiceSpeed', value: parseFloat(e.target.value) });
				});

				document.getElementById('font').addEventListener('change', (e) => {
					vscode.postMessage({ command: 'setFontFamily', value: e.target.value });
				});

				document.getElementById('theme').addEventListener('change', (e) => {
					vscode.postMessage({ command: 'setColorTheme', value: e.target.value });
				});
			</script>
		</body>
		</html>
	`;
}


export function deactivate() {
	say.stop();
}
