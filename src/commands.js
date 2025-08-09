module.exports = {
    Proc_CommandRegister
}


const vscode = require('vscode');
const option_pull = require('./options/option_pull') 
const option_push = require('./options/option_push') 


/**
 * @param {vscode.ExtensionContext} p_Context
 */
function Proc_CommandRegister(p_Context) 
{    
    
    const xOpenSettings = vscode.commands.registerCommand('phccscode.settings', async function () 
    {		
        vscode.commands.executeCommand('workbench.action.openSettings', 'phccscode');
	});
    


    p_Context.subscriptions.push(xOpenSettings);
    p_Context.subscriptions.push(option_pull.command());
	p_Context.subscriptions.push(option_push.command());
	p_Context.subscriptions.push(option_push.command_PushActiveTextEditor());
}







