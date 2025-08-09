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
	return "Itens Monitores";
}

function getTableName()
{
    return "emoi";
}

function getFieldLabel()
{
    return "resumo";
}

function getFields_Code() 
{
    return [
        {name: "ecol1", extension: "vb"}, 
        {name: "sqlexpr", extension: "vb"},
        {name: "cabh", extension: "html"},
        {name: "ecol3", extension: "vb"},
        {name: "template3", extension: "vb"},
        {name: "intexp", extension: "vb"}
    ];
}

function getFields_NotUse() 
{	
	return ["emoiid"];
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


