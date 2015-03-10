var Game = {
  background: null,
  cellSize: 64,
  ledsArray: [[]],
  newStatesArray: [[]],
  colorsArray: ['r','g','b'],
  active: false,
  timerObject: null,
  timerInterval: 1000,
  initialize: function() {
    Crafty.init(Crafty.viewport._width, Crafty.viewport._height, document.getElementById('cr-stage'));
    Game.loadAssets();
    Game.createLeds();
    Game.createStartButton();
    Crafty.bind('ViewportResize', Game.resizeScreen);
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
  resizeScreen: function() {
    /* This will RESET the game */
  },
  createLeds: function() {
    // calculate needed cells
    var cols = Math.floor(Crafty.viewport._width / Game.cellSize);
    var rows = Math.floor(Crafty.viewport._height / Game.cellSize);

    // populate the array with newly created leds
    for(var i=0; i<rows; i++) {
      if(Game.ledsArray[i] == undefined) Game.ledsArray.push([]);
      for(var j=0; j<cols; j++) {
        Game.ledsArray[i][j] = Game.newLed(i,j);
      }
    }

    // populate another array to use in calculations.
    // this is better that regenarating it at every cycle
    for(var i = 0; i < Game.ledsArray.length; i++) {
      if(Game.newStatesArray[i] == undefined) Game.newStatesArray.push([]);
      for(var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.newStatesArray[i][j] = false;
      }
    }
  },
  newLed: function(row, col) {
    // select led color randomly and set the sprite component accordingly
    var randColor = Game.colorsArray[Crafty.math.randomInt(0,Game.colorsArray.length-1)];
    var img_component = randColor + "_off";
    /*
    Collision box : 
    1- Set the collision box to be bigger than the led to use it for
    neighbourhood calculations. But not too big to overlap with the far neighbour cell.
    2- Polygon points are relative to the parent entity.
    */
    var e = Crafty.e('2D, Canvas, Mouse, Collision')
                .attr({x: Game.cellSize*col, 
                  y: Game.cellSize*row, 
                  w: Game.cellSize, 
                  h: Game.cellSize,
                  ledColor: randColor,
                  ledOn: false})
                .collision(new Crafty.polygon([-(Game.cellSize*0.25),-(Game.cellSize*0.25)], 
                                              [(Game.cellSize*1.25),-(Game.cellSize*0.25)],
                                              [(Game.cellSize*1.25),(Game.cellSize*1.25)],
                                              [-(Game.cellSize*0.25),(Game.cellSize*1.25)]))
                .addComponent(img_component)
                .bind('Click', function(e) {
                  if( e.mouseButton == Crafty.mouseButtons.LEFT ) {
                    // invert led state
                    Game.setLed(this, !this.ledOn);
                  }
                });
    /*
    Disable rotation as it will mess with collition boxes. Add WiredHitBox component 
    to the created object above to see the intersections mess.
    */
    // e.origin('center').attr({rotation: Crafty.math.randomInt(-45,45)});
    
    return e;
  },
  setLed: function(led, newState) {
    newState = (typeof(newState)==='boolean') ? newState : false ;
    if(newState == false) {
      led.removeComponent(led.ledColor+"_on")
          .addComponent(led.ledColor+"_off")
          .removeComponent('ON');
    } else {
      led.removeComponent(led.ledColor+"_off")
          .addComponent(led.ledColor+"_on")
          .addComponent('ON');
    }
    led.ledOn = newState;
  },
  resetLeds: function() {
    for (var i = 0; i < Game.ledsArray.length; i++) {
      for (var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.setLed(Game.ledsArray[i][j], false);
      }
    }
  },
  calculate: function() {
    /*
    For each led, check the collision with the leds with ON state,
    then do the Conway calculations accordingly.
    */
    for (var i = 0; i < Game.ledsArray.length; i++) {
      for (var j = 0; j < Game.ledsArray[i].length; j++) {
        // get led collisions count
        var led = Game.ledsArray[i][j];
        var neighbours = led.hit('ON');
        if(neighbours == false) var neighboursCount = 0;
        else var neighboursCount = neighbours.length;
        
        // apply Conway's rules
        switch(neighboursCount) {
          case 2:
            if(led.ledOn == true) Game.newStatesArray[i][j] = true;
            else Game.newStatesArray[i][j] = false;
            break;
          case 3:
            Game.newStatesArray[i][j] = true;
            break;
          default:
            Game.newStatesArray[i][j] = false;
        }
      }
    }
    // apply new states on leds
    for (var i = 0; i < Game.ledsArray.length; i++) {
      for (var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.setLed(Game.ledsArray[i][j], Game.newStatesArray[i][j]);
      }
    }
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
    Game.timerObject = setInterval(function() {
      Game.calculate();
    }, Game.timerInterval);
    Game.active = true;
  },
  stop: function() {
    clearInterval(Game.timerObject);
    Game.resetLeds();
    Game.active = false;
  }
}

$(document).ready(function() {
  Game.initialize();
});
