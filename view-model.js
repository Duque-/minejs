(function(module) {
   'use strict';

   function CellViewModel(row, index, rowIndex, mainViewModel) {
      this.mainViewModel = mainViewModel;
      this.value = ko.observable(row.getValue(index));
      this.flag = ko.observable(row.getFlag(index));
      this.x = index;
      this.y = rowIndex;

      this.getValue = ko.computed(function() {
         if (!mainViewModel.gameover() && this.flag() === 'F')
            return 'F';
         if (!mainViewModel.gameover() && this.flag() === '?')
            return '?';
         else if (!mainViewModel.gameover() && this.flag() === 'C')
            return '#';
         else if (this.value() === 0)
            return '';
         else
            return this.value();
      }, this);

      this.displayValue = ko.computed(function() {
         var value = this.getValue();
         if (value === '#')
            return '';
         else
            return value;
      }, this);

      this.className = ko.computed(function() {
         var value = this.getValue();
         if (value === 'F')
            return 'isFlag' + (this.mainViewModel.flagMode() ? ' isClickable' : '');
         else if (value === '#')
            return 'isCovered';
         else if (value === '*')
            return 'isMine';
         else if (value === '?')
            return 'isQuestion' + (this.mainViewModel.flagMode() ? ' isClickable' : '');
         else
            return '';
      }, this);
   }

   _.extend(CellViewModel.prototype, {
      leftClick: function(vm, e) {
         if (e.ctrlKey)
            this.rightClick();
         else
            this.clickCell(true);
      },
      rightClick: function() {
         this.clickCell(false);
      },
      clickCell: function(leftClick) {
         if (this.flag() === '')
            return;

         var flagMode = this.mainViewModel.flagMode() || !leftClick;

         if (flagMode) {
            if (this.flag() === 'C')
               this.flag('F');
            else if (this.flag() === 'F')
               this.flag('?');
            else if (this.flag() === '?')
               this.flag('C');
            return;
         }

         if (this.flag() === 'F' || this.flag() === '?')
            return;
         if (this.value() === '*')
            this.mainViewModel.lost(true);
         else if (this.flag() === 'C') {
            this.flag('');
            if (this.value() === 0)
               this.clearSurroundingCells(leftClick);

            this.mainViewModel.checkForWin();
         }

      },
      hasUncoveredNumber: function() {
         return _.isNumber(this.value()) && this.flag() !== '';
      },
      clearSurroundingCells: function(leftClick) {
         this.mainViewModel.applyToSurroundingCells(this.x, this.y, function(cell) {
            cell.clickCell(leftClick);
         });
      }
   });

   function RowViewModel(row, index, mainViewModel) {
      this.cols = ko.observableArray();
      for (var i = 0; i < row.length(); ++i)
         this.cols.push(new CellViewModel(row, i, index, mainViewModel));
   }

   _.extend(RowViewModel.prototype, {
      hasUncoveredNumber: function() {
         for (var i = 0; i < this.cols().length; ++i) {
            if (this.cols()[i].hasUncoveredNumber())
               return true;
         }
         return false;
      },
      applyToSurroundingCells: function(x, doMiddle, foo, context) {
         if (x > 0)
            foo.call(context, this.cols()[x - 1]);
         if (doMiddle)
            foo.call(context, this.cols()[x]);
         if (x < this.cols().length - 1)
            foo.call(context, this.cols()[x + 1]);
      }
   });

   function ViewModel(grid) {
      this.lost = ko.observable(false);
      this.won = ko.observable(false);
      this.flagMode = ko.observable(false);

      this.gameover = ko.computed(function() {
         var lost = this.lost();
         var won = this.won();
         return lost || won;
      }, this);

      this.rows = ko.observableArray();
      grid.rows.forEach(function(row, i) {
         this.rows.push(new RowViewModel(row, i, this));
      }.bind(this));
   }

   _.extend(ViewModel.prototype, {
      checkForWin: function() {
         for (var i = 0; i < this.rows().length; ++i) {
            if (this.rows()[i].hasUncoveredNumber())
               return;
         }
         this.won(true);
      },
      applyToSurroundingCells: function(x, y, foo, context) {
         if (y > 0)
            this.rows()[y - 1].applyToSurroundingCells(x, true, foo, context);
         this.rows()[y].applyToSurroundingCells(x, false, foo, context);
         if (y < this.rows().length - 1)
            this.rows()[y + 1].applyToSurroundingCells(x, true, foo, context);
      }
   });

   module.ViewModel = ViewModel;

})(window.game);