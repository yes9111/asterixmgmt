function trimSpace(txt)
{
  return txt.replace(/^\s+/, '');
}

function parseAsterix(txt)
{
  /*  take Asterix output from the REST API
      and turn it into JSON
      most of the Asterix input can be fed into parseJSON directly, with a few exceptions.
      Records -> Remove quotes around field names
      Ordered Lists -> Fine
      Unordered Lists -> Records with random key names,
      Time, Datetime, Duration, Interval
      Polygon, Circle, Rectangle, Line, Point,
      double, float, ints
  */
  // skip whitespace
  txt = trimSpace(txt);
  
  if(txt.match(/^{/))
  {
    if(txt.match(/^{{/))
    {
      return parseBag(txt);
    }
    else
    {
      return parseRecord(txt);
    }
  }
  else if(txt.match(/^\[/))
  {
    return parseArray(txt);
  }
  else if(txt.match(/^(line|point|rectangle|circle|polygon)/))
  {
    return parseShape(txt);
  }
  else if(txt.match(/^(interval-)?(date|time|datetime|)/))
  {
    return parseTime(txt);
  }
  else if(txt.match(/^[0-9\.]/))
  {
    return parseNumber(txt);
  }
}

function parseArray(txt)
{
  alert("Found array");
}

function parseBag(txt)
{
  alert("Found bag");
}

function parseRecord(txt)
{
  var contentExtractor = /^{\s*(.*)\s*}\s*/;
  var g = contentExtractor.exec(txt)[1];
  var fieldExtractor = /("[a-zA-Z]+":)/g;
  var m;
  while(m = fieldExtractor.exec(g))
  {
    alert(m[1]);
  }
}

function parseNumber(txt)
{
  alert("Found number");
}

function parseShape(txt)
{
  alert("Found shape");
}

function parseTime(txt)
{
  alert("Found time");
}

