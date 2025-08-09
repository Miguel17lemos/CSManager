module.exports = {
    command,
    command_PushActiveTextEditor
}



const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
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
    const xCommand = vscode.commands.registerCommand('phccscode.push', function () 
    {
        if (!Proc_CheckConfiguration(true)) 
        {
            return;
        }
        

        showOptions();
    });

    return xCommand;
}










function command_PushActiveTextEditor() 
{
    const xCommand = vscode.commands.registerCommand('phccscode.push_activate_text_editor', async function () 
    {
        if (!Proc_CheckConfiguration(true)) 
        {
            return;
        }


        if (!vscode.window.activeTextEditor) 
        {            
            vscode.window.showErrorMessage("Não têm nenhum decumento activo",);
            return;
        }



        vscode.window.activeTextEditor.document.save();
        let xPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
        const xPathFileData = path.join(xPath, "data.js")
        if (!await fs.existsSync(xPathFileData))
        {
            vscode.window.showErrorMessage("Não consegui encontrar o ficheiro data.js",);
            return;
        }

        let xData = await fs.readFileSync(xPathFileData, 'utf8');
        xData = JSON.parse(xData)        
        const xTabela = xData[0].tabela.trim().toLocaleLowerCase();
        const xStamp = xData[0].stamp;


        const xCat = Proc_GetCategories().filter(item => item.model.getTableName().toLocaleLowerCase() === xTabela);
        
        if (!xCat || !xCat.length) {
            vscode.window.showErrorMessage("Não consegui encontrar a categoria do ficheiro atual");
            return;
        }
        


        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: getExtensionInfo().displayName + " - Push Current File",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "A gravar..." });
            
        

            let xConnection;
            try 
            {
                xConnection = await TSql.connect(getConnectionString());
                await Proc_Push(xCat[0], xStamp, async ()=>await xConnection.request());
            } 
            catch (error) 
            {
                vscode.window.showErrorMessage(`Erro ao gravar: ${error}`)
                return;
            }
            finally 
            {
                if (xConnection) 
                {
                    xConnection.close();
                }
            }

            
            
            if (xCat[0].model.Proc_AfterPush) 
            {         
                progress.report({ increment: 50, message: "A limpar cache..." });   
                await xCat[0].model.Proc_AfterPush();
            }
            



            progress.report({ increment: 100, message: "Concluído" });
            await new Promise(res => setTimeout(res, 100));
        });
    });


    return xCommand;
}

















async function showOptions()
{        
    const xAll = [{ label: "Enviar TODOS", model: undefined}]
    const xOCategories = Proc_GetCategories();


    let xCategories = [];
    for (const xCat of xOCategories) 
    {
        const xPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, xCat.model.getFolderName());
        if(await fs.existsSync(xPath))
        {
            xCategories.push(xCat);
        }
    }    
    

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
    for (const xCat of xCategorieSel) 
    {
        const xResult = await Proc_GetOptions(xCat);
        if(!xResult || !xResult.length)
        {
            continue;
        }

        xOptions = [...xOptions, ...xResult];
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
        title: getExtensionInfo().displayName + " - Push",
        cancellable: false
    }, async (progress) => {
        

        let xConnection;
        let xTransaction;    
        try 
        {
            xConnection = await TSql.connect(getConnectionString());        
            xTransaction = new TSql.Transaction(xConnection);
            await xTransaction.begin();
            
            xIncrementUnd = 50 / xOptionsSel.length;
            xIncrement = 0
            for (const xOption of xOptionsSel) 
            {
                xIncrement += xIncrementUnd;
                progress.report({ increment: xIncrement, message: `A gravar '${xOption.label}'` });
                await Proc_Push(xOption.categorie, xOption.stamp, async ()=>await xConnection.request(xTransaction));
            }

            await xTransaction.commit();
        } 
        catch (error) 
        {
            if(xTransaction)
            {
                await xTransaction.rollback();
            }

            vscode.window.showErrorMessage(`Erro ao gravar: ${error}`)
            return;
        }
        finally 
        {
            if (xConnection) 
            {
                xConnection.close();
            }
        }


        xIncrementUnd = 50 / xCategorieSel.length;
        xIncrement = 0        
        for (const xCat of xCategorieSel) 
        {
            if (xCat.model.Proc_AfterPush) 
            {
                progress.report({ increment: xIncrement, message: `A limpar cache '${xCat.label}'` });
                await xCat.model.Proc_AfterPush();
            }
        }

    
    progress.report({ increment: 100, message: "Concluído" });
        await new Promise(res => setTimeout(res, 100));
    });
}










function Proc_GetCategories() 
{
    return [
        { label: model_jsUser.getFolderName(), model: model_jsUser},
        { label: model_scriptsWeb.getFolderName(), model: model_scriptsWeb},
        { label: model_itensMonitores.getFolderName(), model: model_itensMonitores},
        { label: model_valoresDefeito.getFolderName(), model: model_valoresDefeito},
        { label: model_regras.getFolderName(), model: model_regras},
        { label: model_opcoesEcra.getFolderName(), model: model_opcoesEcra},
        { label: model_eventos.getFolderName(), model: model_eventos},
        { label: model_analisesAvancadas.getFolderName(), model: model_analisesAvancadas},
    ];
}







