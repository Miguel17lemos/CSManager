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
	return "Opções de Ecrã";
}

function getTableName()
{
    return "etl";
}

function getFieldLabel()
{
    return "resumo";
}

function getFields_Code() 
{
    return [
        {name: "expressao", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["etlid"];
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