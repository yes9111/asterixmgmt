angular.module('asterface')
.directive('afAdm', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope: { value: '='},
    link: function(scope, element, attrs){
      var extractNumber = function(obj){
        if(obj.hasOwnProperty('int8')) return obj['int8'];
        else if(obj.hasOwnProperty('int16')) return obj['int16'];
        else if(obj.hasOwnProperty('int32')) return obj['int32'];
        else return false;
      }
      scope.$watch('value', function(newValue, oldValue){
        // reset browser
        element.empty();

        if(angular.isString(scope.value) || angular.isNumber(scope.value)){
          element.append('<span>'+ scope.value + '</span>');
        }
        else if(angular.isObject(scope.value)){
          if(scope.value.hasOwnProperty('unorderedlist')){
            /*
            For unordered lists
            */

            var header = angular.element('<div class="unorderedlist collapsible">Unordered List <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            var table = angular.element('<table></table>');
            element.append(header);
            element.append(table);

            angular.forEach(scope.value.unorderedlist, function(value){
              var childScope = scope.$new(true);
              childScope.value = value;
              var compiled = $compile('<tr><td><af-adm value="value"></af-adm></td></tr>')(childScope);
              table.append(compiled);
            });

            header.collapsible({
              speed: 0
            });
          }
          else if(scope.value.hasOwnProperty('orderedlist')){
            var header = angular.element('<div class="collapsible orderedlist">Ordered List <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            var table = angular.element('<table class="content"></table>');
            element.append(header);
            element.append(table);

            angular.forEach(scope.value, function(valEl){
              var childScope = scope.$new(true);
              childScope.value = valEl;
              var compiled = $compile('<tr><td><af-adm value="value"></af-adm></td></tr>')(childScope);
              table.append(compiled);
            });

            header.collapsible({
              speed:0
            });
          }
          else if(extractNumber(scope.value) !== false){
            var num = extractNumber(scope.value);
            element.append('<span>' + num + '</span>');
          }
          else{

            /* For records */
            /* TODO!  Parse simple asterix values that are wrapped as JSON objects, such as integers, shapes, etc... */

            var header = angular.element('<div class="record collapsible">Record <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            var table = angular.element('<table></table>');
            element.append(header);
            element.append(table);

            // populate table w/ individual record elements
            angular.forEach(scope.value, function(fieldValue, fieldKey){
              var childScope = scope.$new(true);
              childScope.key = fieldKey;
              childScope.value = fieldValue;
              $compile('<tr><td class="field-name" ng-bind="key"></td><td><af-adm value="value"></af-adm></td></tr>')(childScope, function(cloned, scope){
                table.append(cloned);
              });
            });

            header.collapsible({
              speed: 0
            });
          }
        }
      });
    }
  };
}]);
