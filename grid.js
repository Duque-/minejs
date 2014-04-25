(function(module) {
   'use strict';

   function checkGridSettings(rows, cols, mineCount) {
      if (mineCount > rows * cols)
         throw new Error("Can't have more mines than cells!");
      if (mineCount < 1)
         throw new Error("You've got to have at least one mine!");
      if (rows * cols < 1)
         throw new Error("You've got to have at least one cell!");
      if (rows > 15 || cols > 15)
         throw new Error("A grid that big's never been tried before!");
   }

   function randomMine(w, h) {
      return {
         x: Math.floor(Math.random() * w),
         y: Math.floor(Math.random() * h)
      };
   }

   function Row(cols) {
      this.values = [];
      this.flags = [];
      for (var i = 0; i < cols; ++i) {
         this.values.push(0);
         this.flags.push('C');
      }
   }

   _.extend(Row.prototype, {
      length: function() {
         return this.values.length;
      },
      print: function(showValues) {
         var line = '';
         for (var i = 0; i < this.length(); ++i) {
            if (!showValues && this.flags[i] === 'C')
               line += '# ';
            else if (!showValues && this.flags[i] === 'F')
               line += 'F ';
            else
               line += this.values[i] + ' ';
         }
         console.log(line);
      },
      _addMines: function(minesToAdd) {
         for (var i = 0; i < minesToAdd; ++i)
            this.values[i] = '*';
      },
      placeMine: function(x) {
         if (x < 0 || x > this.values.length)
            throw new Error("Invalid x in placeMine");
         this.values[x] = '*';
      },
      getValue: function(x) {
         if (x < 0 || x > this.values.length)
            throw new Error("Invalid x in getValue");
         return this.values[x];
      },
      getFlag: function(x) {
         if (x < 0 || x > this.flags.length)
            throw new Error("Invalid x in getFlag");
         return this.flags[x];
      },
      tryIncrementCell: function(x) {
         if (x < 0 || x >= this.values.length)
            return;
         if (this.values[x] === '*')
            return;
         this.values[x]++;
      }
   })

   function Grid(rows, cols, mineCount) {
      checkGridSettings(rows, cols, mineCount);

      this.rows = [];
      for (var i = 0; i < rows; ++i)
         this.rows.push(new Row(cols));

      this._addMines(rows, cols, mineCount);
      this._setValues();
   }

   _.extend(Grid.prototype, {
      _addMines: function(rows, cols, mineCount) {
         while (mineCount) {
            var minePosition = randomMine(cols, rows);
            if (this.getValue(minePosition.x, minePosition.y) === '*')
               continue;
            this.placeMine(minePosition.x, minePosition.y);
            --mineCount;
         }
         // this.rows.forEach(function(row) {
         //    var minesToAdd = Math.min(mineCount, row.length());
         //    row._addMines(minesToAdd);
         //    mineCount -= minesToAdd;
         // });
      },
      _setValues: function() {
         for (var y = 0; y < this.rows.length; ++y) {
            for (var x = 0; x < this.rows[y].length(); ++x) {
               if (this.getValue(x, y) === '*')
                  this._incrementSurroundingCells(x, y);
            }
         }
      },
      _incrementSurroundingCells: function(x, y) {
         if (y > 0) {
            this.rows[y - 1].tryIncrementCell(x - 1);
            this.rows[y - 1].tryIncrementCell(x);
            this.rows[y - 1].tryIncrementCell(x + 1);
         }
         this.rows[y].tryIncrementCell(x - 1);
         this.rows[y].tryIncrementCell(x);
         this.rows[y].tryIncrementCell(x + 1);
         if (y < this.rows.length - 1) {
            this.rows[y + 1].tryIncrementCell(x - 1);
            this.rows[y + 1].tryIncrementCell(x);
            this.rows[y + 1].tryIncrementCell(x + 1);
         }
      },
      print: function(showValues) {
         this.rows.forEach(function(row) {
            row.print(showValues);
         })
      },
      getValue: function(x, y) {
         if (y < 0 || y > this.rows.length)
            throw new Error("Invalid y in getValue");
         return this.rows[y].getValue(x);
      },
      placeMine: function(x, y) {
         if (y < 0 || y > this.rows.length)
            throw new Error("Invalid y in placeMine");
         this.rows[y].placeMine(x);
      },
      getFlag: function(x, y) {
         if (y < 0 || y > this.rows.length)
            throw new Error("Invalid y in getFlag");
         return this.rows[y].getFlag(x);
      },
      length: function() {
         return this.rows.length();
      }
   });

   _.extend(module, {
      Grid: Grid
   });

})(window.game);