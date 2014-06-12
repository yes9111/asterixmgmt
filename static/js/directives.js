asterface.directive('afTable', function($timeout){
  function link($scope, element, attrs){
    $timeout(function(){
      $('.collapsible').collapsible({
        bind: 'click',
        cssClose: 'collapse-closed',
        cssOpen: 'collapse-open',
        speed: 100
      });
    }, 0, false);
  }
  
  return {
    restrict: 'E',
    templateUrl: '/static/partials/asterface-value.html',
    link: link
  };
});
