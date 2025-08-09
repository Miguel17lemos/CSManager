module.exports = {
    Proc_ClearCache
}


const vscode = require('vscode');
const TSql = require('mssql');
const settings = require("./settings");




function Proc_ClearCache(p_key)
{   
    p_key = (p_key ? p_key : "TOTAL")    
    return new Promise(async (resolve, reject)=>
    {
        if(!await Proc_CheckConfiguration())
        {
            reject("");
            return;
        }

        const axios = require('axios');
        const cookies = settings.getPhcSessionCookies();
                
        const url = `${settings.getPhcURL()}/programs/gensel.aspx?cscript=ccache&key=${p_key}`;
        
        axios.get(url, {
        headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36', // Cabeçalho comum
        },
        maxRedirects: 0
        })
        .then(response => 
        {            
            resolve();            
        })
        .catch(error => 
        {            
            if(error.status === 302)
            {
                reject("Cookie inválido");
            }
            else
            {
                reject(error);        
            }
        });
    })
}










async function Proc_CheckConfiguration()
{
    if(!settings.Proc_CheckConfiguration())
    {
        return;
    }



    let xConnection;
    try 
    {
        xConnection = await TSql.connect(settings.getConnectionString());
        let xSqlResquest = await xConnection.request();
        let xQuery = `select escr.escrstamp, escr.usrinis from escr(nolock) where escr.codigo = 'CCache'`;        
        let xResult = await xSqlResquest.query(xQuery);
        
        let xMessage = 'criado'
        if(xResult.recordset && xResult.recordset.length)
        {   
            if ( xResult.recordset[0].usrinis.toUpperCase().trim() === settings.getExtensionInfo().version.toUpperCase().trim()) 
            {
                return true;
            }
            xMessage = "atualizado"
        }



        xSqlResquest = await xConnection.request();
        xQuery = `
                delete from escr where escr.codigo = 'CCache'

                INSERT escr
                (escrstamp, resumo, codigo, 
                expressao, reacao, 
                ousrinis, ousrdata, ousrhora, 
                usrinis, usrdata, usrhora)
                VALUES 
                (LEFT(NEWID(), 25), @resumo, @codigo, 
                @expressao, @reacao, 
                @versao, CAST(GETDATE() as date), CONVERT(char(8), GETDATE(), 108), 
                @versao, CAST(GETDATE() as date), CONVERT(char(8), GETDATE(), 108))`;
        xSqlResquest.input("resumo", "PHC Cs Code - CCache v" +  settings.getExtensionInfo().version);
        xSqlResquest.input("codigo", "CCache");
        xSqlResquest.input("expressao", Proc_GetCodeExpression());
        xSqlResquest.input("reacao", 1);
        xSqlResquest.input("versao", settings.getExtensionInfo().version);
        await xSqlResquest.query(xQuery);


        vscode.window.showWarningMessage(`Foi ${xMessage} o Script Web "CCache", por favor limpe a cache TOTAL no monitor de sistema`);
        return false;
    } 
    catch (error) 
    {
        vscode.window.showErrorMessage(`Erro ao gravar: ${error}`)
        return false;
    }
    finally 
    {
        if (xConnection) 
        {
            xConnection.close();
        }
    }
}





