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
	return "Valores por Defeito";
}

function getTableName()
{
    return "eudefs";
}

function getFieldLabel()
{
    return "descricao";
}

function getFields_Code() 
{
    return [
        {name: "expvb", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["eudefsid"];
}

async function Proc_AfterPush()
{   
    const ccache = require("../ccache");
    try
    {
        await ccache.Proc_ClearCache("eudefs:intranet");
        await ccache.Proc_ClearCache("eudefs:extranet");
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