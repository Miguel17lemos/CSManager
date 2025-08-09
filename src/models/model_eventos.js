
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
	return "Eventos";
}

function getTableName()
{
    return "eeventos";
}

function getFieldLabel()
{
    return "resumo";
}

function getFields_Code() 
{
    return [
        {name: "condicao", extension: "vb"}, 
        {name: "expressao", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["eeventosid"];
}



async function Proc_AfterPush()
{   
    const ccache = require("../ccache");
    try
    {
        await ccache.Proc_ClearCache("eeventos:intranet");
        await ccache.Proc_ClearCache("eeventos:extranet");
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