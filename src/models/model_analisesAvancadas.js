
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
	return "Analises Avançadas";
}

function getTableName()
{
    return "eusql";
}

function getFieldLabel()
{
    return "descricao";
}

function getFields_Code() 
{
    return [
        {name: "sqlexpr", extension: "vb"}, 
        {name: "rowcss", extension: "css"},
        {name: "colcss", extension: "css"},
        {name: "expsnap", extension: "vb"},
        {name: "expmesnap", extension: "vb"},
        {name: "intexp", extension: "vb"},
        {name: "gintexp", extension: "vb"},
        {name: "graexp", extension: "vb"},
        {name: "graexp_2", extension: "vb"},
        {name: "graexp_3", extension: "vb"},
        {name: "graexp_4", extension: "vb"}        
    ];
}

function getFields_NotUse() 
{	
	return ["eusqlid"];
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
    