async function Proc_GetOptions(p_Categorie) 
{    
    try
    {        
        let xRootPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, p_Categorie.model.getFolderName());
        let xOptions = [];

        const xFiles = await fs.readdirSync(xRootPath);        
        for (const xFileName of xFiles) 
        {            
            const xFilePath = path.join(xRootPath, xFileName)
            const xFile = await fs.statSync(xFilePath)
            if(xFile.isFile())
            {
                continue;
            }

            const xFileDataPath = path.join(xFilePath, "data.js")
            if (!await fs.existsSync(xFileDataPath))
            {
                continue;
            }
            

            let xData = await fs.readFileSync(xFileDataPath, 'utf8');
            xData = JSON.parse(xData)
            if (xData[0] && xData[0].stamp) {
                xOptions.push(
                    {
                        label: xFileName, 
                        stamp: xData[0].stamp.trim(),
                        categorie: p_Categorie
                    });   
            }            
        }

        return xOptions;
    }
    catch(error)
    {
        vscode.window.showInformationMessage(getExtensionInfo().displayName + ` - Erro: ${error}`);        
    }    
}









async function Proc_Push(p_Categorie, p_stamp, p_GetSqlResquest)
{    
    const xData = await Proc_GetDataFile(p_Categorie.model.getFolderName(), p_stamp)
    for (const xRow of xData) 
    {
        if(!xRow.campos || !xRow.tabela || !xRow.stamp)
        {
            continue;
        }

        let xSqlResquest = await p_GetSqlResquest();
        let xQuery = `select ${xRow.tabela}Stamp from ${xRow.tabela} (nolock) where ${xRow.tabela}Stamp = @stamp`  
        xSqlResquest.input("stamp", xRow.stamp);
        const xResult = await xSqlResquest.query(xQuery);
        const xEInsert = !(xResult.recordset && xResult.recordset.length > 0);
        

        xSqlResquest = await p_GetSqlResquest();
        let xCamposUpd = ""
        let xCamposInsert = ""
        let xCamposInsertValues = ""
        for (const xProp of Object.keys(xRow.campos)) 
        {
            if (xProp.trim().toLowerCase() === (p_Categorie.model.getTableName + "stamp").toLowerCase() || p_Categorie.model.getFields_NotUse().map(s=> s.toLowerCase()).includes(xProp.trim().toLowerCase()))
            {
                continue;
            }

            xCamposInsert += (xCamposInsert === "" ? "" : ", ") + `${xProp}`
            xCamposInsertValues += (xCamposInsertValues === "" ? "" : ", ") + `@${xProp}`
            xCamposUpd += (xCamposUpd === "" ? "" : ", ") + `${xProp} = @${xProp}`            
            xSqlResquest.input(xProp, xRow.campos[xProp])
        }



        if (xEInsert) 
        {
            xQuery = `
            Insert into ${xRow.tabela} (${xRow.tabela}stamp, ${xCamposInsert}, ousrdata, ousrhora, ousrinis, usrdata, usrhora, usrinis) 
            values (@stamp, ${xCamposInsertValues}, CAST(GETDATE() as date), CONVERT(char(8), GETDATE(), 108), LEFT(SUSER_NAME(), 3), CAST(GETDATE() as date), CONVERT(char(8), GETDATE(), 108), LEFT(SUSER_NAME(), 3))`;
            xSqlResquest.input("stamp", xRow.stamp);
        }
        else
        {
            xQuery = `
            update ${xRow.tabela} set 
            ${xCamposUpd}, usrdata = CAST(GETDATE() as date), usrhora = CONVERT(char(8), GETDATE(), 108), usrinis = LEFT(SUSER_NAME(), 3) 
            where ${xRow.tabela}Stamp = @stamp`;
            xSqlResquest.input("stamp", xRow.stamp);
        }        


        await xSqlResquest.query(xQuery);
    }           
}



                    
                    









async function Proc_GetDataFile(p_path, p_stamp)
{
    try
    {
        p_stamp = p_stamp.trim().toUpperCase()
        p_path = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, p_path);
        let xData = undefined;

        const xFiles = await fs.readdirSync(p_path);        
        for (const xFileName of xFiles) 
        {
            xData = undefined;
            const xFilePath = path.join(p_path, xFileName)
            const xFile = await fs.statSync(xFilePath)
            if(xFile.isFile())
            {
                continue;
            }

            
            let xFilesCode = []            
            const xSubFiles = await fs.readdirSync(xFilePath);
            for (const xSubFileName of xSubFiles) 
            {
                const xSubFilePath = path.join(xFilePath, xSubFileName) 
                const xSubFile = await fs.statSync(xSubFilePath)
                if(xSubFile.isDirectory())
                {
                    continue;
                }


                if (xSubFileName.trim().toLowerCase() === "data.js") 
                {
                    xData = await fs.readFileSync(xSubFilePath, 'utf8');
                    xData = JSON.parse(xData)
                    if (!(xData[0].stamp.trim().toUpperCase() === p_stamp)) 
                    {
                        xData = undefined;
                        break;
                    }
                }
                else
                {                    
                    const xSubFileData = await fs.readFileSync(xSubFilePath, "utf8");
                    const xSubFileNameBase = path.basename(xSubFilePath, path.extname(xSubFilePath));
                    xFilesCode.push({key:xSubFileNameBase, value:xSubFileData});
                }
            }

            if(xData)
            {
                for (const xCode of xFilesCode) 
                {
                    xData[0].campos[xCode.key] = xCode.value;
                }

                return xData;
            }            
        }
    }
    catch(error)
    {
        vscode.window.showInformationMessage(getExtensionInfo().displayName + ` - Erro: ${error}`);
        return undefined;
    }
}