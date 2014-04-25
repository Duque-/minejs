(function(module) {
   'use strict';

   var rows = 8;
   var columns = 8;
   var totalMineCount = 12;

   var grid = null;

   function startGame(r, c, count) {
      rows = r || rows;
      columns = c || columns;
      totalMineCount = count || totalMineCount;

      grid = new module.Grid(rows, columns, totalMineCount);

      var gameLocation = document.getElementById('gameLocation');
      gameLocation.innerHTML = '';

      ko.cleanNode(gameLocation);
      ko.applyBindings(new module.ViewModel(grid), gameLocation);
   }

   function print(showValues) {
      grid.print(showValues);
   }

   _.extend(module, {
      startGame: startGame,
      print: print
   });

   startGame();

})(window.game);