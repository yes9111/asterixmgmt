var parser = {};

parser.extractInt = function(obj){
  if(typeof obj !== "object") return false;
  if(obj.hasOwnProperty("int32")) return obj["int32"];
  if(obj.hasOwnProperty("int16")) return obj["int16"];
  if(obj.hasOwnProperty("int8")) return obj["int8"];
  return false;
};

parser.extractShape = function(obj)
{
  if(typeof obj !== "object") return false;
  return false;
};
