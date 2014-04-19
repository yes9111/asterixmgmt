var A = false;

$(function(){
    A = new AsterixDBConnection().dataverse("Metadata");
    loadDataverses();
    //loadDatasets();
});

function createLoadDatasets(dv)
{
    return function(){ loadDatasets(dv); };
}

function loadDataverses()
{
    var container = $('#dataverse-selector');
    
    var query = new FLWOGRExpression()
        .ForClause("$dv", new AExpression("dataset Dataverse"))
        .ReturnClause("$dv.DataverseName");
    
    A.query(query.val(), function(res){
        if(res.results)
        {
            for(var i in res.results)
            {
                var link = $("<a></a>");
                var dv = res.results[i];
                link.attr("href", "#");
                link.html(dv);
                link.on('click', createLoadDatasets(dv));
                container.append(link);
            }
        }
    });
}


function loadDatasets(dv)
{
    var container = $('#dataset-selector');
    
    var query = new FLWOGRExpression()
        .ForClause("$ds", new AExpression("dataset Dataset"))
        .WhereClause(new AExpression("$ds.DataverseName=" + dv))
        .ReturnClause("$ds.DatasetName");
    
    A.query(query.val(), function(res){
        if(res.results)
        {
            container.html('');
            for(var i in res.results)
            {
                var link = $("<a></a>");
                link.attr("href", "#");
                link.html(res.results[i]);
                link.on('click', createLoadDataTable(dv, res.results[i]));
                container.append(link);
            }
        }
    });
}

function createLoadDataTable(dv, ds)
{
    return function(){ loadData(dv, ds); };
}

function loadData(dv, ds)
{
    // load data from dataset
    var query = new FLWOGRExpression()
        .ForClause("
}

