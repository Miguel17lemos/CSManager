
module.exports = {    
	getConnectionString,
	getPhcURL,
	getPhcSessionCookies,
	getExtensionInfo,	
	Proc_CheckConfiguration,
	Proc_CheckSqlConnection	
}


const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const ExtensionInfo = Proc_LoadExtensionInfo();




function getConnectionString() 
{	
	return vscode.workspace.getConfiguration('phccscode').get('ConnectionString');
}


function getPhcURL() 
{	
	return vscode.workspace.getConfiguration('phccscode').get('PhcURL');
}


function getPhcSessionCookies() 
{	
	return vscode.workspace.getConfiguration('phccscode').get('PhcSessionCookies');
}


function getExtensionInfo()
{	
	return ExtensionInfo;
}



function Proc_LoadExtensionInfo()
{
	const extensionPath = vscode.extensions.getExtension('miguel17lemos.phccscode')?.extensionPath;
    if (!extensionPath) return undefined;

    const packageJsonPath = path.join(extensionPath, 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const json = JSON.parse(content);

	return json;
}





function Proc_CheckConfiguration() 
{
	const xCheckList = [
        { label: "Connection string", getter: getConnectionString},
        { label: "Phc URL", getter: getPhcURL},
        { label: "Phc session", getter: getPhcSessionCookies}
    ];


	for(const xItem of xCheckList)
	{
		if (!xItem.getter()) 
		{
			vscode.window.showInformationMessage(getExtensionInfo().displayName + `- ${xItem.label} está por preencher!`);
			vscode.commands.executeCommand('phccscode.settings');
			return false;
		} 
	}



	/*Melhorar mais tarde*/
	if (!vscode.workspace.workspaceFolders) 
	{
		vscode.window.showErrorMessage('Nenhum workspace criado, de ter uma pagina abra um folder para usar este comando.');
		return false; 
	}


	return true;	
}






async function Proc_CheckSqlConnection(p_Msg)
{
	const sql = require('mssql');

	try 
	{
		await sql.connect(getConnectionString());
		if(p_Msg)
		{			
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: getExtensionInfo().displayName + " - Ligou ao servidor com SUCESSO!",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 100 });
				await new Promise(res => setTimeout(res, 3000)); // espera 3s
			});			
		}
		

		return true;
    } 
	catch (err) 
	{
        if(p_Msg)
		{
			vscode.window.showErrorMessage(`Erro a ligar ao servidor: ${err}`);
		}		
		return false;
    } 
	finally {
        sql.close();
    }
}




