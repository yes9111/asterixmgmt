angular.module('asterface')
.directive('afAdm', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope: { value: '='},
    link: function(scope, element, attrs){
      scope.$watch('value', function(newValue, oldValue){
        // reset browser
        element.empty();

        if(angular.isString(scope.value) || angular.isNumber(scope.value)){
          element.append('<span>'+ scope.value + '</span>');
        }
        else{
          if(angular.isArray(scope.value)){
            var header = angular.element('<div class="collapsible orderedlist">Ordered List</div>');
            var table = angular.element('<table class="content"></table>');
            element.append(header);
            element.append(table);

            angular.forEach(scope.value, function(valEl){
              var childScope = scope.$new(true);
              childScope.value = valEl;
              var compiled = $compile('<af-adm value="value"></af-adm>')(childScope);
              table.append(compiled);
            });

            header.collapsible({
              speed:0
            });
          }
          else if(angular.isObject(scope.value)){
            // create a table
            var header = angular.element('<div class="record collapsible">Record</div>');
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
