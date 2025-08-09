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
	return "Scripts Web (VB.NET)";
}

function getTableName()
{
    return "escr";
}

function getFieldLabel()
{
    return "codigo";
}

function getFields_Code() 
{
    return [
        {name: "expressao", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["escrid"];
}

async function Proc_AfterPush()
{   
    const ccache = require("../ccache");
    try
    {
        await ccache.Proc_ClearCache("temRCTScript");        
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