function Proc_GetCodeExpression() 
{
    return `
Dim xKey As String = ""

Dim xValue As Object = HttpContext.Current.Request.QueryString("key")
If xValue Is Nothing Then
    xKey = "TOTAL"
Else
    xKey = xValue.ToString().ToUpper().Trim()
End If



Dim xQuery_tmp3 As String = $"select valor = 'FIM --- "+ xKey + "'"
Dim xData_tmp3 As DataTable = WebControlLib.CData.GetDatatable(xQuery_tmp3)



Select Case xKey
    Case "TOTAL"
        WebControlLib.XcUtil.ClearCacheGlobal()

    'ANALISES
    Case "EUSQL"
        Dim xQuery As String = $"select eusqlstamp, emostamp, scdinstamp, eusqlid, grupo, nomeecra, nomeecrasnap from eusql(nolock) order by eusqlid desc"
        Dim xData As DataTable = WebControlLib.CData.GetDatatable(xQuery)
        If xData IsNot Nothing Then
            For Each xRow As DataRow In xData.Rows

                WebControlLib.ccache.DelObjFromCache("eintexp:" + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("pgalist.eusql")
                WebControlLib.xcsession.Remove("eintexp:" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("ana.av")
                WebControlLib.ccache.DelObjFromCache("eusql.main." + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("eusql.main." + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("eusqlv." + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("eusqlv.main." + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("eusqlv.javar." + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("eusql.grupo." + xRow("grupo").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("eusql.stamp." + xRow("eusqlstamp").ToString().Trim())
                WebControlLib.xcsession.Remove("eusqlv.javar." + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("eusqlv." + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("eusqlv.main." + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("snapval" + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("snap2val" + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("mesanpsnapval" + xRow("eusqlid").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("mesanpsnap2val" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("snapval" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("mesanpsnapval" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("snap2val" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("mesanpsnap2val" + xRow("eusqlid").ToString().Trim())
                WebControlLib.xcsession.Remove("selectanalises" + xRow("grupo").ToString().Trim())
                WebControlLib.xcsession.Remove("selectanalises")
                WebControlLib.xcsession.Remove("scdin.dados." + xRow("scdinstamp").ToString().Trim())
                WebControlLib.xcsession.Remove("scdin.dados.10." + xRow("scdinstamp").ToString().Trim())
                WebControlLib.xcsession.Remove(WebControlLib.AdvancedAnalysisData.GetEusqlCacheKey(xRow("nomeecra").ToString().Trim()))
                WebControlLib.Snapshot.RemoveAllFromCacheAndSession(xRow("emostamp").ToString().Trim(), xRow("nomeecrasnap").ToString().Trim())
                WebControlLib.Snapshot.RemoveMonitorFromCacheAndSession(xRow("emostamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("emoeusqllist." + xRow("emostamp").ToString().Trim())


                WebControlLib.xcsession.Remove("s_snaplisthomepage" + WebControlLib.XcUser.UserNo())
                WebControlLib.ccache.DelObjFromCache("snapshomepage" + WebControlLib.XcUser.UserNo() + "" + WebControlLib.Sistema.Package())

                WebControlLib.xcsession.RemoveMulti("s_snaplistpainel")
                WebControlLib.ccache.DelObjFromCache("snapspainel" + WebControlLib.XcUser.UserNo() + "" + WebControlLib.Sistema.Package())

                WebControlLib.ccache.DelObjFromCache("snapsmonitor" + xRow("emostamp").ToString().Trim() + WebControlLib.XcUser.UserNo() + WebControlLib.Sistema.Package())
                WebControlLib.xcsession.RemoveMulti("s_snaplistmonitor")
                WebControlLib.ccache.DelObjFromCache("snapsecraemoform" + WebControlLib.XcUser.UserNo() + "" + WebControlLib.Sistema.Package())


                WebControlLib.xcsession.RemoveMulti("s_snaplistecra")
                WebControlLib.ccache.DelObjFromCache("snapsecra" + xRow("nomeecrasnap").ToString().Trim() + "" + WebControlLib.XcUser.UserNo() + "" + WebControlLib.Sistema.Package())

                WebControlLib.PhcCache.RemoveObjFromCache("eusqlsnapv." + xRow("eusqlid").ToString().Trim())
                WebControlLib.PhcCache.RemoveObjFromCache("eusqlsnap2v." + xRow("eusqlid").ToString().Trim())


                Dim xQuery_tmp2 As String = $"select valor = 'FIM"+ xRow("eusqlid").ToString().Trim() + "'"
                Dim xData_tmp2 As DataTable = WebControlLib.CData.GetDatatable(xQuery_tmp2)

            Next
        End If
        Dim xQuery_tmp As String = $"select valor = 'FIM'"
        Dim xData_tmp As DataTable = WebControlLib.CData.GetDatatable(xQuery_tmp)


    'ITENS MONITORES
    Case "EMOI"
        Dim xQuery As String = $"select emoistamp, emostamp, emoiid from emoi(nolock) order by emoiid"
        Dim xData As DataTable = WebControlLib.CData.GetDatatable(xQuery)
        If xData IsNot Nothing Then
            For Each xRow As DataRow In xData.Rows

                'HttpRuntime.Cache

                WebControlLib.ccache.DelObjFromCache("emoemoilist." + xRow("emostamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("l_emo" + xRow("emostamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("l_emoi" + xRow("emoistamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("emov.main.2." + xRow("emoistamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("emov.main.3." + xRow("emoistamp").ToString().Trim())

                Dim valorIntegerCached = CData.GetUmValorIntegerCached("emoi.id" + xRow("emostamp").ToString().Trim(), "emoid", "emo", "emo.emostamp='" + xRow("emostamp").ToString().Trim() + "'")
                If valorIntegerCached > 0 Then
                    WebControlLib.ccache.DelObjFromCache("emo.main." + valorIntegerCached.ToString())
                End If

            Next
        End If


    'Javascript de Utilizador
    Case "JSU"
        WebControlLib.CParas.ActPara("jsu_version", DateAndTime.Now.ToString("yyyyMMddHHmmss"))

        Dim xQuery As String = $"select ecran from jsu(nolock) where ecran <> ''"
        Dim xData As DataTable = WebControlLib.CData.GetDatatable(xQuery)
        If xData IsNot Nothing Then
            For Each xRow As DataRow In xData.Rows
                WebControlLib.CParas.ActPara("jsu_version" + xRow("ecran").ToString().Trim(), DateAndTime.Now.ToString("yyyyMMddHHmmss"))
            Next
        End If


    'Opções de Ecrã
    Case "ETL"
        Dim xQuery As String = $"select etlstamp, emostamp, emoistamp, ecran from etl(nolock)"
        Dim xData As DataTable = WebControlLib.CData.GetDatatable(xQuery)
        If xData IsNot Nothing Then
            For Each xRow As DataRow In xData.Rows
                WebControlLib.ccache.DelObjFromCache("emoetllist." + xRow("emostamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("emoietllist." + xRow("emoistamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache(xRow("ecran").ToString().Trim() + ".tooluser")
                WebControlLib.xcsession.Remove(xRow("ecran").ToString().Trim() + ".tooluser")
                WebControlLib.ccache.DelObjFromCache("tooluser.emo." + xRow("emostamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("tooluser.emoi." + xRow("emoistamp").ToString().Trim())
                WebControlLib.xcsession.Remove("tooluser.emo." + xRow("emostamp").ToString().Trim())
                WebControlLib.xcsession.Remove("tooluser.emoi." + xRow("emoistamp").ToString().Trim())
                WebControlLib.ccache.DelObjFromCache("tooluser.emo." + xRow("emostamp").ToString().Trim() + "1")
                WebControlLib.xcsession.Remove("tooluser.emoi." + xRow("emostamp").ToString().Trim() + "1")
                WebControlLib.ccache.DelObjFromCache("tooluser.emo." + xRow("emostamp").ToString().Trim() + "2")
                WebControlLib.xcsession.Remove("tooluser.emoi." + xRow("emostamp").ToString().Trim() + "2")
                WebControlLib.ccache.DelObjFromCache("tooluser.emo." + xRow("emoistamp").ToString().Trim() + "1")
                WebControlLib.xcsession.Remove("tooluser.emoi." + xRow("emoistamp").ToString().Trim() + "1")
                WebControlLib.ccache.DelObjFromCache("tooluser.emo." + xRow("emoistamp").ToString().Trim() + "2")
                WebControlLib.xcsession.Remove("tooluser.emoi." + xRow("emoistamp").ToString().Trim() + "2")
                WebControlLib.xcsession.Remove(ToolbarOptions.GetEtlCacheKey(xRow("ecran").ToString().Trim()))
            Next
        End If


            
    'Scripts
    Case "ESCR" 
        WebControlLib.PhcCache.RemoveObjFromCache("temRCTScript");


        'OUTROS
    Case Else
        WebControlLib.ccache.DelObjFromCache(xKey)
End Select


mpage.Response.Clear()
mpage.Response.ContentType = "application/json; charset=utf-8"
mpage.Response.Write("[{Estado:1}]")
mpage.Response.End()`;
}



