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
	return "Regras";
}

function getTableName()
{
    return "ebrule";
}

function getFieldLabel()
{
    return "descricao";
}

function getFields_Code() 
{
    return [
        {name: "mensagem", extension: "vb"}, 
        {name: "expressao", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["ebruleid"];
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