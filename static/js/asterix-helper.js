
function AHelper()
{
  this.typeKeywords = [ "int8", "int16", "int32", "int64", "float", "double", "time", "date", "datetime", "duration", "interval", "point", "circle", "rectangle", "line", "polygon", "unorderedlist", "orderedlist"];
  this.simpleKeywords = [ "int8", "int16", "int32", "int64", "float", "double", "time", "date", "datetime", "duration", "interval", "point", "circle", "rectangle", "line", "polygon", "string"];
  this.simpleTypes = {};
  
  for(var i in this.simpleKeywords){
    this.simpleTypes[this.simpleKeywords[i]] = true;
  }
}

AHelper.prototype.extractNumber = function(obj){
  // floats and doubles are by themselves
  if(angular.isNumber(obj)) return obj;
  
  if(!angular.isObject(obj)) return false;  

  var numKeywords = ["int8", "int16", "int32", "int64"];
  for(var i in numKeywords)
  {
    if(obj.hasOwnProperty(numKeywords[i])) return obj[numKeywords[i]];
  }
  
  return false;
};

AHelper.prototype.extractShape = function(obj)
{
  if(typeof obj !== "object") return false;
  return false;
};


