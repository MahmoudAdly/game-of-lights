var Game = {
  background: null,
  cellSize: 64,
  ledsArray: [[]],
  colorsArray: ['r','g','b'],
  initialize: function() {
    Crafty.init(Crafty.viewport._width, Crafty.viewport._height, document.getElementById('cr-stage'));
    Game.loadAssets();
    Game.createLeds();
    // Crafty.bind('ViewportResize', this.adaptToScreen);
    Crafty.trigger('ViewportResize');
  },
  loadAssets: function() {
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/r-on.png", {
      r_on:[0,0]
    });
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/r-off.png", {
      r_off:[0,0]
    });
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/g-on.png", {
      g_on:[0,0]
    });
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/g-off.png", {
      g_off:[0,0]
    });
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/b-on.png", {
      b_on:[0,0]
    });
    Crafty.sprite(Game.cellSize, Game.cellSize, "img/b-off.png", {
      b_off:[0,0]
    });
  },
  adaptToScreen: function() {
    console.log('w: ' + Crafty.viewport._width + ', h: ' + Crafty.viewport._height);
    // change background size
    Game.background.attr({w: Crafty.viewport._width, h: Crafty.viewport._height});
  },
  createLeds: function() {
    // calculate needed cells
    var cols = Math.floor(Crafty.viewport._width / Game.cellSize);
    var rows = Math.floor(Crafty.viewport._height / Game.cellSize);
    console.log('cols: ' + cols + ', rows: ' + rows);
    // fill new array with data from old array, or create new items
    for(var i=0; i<rows; i++) {
      if(Game.ledsArray[i] == undefined) Game.ledsArray.push([]);
      for(var j=0; j<cols; j++) {
        Game.ledsArray[i][j] = Game.newLed(i,j);
      }
    }
  },
  newLed: function(row, col) {
    var randColor = Game.colorsArray[Crafty.math.randomInt(0,Game.colorsArray.length-1)];
    var img_component = randColor + "_on";
    var e = Crafty.e('2D, Canvas, Mouse, LED')
                .attr({x: Game.cellSize*col, 
                  y: Game.cellSize*row, 
                  w: Game.cellSize, 
                  h: Game.cellSize,
                  ledColor: randColor,
                  ledOn: false})
                .addComponent(img_component)
                .bind('Click', function(e) {
                  if( e.mouseButton == Crafty.mouseButtons.LEFT )
                    console.log('clicked');
                    if(this.ledOn == true) {
                      console.log('on? ' + this.ledOn);
                      this.removeComponent(this.ledColor+"_on").addComponent(this.ledColor+"_off");
                      this.ledOn = false;
                    } else {
                      console.log('on? ' + this.ledOn);
                      this.removeComponent(this.ledColor+"_off").addComponent(this.ledColor+"_on");
                      this.ledOn = true;
                    }
                })
    // e.origin('center').attr({rotation: Crafty.math.randomInt(-45,45)});
    return e;
  }
}

$(document).ready(function() {
  Game.initialize();
});
