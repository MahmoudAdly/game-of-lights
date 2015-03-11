var Game = {
  background: null,
  cellSize: 64,
  ledsArray: [[]],
  startButton: null,
  newStatesArray: [[]],
  colorsArray: ['r','g','b'],
  active: false,
  calcTimerObject: null,
  calcTimerInterval: 1000,
  resetTimerObject: null,
  resetTimerInterval: 500,
  initialize: function() {
    Crafty.init(Crafty.viewport._width, Crafty.viewport._height, document.getElementById('cr-stage'));
    Game.loadAssets();
    Game.createLeds();
    Game.createStartButton();
    Crafty.bind('ViewportResize', Game.resizeScreen);
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
    /*
    This will RESET the game. A timer is used to avoid frequent resizing.
    */
    clearInterval(Game.calcTimerObject);
    clearTimeout(Game.resetTimerObject);
    Game.resetTimerObject = setTimeout(function function_name (argument) {
      Game.destroyLeds();
      Game.createLeds();
      Game.startButton.destroy();
      Game.createStartButton();
    }, Game.resetTimerInterval);

  },
  createLeds: function() {
    // Calculate needed cells in given viewport
    var cols = Math.floor(Crafty.viewport._width / Game.cellSize);
    var rows = Math.floor(Crafty.viewport._height / Game.cellSize);

    // Populate the array with newly created leds
    for(var i=0; i<rows; i++) {
      if(Game.ledsArray[i] == undefined) Game.ledsArray.push([]);
      for(var j=0; j<cols; j++) {
        Game.ledsArray[i][j] = Game.newLed(i,j);
      }
    }

    // Populate another array to use in calculations.
    // This is better that regenarating it at every cycle
    for(var i = 0; i < Game.ledsArray.length; i++) {
      if(Game.newStatesArray[i] == undefined) Game.newStatesArray.push([]);
      for(var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.newStatesArray[i][j] = false;
      }
    }
  },
  destroyLeds: function() {
    for (var i = 0; i < Game.ledsArray.length; i++) {
      for (var j = 0; j < Game.ledsArray[i].length; j++) {
        Game.ledsArray[i][j].destroy();
      }
    }
    Game.ledsArray = [[]];
    Game.newStatesArray = [[]];
  },
  newLed: function(row, col) {
    // Select led color randomly and set the sprite component accordingly
    var randColor = Game.colorsArray[Crafty.math.randomInt(0,Game.colorsArray.length-1)];
    var img_component = randColor + "_off";
    
    // Create a basic entity with only a sprite component
    var ledX = Game.cellSize*col,
        ledY = Game.cellSize*row,
        ledW = Game.cellSize,
        ledH = Game.cellSize;
    var e = Crafty.e('2D, Canvas')
                .attr({x: ledX, 
                  y: ledY, 
                  w: ledW, 
                  h: ledH,
                  ledColor: randColor,
                  ledOn: false})
                .addComponent(img_component);

    // Rotate the led randomly
    e.origin('center').attr({rotation: Crafty.math.randomInt(-60,60)});

    /*
    - Attach another entity to the led for mouse clicks and collision detection.
    - This way we avoid the rotation of clickable area and collision box.
    - The collision box is bigger than the led to use it for neighbourhood calculations, but
      not too big to overlap with the far neighbour cells.
    - Add 'WiredHitBox' to the components to see how it looks with a rotated parent
    */
    e.attach( Crafty.e('2D, Collision, Mouse')
                    .attr({
                      x: ledX, 
                      y: ledY, 
                      w: ledW, 
                      h: ledH})
                    .bind('Click', function(e) {
                      if( e.mouseButton == Crafty.mouseButtons.LEFT ) {
                        // Invert led state
                        Game.setLed(this._parent, !this._parent.ledOn);
                      }
                    })
                    .collision(new Crafty.polygon(
                                              [-(Game.cellSize*0.25),-(Game.cellSize*0.25)], 
                                              [(Game.cellSize*1.25),-(Game.cellSize*0.25)],
                                              [(Game.cellSize*1.25),(Game.cellSize*1.25)],
                                              [-(Game.cellSize*0.25),(Game.cellSize*1.25)]))
            );

    return e;
  },
  setLed: function(led, newState) {
    newState = (typeof(newState)==='boolean') ? newState : false ;
    if(newState == false) {
      led.removeComponent(led.ledColor+"_on")
          .addComponent(led.ledColor+"_off");
      led._children[0].removeComponent('ON');
    } else {
      led.removeComponent(led.ledColor+"_off")
          .addComponent(led.ledColor+"_on");
      led._children[0].addComponent('ON');
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
        // Get led collisions count using collisions of the child entity
        var led = Game.ledsArray[i][j];
        var neighbours = led._children[0].hit('ON');
        if(neighbours == false) var neighboursCount = 0;
        else var neighboursCount = neighbours.length;
        
        // Apply Conway's rules
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
    // Apply new states on leds
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
    Game.startButton = e;
  },
  start: function() {
    Game.calcTimerObject = setInterval(function() {
      Game.calculate();
    }, Game.calcTimerInterval);
    Game.active = true;
  },
  stop: function() {
    clearInterval(Game.calcTimerObject);
    Game.resetLeds();
    Game.active = false;
  }
}

$(document).ready(function() {
  Game.initialize();
});
