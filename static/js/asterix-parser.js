
function AsterixParser(txt)
{
	this.txt = txt;
	this.index = 0;
	if(txt)
	{
		this.parse();
	}
}

AsterixParser.prototype.parse = function(){
	if(!this.txt)
	{
		alert("Cannot parse non-string inputs:" + this.txt);
		return;
	}

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
	this.trimSpace();
  
  if(this.txt.match(/^{/))
  {
    if(this.txt.match(/^{{/))
    {
			
      this.parseBag(this.txt);
    }
    else
    {
      return this.parseRecord();
    }
  }
  else if(this.txt.match(/^\[/))
  {
    return this.parseArray(this.txt);
  }
  else if(this.txt.match(/^(line|point|rectangle|circle|polygon)/))
  {
    return this.parseShape(this.txt);
  }
  else if(this.txt.match(/^(interval-)?(date|time|datetime|)/))
  {
    return this.parseTime(this.txt);
  }
  else if(this.txt.match(/^[0-9\.]/))
  {
    return this.parseNumber(this.txt);
  }
}

AsterixParser.prototype.trimSpace = function()
{
	var end = false;
	while(!end)
	{
		switch(this.txt.charAt(this.index))
		{
		case '\n': case'\t': case' ': case'\r':
			this.index++;
			break;
		default:
			end = true;
			break;
		}
	}
}


AsterixParser.prototype.parseArray = function()
{
  alert("Found array");
}

AsterixParser.prototype.parseBag = function()
{
  alert("Found bag");
}

AsterixParser.prototype.parseRecord = function()
{
	// skip brace
	// then parse field then value
	// then parse end brace
	var obj = {};
	this.index++;
	
	do
	{
		this.trimComma();
		var field = this.parseField();
		if(!field) break;
		obj[field] = this.parseAsterix();
		this.trimSpace();
	} while( this.txt.charAt(this.index) == ',');

	return obj;
}

AsterixParser.prototype.trimComma = function()
{
	if(this.txt.charAt(this.index) != ',') return;
	this.index++;
	this.trimSpace();

}

AsterixParser.prototype.parseNumber = function()
{
	
  alert("Found number");
}

AsterixParser.prototype.parseShape = function()
{
  alert("Found shape");
}

AsterixParser.prototype.parseTime = function()
{
  alert("Found time");
}
