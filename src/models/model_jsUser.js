module.exports = {
    getFolderName,
    getTableName,
    getFieldLabel,
    getFields_Code,
    getFields_NotUse,
    Proc_AfterPush,
}

const vscode = require('vscode');

function getFolderName() 
{	
	return "Javascript de Utilizador"
}

function getTableName()
{
    return "jsu"
}

function getFieldLabel()
{
    return "titulo"
}

function getFields_Code() 
{
    return [
        {name: "javascript", extension: "js"}        
    ];
}

function getFields_NotUse() 
{	
	return [];
}

async function Proc_AfterPush()
{   
    const ccache = require("../ccache");
    try
    {
        await ccache.Proc_ClearCache(getTableName());        
    }
    catch (error) 
    {
        if (error) {
            vscode.window.showErrorMessage(`Erro ao limpar cache de ${getFolderName()}, reveja as definições. ${error}`)   
        }

        return false;
    }

    return true;
}