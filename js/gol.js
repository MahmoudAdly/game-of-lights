var Game = {
  background: null,
  cellSize: 64,
  ledsArray: [[]],
  colorsArray: ['r','g','b'],
  active: false,
  timerObject: null,
  timerInterval: 1000,
  initialize: function() {
    Crafty.init(Crafty.viewport._width, Crafty.viewport._height, document.getElementById('cr-stage'));
    Game.loadAssets();
    Game.createLeds();
    Game.createStartButton();
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
    Crafty.sprite(64, 64, "img/button_start.png", {
      button_start:[0,0]
    });
    Crafty.sprite(64, 64, "img/button_stop.png", {
      button_stop:[0,0]
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
    var img_component = randColor + "_off";
    var e = Crafty.e('2D, Canvas, Mouse, LED')
                .attr({x: Game.cellSize*col, 
                  y: Game.cellSize*row, 
                  w: Game.cellSize, 
                  h: Game.cellSize,
                  ledColor: randColor,
                  ledOn: false})
                .addComponent(img_component)
                .bind('Click', function(e) {
                  if( e.mouseButton == Crafty.mouseButtons.LEFT ) {
                    Game.setLed(this, !this.ledOn);
                  }
                });
    e.origin('center').attr({rotation: Crafty.math.randomInt(-45,45)});
    return e;
  },
  setLed: function(led, newState) {
    newState = (typeof(newState)==='boolean') ? newState : false ;
    if(newState == false) {
      led.removeComponent(led.ledColor+"_on").addComponent(led.ledColor+"_off");
    } else {
      led.removeComponent(led.ledColor+"_off").addComponent(led.ledColor+"_on");
    }
    led.ledOn = newState;
  },
  resetLeds: function() {
    for (var i = 0; i < Game.ledsArray.length; i++) {
      for (var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.setLed(Game.ledsArray[i][j], false);
      };
    };
  },
  createStartButton: function() {
    var e = Crafty.e('2D, Canvas, Mouse')
                .attr({x: Crafty.viewport._width - 80, 
                  y: Crafty.viewport._height - 80, 
                  w: Game.cellSize, 
                  h: Game.cellSize,
                  running: false})
                .addComponent('button_start')
                .bind('Click', function(e) {
                  if( e.mouseButton == Crafty.mouseButtons.LEFT )
                    if(this.running == true) {
                      Game.stop();
                      this.running = false;
                      this.removeComponent('button_stop').addComponent('button_start');
                    } else {
                      Game.start();
                      this.running = true;
                      this.removeComponent('button_start').addComponent('button_stop');
                    }
                });
  },
  start: function() {
    console.log('start game');
    Game.timerObject = setInterval(function() {
      console.log('recalculate grid');
    }, Game.timerInterval);
    Game.active = true;
  },
  stop: function() {
    console.log('stop game');
    clearInterval(Game.timerObject);
    Game.resetLeds();
    Game.active = false;
  }
}

$(document).ready(function() {
  Game.initialize();
});
