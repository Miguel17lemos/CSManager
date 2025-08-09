// The module 'vscode' contains the VS Code extensibility API
const {	Proc_CheckConfiguration, Proc_CheckSqlConnection } = require("./src/settings");
const { Proc_CommandRegister } = require("./src/commands")

// This method is called when your extension is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) 
{
	Proc_CommandRegister(context);
	
	if (!Proc_CheckConfiguration()) 
	{
		return false;
	}
	
	Proc_CheckSqlConnection(true)
}


// This method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
