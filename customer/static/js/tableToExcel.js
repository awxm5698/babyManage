//打印表格
var idTmr;

function getExplorer() {
    var explorer = window.navigator.userAgent;
    //ie
    if(explorer.indexOf("MSIE") >= 0) {
        return 'ie';
    }
    //firefox
    else if(explorer.indexOf("Firefox") >= 0) {
        return 'Firefox';
    }
    //Chrome
    else if(explorer.indexOf("Chrome") >= 0) {
        return 'Chrome';
    }
    //Opera
    else if(explorer.indexOf("Opera") >= 0) {
        return 'Opera';
    }
    //Safari
    else if(explorer.indexOf("Safari") >= 0) {
        return 'Safari';
    }
}

function method5(tableId) {
    if(getExplorer() == 'ie') {
        var curTbl = document.getElementById(tableId);
        var oXL = new ActiveXObject("Excel.Application");
        var oWB = oXL.Workbooks.Add();
        var xlSheet = oWB.Worksheets(1);
        var sel = document.body.createTextRange();
        sel.moveToElementText(curTbl);
        sel.select();
        sel.execCommand("Copy");
        xlSheet.Paste();
        oXL.Visible = true;

        try {
            var fName = oXL.Application.GetSaveAsFilename("Excel.xls",
                "Excel Spreadsheets (*.xls), *.xls");
        } catch(e) {
            print("Nested catch caught " + e);
        } finally {
            oWB.SaveAs(fName);
            oWB.Close(savechanges = false);
            oXL.Quit();
            oXL = null;
            idTmr = window.setInterval("Cleanup();", 1);
        }

    } else {
        table2Excel(tableId)
    }
}

function Cleanup() {
    window.clearInterval(idTmr);
    CollectGarbage();
    }

var table2Excel = (function() {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html><head><meta charset="UTF-8"></head><body><table  border="1">{table}</table></body></html>',
        base64 = function(
            s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function(s, c) {
            return s.replace(/{(\w+)}/g, function(m, p) {
                return c[p];
            })
        }
    return function(table, name) {
        if(!table.nodeType)
            table = document.getElementById(table);
        var ctx = {
            worksheet: name || 'Worksheet',
            table: table.innerHTML
        }
        return uri + base64(format(template, ctx))
        window.location.href = uri + base64(format(template, ctx))
    }
})();

function downloadExcel(tableId,fileName,SheetName="Sheet1"){
    var explorer = window.navigator.userAgent;
    if(explorer.indexOf("MSIE") >= 0) {
        alert('不支持使用IE浏览器');
    }
    else
    {
        href = table2Excel(tableId,SheetName)
        var d=new Date();
        var nowTime=d.toISOString();
        downLink = '<a href="'+href+'" download="'+fileName+nowTime+'.xls" id="download"></a>'
        document.querySelector('#navDownload').innerHTML =  downLink;
        document.getElementById('download').click();
        document.getElementById('download').remove();
    }
};