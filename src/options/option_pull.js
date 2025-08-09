module.exports = {
    command
}


const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const TSql = require('mssql');
const { getConnectionString, getExtensionInfo, Proc_CheckConfiguration } = require("../settings");
const model_jsUser = require('../models/model_jsUser')
const model_scriptsWeb = require('../models/model_scriptsWeb')
const model_itensMonitores = require('../models/model_itensMonitores')
const model_valoresDefeito = require('../models/model_valoresDefeito')
const model_regras = require('../models/model_regras')
const model_opcoesEcra = require('../models/model_opcoesEcra')
const model_eventos = require('../models/model_eventos')
const model_analisesAvancadas = require('../models/model_analisesAvancadas')



function command() 
{
    const xCommand = vscode.commands.registerCommand('phccscode.pull', function () 
    {
        if (!Proc_CheckConfiguration(true)) 
        {
            return;
        }
        

        showOptions();
    });

    return xCommand;
}








async function showOptions() 
{
    const xAll = [{ label: "Receber TODOS", model: undefined}]
    const xCategories = [
        { label: model_jsUser.getFolderName(), model: model_jsUser},
        { label: model_scriptsWeb.getFolderName(), model: model_scriptsWeb},
        { label: model_itensMonitores.getFolderName(), model: model_itensMonitores},
        { label: model_valoresDefeito.getFolderName(), model: model_valoresDefeito},
        { label: model_regras.getFolderName(), model: model_regras},
        { label: model_opcoesEcra.getFolderName(), model: model_opcoesEcra},
        { label: model_eventos.getFolderName(), model: model_eventos},
        { label: model_analisesAvancadas.getFolderName(), model: model_analisesAvancadas},        
    ];


    

    const xCategoriePick = await vscode.window.showQuickPick([...xAll, ...xCategories], {
        placeHolder: "",
        canPickMany: false,
    });
    
    


    if (!xCategoriePick) 
    {
        vscode.window.showInformationMessage(getExtensionInfo().displayName + " - Não selecionou nenhuma categoria");
        return;
    }


    const xCategorieSel = (!xCategoriePick.model ? xCategories : [xCategoriePick]);
    




    let xOptions = []
    let xConnection;    
    try 
    {
        xConnection = await TSql.connect(getConnectionString());
        for (const xCat of xCategorieSel) 
        {
            const xResult = await Proc_GetOptions(xCat, xConnection.request());
            if(!xResult || !xResult.length)
            {
                continue;
            }
            
            xOptions = [...xOptions, ...xResult];
        }
    } 
    catch (error) 
    {
        vscode.window.showErrorMessage(`Erro ao ler opções: ${error}`)
    }
    finally 
    {
        if (xConnection) 
        {
            xConnection.close();
        }
    }



    


    
    if(!xOptions || !xOptions.length)
    {
        vscode.window.showInformationMessage(getExtensionInfo().displayName + ` - Não existem opções para a categoria "${xCategoriePick.label}"`);
        return;
    }   


    


    let xOptionsSel;
    if (xCategorieSel.length === 1) 
    {
         xOptionsSel = await vscode.window.showQuickPick(xOptions, {
            placeHolder: xCategorieSel.label,
            canPickMany: true,
        });
    
    
        if (!xOptionsSel || !xOptionsSel.length) 
        {
            vscode.window.showInformationMessage(getExtensionInfo().displayName + " - Não selecionou nenhuma opção");
            return;
        }   
    }
    else
    {
        xOptionsSel = xOptions;
    }

    
    let xIncrementUnd = 0;
    let xIncrement = 0;

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: getExtensionInfo().displayName + " - Pull",
        cancellable: false
    }, async (progress) => {
    
        try 
        {
            xConnection = await TSql.connect(getConnectionString());
            
            xIncrementUnd = 100 / xOptionsSel.length;
            xIncrement = 0
            for (const xOption of xOptionsSel) 
            {          
                xIncrement += xIncrementUnd;      
                progress.report({ increment: xIncrement, message: `A descarregar '${xOption.label}'` });
                await Proc_Pull(xOption, xConnection.request())
            }
        } 
        catch (error) 
        {
            vscode.window.showErrorMessage(`Erro ao carregar opções: ${error}`)
        }
        finally 
        {
            if (xConnection) 
            {
                xConnection.close();
            }
        }



    
        progress.report({ increment: 100, message: "Concluído" });
        await new Promise(res => setTimeout(res, 100));
    });
}







async function Proc_GetOptions(p_Categorie, p_SqlPoolResquest) 
{
    let xQuery = `select stamp = ${p_Categorie.model.getTableName()}stamp, label = ${p_Categorie.model.getFieldLabel()} from ${p_Categorie.model.getTableName()}(nolock) order by ${p_Categorie.model.getFieldLabel()}`
    const xResult = await p_SqlPoolResquest.query(xQuery);

    return xResult.recordset.map(row => ({
        label: row.label,
        stamp: row.stamp,
        categorie: p_Categorie
    }));
}










async function Proc_Pull(p_Option, p_SqlPoolResquest)
{
    let xNotInport = [(p_Option.categorie.model.getTableName() + "stamp").toLowerCase(), "ousrinis", "ousrdata", "ousrhora", "usrinis", "usrdata", "usrhora"];
    xNotInport = [...xNotInport, ...p_Option.categorie.model.getFields_NotUse(), ...p_Option.categorie.model.getFields_Code().map(s=>s.name.toLowerCase())];

    
    let xQuery = `select * from ${p_Option.categorie.model.getTableName()}(nolock) where ${p_Option.categorie.model.getTableName()}Stamp = @stamp order by ${p_Option.categorie.model.getFieldLabel()}`
    p_SqlPoolResquest.input("stamp", p_Option.stamp);
    let xResult = await p_SqlPoolResquest.query(xQuery);
    xResult = xResult.recordset[0];
    
       
    const xData = [{
        tabela: p_Option.categorie.model.getTableName(),
        stamp: p_Option.stamp,
        label: p_Option.label,
        campos: Object.entries(xResult)
        .filter((xItem) => !xNotInport.includes(xItem[0].trim().toLowerCase()))
        .reduce((xItem, [key, value]) => {
            xItem[key] = value;
            return xItem;
        }, {})
    }]

    
    const xFolderName = path.join(p_Option.categorie.model.getFolderName(), p_Option.label);
    Proc_CreateFile(xFolderName, "data.js", JSON.stringify(xData, null, 4));
    for (const xFileCode of p_Option.categorie.model.getFields_Code()) 
    {
        Proc_CreateFile(xFolderName, `${xFileCode.name}.${xFileCode.extension}`, xResult[xFileCode.name.toLowerCase()]);
    }
}








function Proc_CreateFile(p_path, p_file, p_data) 
{    
    p_path = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, p_path);
    

    fs.mkdir(p_path, { recursive: true }, (error) => 
    {
        if (error) 
        {
            vscode.window.showErrorMessage(`Erro ao criar a pasta "${p_path}": ${error.message}`);
            return
        }


        p_path = path.join(p_path, p_file);        
        fs.writeFile(p_path, p_data, (err) => 
        {
            if (err) 
            {
                vscode.window.showErrorMessage(`Não foi possivel criar ficheiro(${p_path}) Erro: ${err}`);
            }
        });             
    });
}




