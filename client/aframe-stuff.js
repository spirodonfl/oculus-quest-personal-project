if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let terminalInstance = 0

const TERMINAL_THEME = {
  theme_foreground: {
    'default': '#ffffff'
  },
  theme_background: {
    'default': '#000000'
  },
  theme_cursor: {
    'default': '#ffffff'
  },
  theme_selection: {
    'default': 'rgba(255, 255, 255, 0.3)'
  },
  theme_black: {
    'default': '#000000'
  },
  theme_red: {
    'default': '#e06c75'
  },
  theme_brightRed: {
    'default': '#e06c75'
  },
  theme_green: {
    'default': '#A4EFA1'
  },
  theme_brightGreen: {
    'default': '#A4EFA1'
  },
  theme_brightYellow: {
    'default': '#EDDC96'
  },
  theme_yellow: {
    'default': '#EDDC96'
  },
  theme_magenta: {
    'default': '#e39ef7'
  },
  theme_brightMagenta: {
    'default': '#e39ef7'
  },
  theme_cyan: {
    'default': '#5fcbd8'
  },
  theme_brightBlue: {
    'default': '#5fcbd8'
  },
  theme_brightCyan: {
    'default': '#5fcbd8'
  },
  theme_blue: {
    'default': '#5fcbd8'
  },
  theme_white: {
    'default': '#d0d0d0'
  },
  theme_brightBlack: {
    'default': '#808080'
  },
  theme_brightWhite: {
    'default': '#ffffff'
  }
}

AFRAME.registerComponent('xterm', {
  schema: Object.assign({
    cols: {
      type: 'number',
      default: 80
    },
    rows: {
      type: 'number',
      default: 24
    },
  }, TERMINAL_THEME),

  write: function(message) {
    this.term.write(message)
  },
  init: function () {
    const terminalElement = document.createElement('div')
    terminalElement.setAttribute('style', `
      width: 512px;
      height: 256px;
      opacity: 0.0;
      overflow: hidden;
    `)

    this.el.appendChild(terminalElement)

    this.el.terminalElement = terminalElement

    // Build up a theme object
    const theme = Object.keys(this.data).reduce((theme, key) => {
      if (!key.startsWith('theme_')) return theme
      const data = this.data[key]
      if(!data) return theme
      theme[key.slice('theme_'.length)] = data
      return theme
    }, {})

    console.log('theme', theme);
    const term = new Terminal({
      theme: theme,
      allowTransparency: true,
      cursorBlink: true,
      disableStdin: false,
      rows: this.data.rows,
      cols: this.data.cols,
      fontSize: 14,
      rendererType: 'canvas'
    })

    this.term = term

    term.open(terminalElement)

    this.canvas = terminalElement.querySelector('.xterm-text-layer')
    this.canvas.id = 'terminal-' + (terminalInstance++)
    this.canvasContext = this.canvas.getContext('2d')

    this.cursorCanvas = terminalElement.querySelector('.xterm-cursor-layer')
    console.log('yep', [this.canvas, this.cursorCanvas]);
    this.el.setAttribute('material', {transparent: true, src: '#' + this.canvas.id});

    term.on('refresh', () => {
      const material = this.el.getObject3D('mesh').material
      if (!material.map) return

        console.log('yep2', this.cursorCanvas);
      this.canvasContext.drawImage(this.cursorCanvas, 0,0)

      material.map.needsUpdate = true
    })

    term.on('data', (data) => {
      console.log('data', data);
      this.el.emit('xterm-data', data)
    })

    this.el.addEventListener('click', () => {
      term.focus()
    })
  }
});

var AFRAME_HELPER = {
    getSizeOfDomElement: function (element) {
        var object3d = element.object3D;
        var box = new THREE.Box3().setFromObject(object3d);
        var x = box.max.x - box.min.x
        var y = box.max.y - box.min.y
        var z = box.max.z - box.min.z

        return {x, y, z};
    },

    getElementComponent: function (element, component) {
        return element.components[component];
    },

    createKeyboardEntity: function (data) {
        // TODO: This and validate the damn data
        if (!data.id) {
            data.id = 'keyboard';
        }
        if (!data.standardWidth) {
            data.standardWidth = 0.05;
        }
        if (!data.standardHeight) {
            data.standardHeight = 0.05;
        }
        var keyboardEntity = document.createElement('a-entity');
        keyboardEntity.id = data.id;
        keyboardEntity.setAttribute('position', data.position);

        // TODO: This needs to be updated because we now use arrays to represent rows and columns
        // var currentRow = 0;
        // var currentColumn = 0;
        // var currentPosition = {x: 0, y: 0, z: 0.001};
        // var maxHeight = 0;
        // var padding = 0.01;
        // while (currentRow <= KEYCODE_MAP_LAYOUT.test.max.rows) {
        //     maxHeight = 0;
        //     currentColumn = 0;
        //     currentPosition.x = 0;
        //     while (currentColumn <= KEYCODE_MAP_LAYOUT.test.max.columns) {
        //         for (var i = 0; i < KEYCODE_MAP_LAYOUT.test.keys.length; ++i) {
        //             var layout = KEYCODE_MAP_LAYOUT.test.keys[i];
        //             if (layout.row === currentRow && layout.column === currentColumn) {
        //                 if (layout.keyCode !== null) {
        //                     var keyData = false;
        //                     for (var x = 0; x < KEYCODE_MAP.length; ++x) {
        //                         if (KEYCODE_MAP[x].keyCode === layout.keyCode) {
        //                             keyData = KEYCODE_MAP[x];
        //                             break;
        //                         }
        //                     }
        //                     if (keyData) {
        //                         var width = data.standardWidth * layout.size.width;
        //                         var height = data.standardHeight * layout.size.height;
        //                         if (height > maxHeight) { maxHeight = height; }
        //                         var diff = 0;
        //                         if (width > (data.standardWidth * 1)) {
        //                             diff = width - (data.standardWidth * 1);
        //                             currentPosition.x += (diff / 2);
        //                         }
        //                         var keyboardKeyElement = AFRAME_HELPER.createKeyboardKeyElement({
        //                             keyData: keyData,
        //                             entity: { position: currentPosition },
        //                             key: {
        //                                 size: {
        //                                     width: width,
        //                                     height: height,
        //                                     standardWidth: data.standardWidth,
        //                                     standardHeight: data.standardHeight
        //                                 }
        //                             }
        //                         });
        //                         currentPosition.x += width - (diff / 2) + padding;
        //                         keyboardEntity.appendChild(keyboardKeyElement);
        //                         APP_EVENT_BUS = SFC.EVENTS.listenToEvent(APP_EVENT_BUS, 'keyboard-' + keyData.keyCode + '-clicked', function (evt) {
        //                             document.querySelector('#text-one').setAttribute('value', evt.target.keyData.key);
        //                             // TODO: TESTS.sendKey(evt.target.keyData.key);
        //                         });
        //                     } else {
        //                         console.error('no key data!', layout);
        //                     }
        //                 } else {
        //                     // TODO: empty space
        //                     var width = data.standardWidth * layout.size.width;
        //                     var height = data.standardHeight * layout.size.height;
        //                     if (height > maxHeight) { maxHeight = height; }
        //                     currentPosition.x += width + padding;
        //                 }
        //             }
        //         }
        //         ++currentColumn;
        //     }
        //     currentPosition.y -= maxHeight + padding;
        //     ++currentRow;
        // }
        return keyboardEntity;
    },

    createKeyboardKeyElement: function (data) {
        // data.entity = {position}
        // data.key = {size.height/size.width}
        var entityWrapper = document.createElement('a-entity');
        entityWrapper.setAttribute('position', data.entity.position);

        var plane = document.createElement('a-plane');
        plane.classList.add('clickable');
        plane.id = 'keyboard-' + data.keyData.keyCode;
        plane.keyData = data.keyData;
        plane.setAttribute('side', 'double');
        plane.setAttribute('height', data.key.size.height);
        plane.setAttribute('width', data.key.size.width);
        plane.setAttribute('position', {x: 0, y: 0, z: 0});
        plane.setAttribute('rotation', {x: 0, y: 0, z: 0});
        plane.setAttribute('material', {color: 'rgb(0, 0, 0)'});
        plane.setAttribute('animation__down', {
            property: 'components.material.material.color',
            type: 'color',
            from: 'rgb(0, 0, 0)',
            to: 'rgb(40, 40, 40)',
            dur: 80,
            startEvents: 'start_animation__down'
        });
        plane.setAttribute('animation__up', {
            property: 'components.material.material.color',
            type: 'color',
            from: 'rgb(40, 40, 40)',
            to: 'rgb(0, 0, 0)',
            dur: 80,
            startEvents: 'start_animation__up'
        });
        plane.addEventListener('animationcomplete__down', function (evt) {
            evt.target.emit('start_animation__up', null, false);
        });
        plane.addEventListener('animationcomplete__up', function (evt) {
            // ...
        });
        // TODO: If on browser and you click with the circle/cursor you get TWO clicks, one from a-cursor and one from the-scene
        // If you only click with mouse, regular mouse, you get one click. This needs to be fixed on browser
        plane.addEventListener('click', function (evt) {
            APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, evt.target.id + '-clicked', evt);
            evt.target.emit('start_animation__down', null, false);
        });
        entityWrapper.appendChild(plane);

        var text = document.createElement('a-text');
        text.setAttribute('side', 'double');
        text.setAttribute('opacity', 1);
        text.setAttribute('font', 'https://cdn.aframe.io/fonts/Exo2SemiBold.fnt');
        text.setAttribute('value', (data.keyData.short) ? data.keyData.short.toUpperCase() : data.keyData.key.toUpperCase());
        text.setAttribute('height', (data.key.size.standardHeight * 7));
        text.setAttribute('width', (data.key.size.standardWidth * 7));
        text.setAttribute('color', 'white');
        text.setAttribute('align', 'center');
        text.setAttribute('position', {x: 0, y: 0, z: 0.001});
        text.setAttribute('rotation', {x: 0, y: 0, z: 0});
        entityWrapper.appendChild(text);

        return entityWrapper;
    },

    createFontAwesomeElement: function (data) {
        if (!data.charcode) {
            data.charcode = 'fas fa-desktop';
        }
        if (!data.color) {
            data.color = 'white';
        }
        var element = document.createElement('a-plane');
        element.setAttribute('font-awesome', {
            charcode: data.charcode,
            color: data.color,
            size: data.size
        });
        if (data.id) {
            element.id = data.id;
        }
        if (data.position) {
            element.setAttribute('position', data.position);
        } else {
            element.setAttribute('position', {x: 0, y: 0, z: 0.001});
        }
        element.setAttribute('side', 'double');
        element.setAttribute('width', data.width);
        element.setAttribute('height', data.height);
        element.setAttribute('material', {transparent: true, opacity: data.opacity});
        //element.setAttribute('size-watcher', '');
        return element;
    },

    createEntityPlaneTextElement: function (data) {
        // TODO: Validate data
        var entityWrapper = AFRAME_HELPER.createEntityElement(data.entity);

        var planeElement = AFRAME_HELPER.createPlaneElement(data.plane);
        entityWrapper.appendChild(planeElement);

        var textElement = AFRAME_HELPER.createTextElement(data.text);
        entityWrapper.appendChild(textElement);

        return entityWrapper;
    },

    createEntityPlaneFontAwesomeElement: function (data) {
        // TODO: Validate data
        var entityWrapper = AFRAME_HELPER.createEntityElement(data.entity);

        var planeElement = AFRAME_HELPER.createPlaneElement(data.plane);
        entityWrapper.appendChild(planeElement);

        var textElement = AFRAME_HELPER.createFontAwesomeElement(data.text);
        entityWrapper.appendChild(textElement);

        return entityWrapper;
    },

    createTextElement: function (data) {
        // TODO: This and validate the damn data
        var element = document.createElement('a-text');
        element.setAttribute('value', data.value);
        if (data.align) {
            element.setAttribute('align', data.align);
        }
        if (data.side) {
            element = this.applySide(element, data.side);
        }
        if (data.opacity) {
            element.setAttribute('opacity', 1);
        }
        element.setAttribute('width', data.width);
        element.setAttribute('height', data.height);
        if (data.position) {
            element.setAttribute('position', data.position);
        }
        if (data.color) {
            element.setAttribute('color', data.color);
        }
        if (data.id) {
            element.id = data.id;
        }
        // NOTE: geometry makes text interactable
        // element.setAttribute('geometry', { primitive: 'plane' });
        element.setAttribute('font', 'https://cdn.aframe.io/fonts/Exo2SemiBold.fnt');
        //element.setAttribute('size-watcher', '');
        return element;
    },

    applySide: function (element, value) {
        return element.setAttribute('side', value);
    },

    createBoxElement: function (data) {
        // TODO: Validate data here
        data.position = { x: 0, y: 0, z: 0 };
        var element = document.createElement('a-box');
        // TODO: If 'withBorder' then below
        element.setAttribute('vr-border', {color: 'white'});
        element.setAttribute('opacity', 0);
        element.setAttribute('material', {shader: 'flat', transparent: true});
        element.setAttribute('width', 0.6);
        element.setAttribute('height', 0.17);
        element.setAttribute('depth', 0.01);
        element.setAttribute('position', data.position);
        element.setAttribute('size-watcher', '');
        element.setAttribute('click-watcher', {
            clickCallback: function (evt) {
                console.log('Even more better cooler way better callback', evt);
            }
        });
        return element;
    },

    createHexagonFlatElement: function (data) {
        // TODO: Validate data here
        var element = document.createElement('a-entity');
        element.setAttribute('vr-border', {color: 'yellow' });
        element.setAttribute('hexagon-flat', {width: 0.1, height: 0.1, color: 'rgb(200, 100, 100)' });
        element.setAttribute('position', {x: 0, y: 0, z: 0 });
        // element.setAttribute('size-watcher', '');
        // element.setAttribute('click-watcher', {});
        element.setAttribute('unique-id', generateUUIDv4());
        return element;
    },

    createEntityElement: function (data) {
        var element = document.createElement('a-entity');
        element.setAttribute('width', data.width);
        element.setAttribute('height', data.height);
        if (data.id) {
            element.id = data.id;
        }
        if (data.class) {
            element.setAttribute('class', data.class);
        }
        if (data.position) {
            element.setAttribute('position', data.position);
        }
        if (data.rotation) {
            element.setAttribute('rotation', data.rotation);
        }
        if (data.border) {
            element.setAttribute('vr-border', {color: data.borderColor});
        }
        return element;
    },

    createCircleElement: function (data) {
        // TODO: Validate data here
        if (!data.width) {
            data.width = 1;
        }
        if (!data.height) {
            data.height = 1;
        }
        var element = document.createElement('a-circle');
        if (data.id) {
            element.id = data.id;
        }
        if (data.class) {
            element.setAttribute('class', data.class);
        }
        element.setAttribute('width', data.width);
        element.setAttribute('height', data.height);
        if (data.position) {
            element.setAttribute('position', data.position);
        }
        if (data.rotation) {
            element.setAttribute('rotation', data.rotation);
        }
        if (data.side) {
            element.setAttribute('side', data.side);
        }
        if (data.material) {
            element.setAttribute('material', data.material);
        }
        if (data.geometry) {
            element.setAttribute('geometry', data.geometry);
        }
        if (data.click) {
            element.addEventListener('click', function (evt) {
                APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, evt.target.id + '-clicked', evt);
            });
        }
        if (data.globalClick) {
            element.addEventListener('click', function (evt) {
                APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, 'global-clicked', evt);
            });
        }
        return element;
    },

    createPlaneElement: function (data) {
        // TODO: Validate data here
        if (!data.width) {
            data.width = 1;
        }
        if (!data.height) {
            data.height = 1;
        }
        // TODO: Huh??? imgSrcID ???
        if (data.imgSrcId) {
            data.imgSrc = data.imgSrcId;
        }
        var element = document.createElement('a-plane');
        element._data = data;
        if (data.id) {
            element.id = data.id;
        }
        if (data.class) {
            element.setAttribute('class', data.class);
        }
        element.setAttribute('width', data.width);
        element.setAttribute('height', data.height);
        if (data.position) {
            element.setAttribute('position', data.position);
        }
        if (data.rotation) {
            element.setAttribute('rotation', data.rotation);
        }
        if (data.side) {
            element.setAttribute('side', data.side);
        }
        if (data.material) {
            element.setAttribute('material', data.material);
        }
        if (data.imgSrc) {
            element.setAttribute('imgSrc', data.imgSrc);
            element.setAttribute('material', {side: 'double', src: data.imgSrcId});
            element.setAttribute('auto-update-image', '');
        }
        if (data.click) {
            if (data.clickEventName) {
                element.addEventListener('click', function (evt) {
                    APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, evt.target._data.clickEventName, evt);
                });
            } else {
                element.addEventListener('click', function (evt) {
                    APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, evt.target.id + '-clicked', evt);
                });
            }
        }
        if (data.globalClick) {
            element.addEventListener('click', function (evt) {
                APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, 'global-clicked', evt);
            });
        }
        if (data.border) {
            element.setAttribute('vr-border', {color: data.borderColor});
        }
        if (data.drawCanvas) {
            element.setAttribute('draw-canvas', data.drawCanvas);
        }
        return element;
    },

    createImageElement: function (data) {
        // TODO: Validate data here
        data.crossOrigin = 'anonymous';
        data.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';
        var element = document.createElement('img');
        element.src = data.src;
        if (data.crossOrigin) {
            element.setAttribute('crossorigin', data.crossOrigin);
        }
        return element;
    }
}

var _isAFrameReady = false;
AFRAME.registerComponent('initialize', {
    init: function () {
        _isAFrameReady = true;
        APP_EVENT_BUS = SFC.EVENTS.emitEvent(APP_EVENT_BUS, 'aframeIsReady', {});
    }
});

AFRAME.registerComponent('auto-update-image', {
    schema: {},
    init: function () {},
    tick: function () {
        this.el.getObject3D('mesh').material.map.needsUpdate = true;
    }
});

AFRAME.registerComponent('draw-canvas',
    {
        schema: {
            canvasId: {type: 'string', default: 'test'}
        },
        dependencies: ['geometry', 'material'],
        init: function () {
            //this.canvas = resizedcanvas;
            this.canvas = document.querySelector('#' + this.data.canvasId);
            this.context = this.canvas.getContext("2d");
            /*this.canvas.style.width = 300;
            this.canvas.style.height = 300;
            var dpi = window.devicePixelRatio;
            // NOTE: By default, dpi = 1 but if you set it higher it's WAYYY better
            dpi = 8;
            // This means your shapes can actually all be canvas based!!!
            // Set actual size in memory (scaled to account for extra pixel density).
            let style = {
                height: +getComputedStyle(this.canvas).getPropertyValue('height').slice(0,-2),
                width: +getComputedStyle(this.canvas).getPropertyValue('width').slice(0,-2)
            }

            //set the correct attributes for a crystal clear image!
            this.canvas.setAttribute('width', style.width * dpi);
            this.canvas.setAttribute('height', style.height * dpi);
            var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
            this.canvas.width = 300 * scale;
            this.canvas.height = 300 * scale;

            // Normalize coordinate system to use css pixels.
            //this.context.scale(dpi, dpi);

            this.context.fillStyle = "rgba(0, 0, 200, 0.5)";
            // NOTE: draws half circles and stuff
            // for (var i = 0; i < 4; i++) {
            //   for (var j = 0; j < 3; j++) {
            //     this.context.beginPath();
            //     var x = 25 + j * 50; // x coordinate
            //     var y = 25 + i * 50; // y coordinate
            //     var radius = 20; // Arc radius
            //     var startAngle = 0; // Starting point on circle
            //     var endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
            //     var counterclockwise = i % 2 !== 0; // clockwise or counterclockwise

            //     this.context.arc(x, y, radius, startAngle, endAngle, counterclockwise);

            //     if (i > 1) {
            //       this.context.fill();
            //     } else {
            //       this.context.stroke();
            //     }
            //   }
            // }

            // Note how the paths are *almost exactly* the same as
            // hexagon-flat
            // but just with an offset?
            // This means most shapes can be drawn on canvas and in 3d
            var offset = 30;
            var w = 30;
            var h = 30;
            //this.context.beginPath();
            this.context.moveTo(0, offset);
            this.context.lineTo(0, w);
            this.context.lineTo((h), (w * 2));
            this.context.lineTo((h * 2), (w * 2));
            this.context.lineTo((h * 3), w);
            this.context.lineTo((h * 3), offset);
            this.context.lineTo((h * 2), (w-offset));
            this.context.lineTo((h), (w-offset));
            this.context.lineTo(0, offset);
            this.context.fill();*/
        },
        tick: function (t) {
            // thanks to https://github.com/aframevr/aframe/issues/3936 for the update fix
            let material = this.el.getObject3D('mesh').material;
            if (material.map) {
                material.map.needsUpdate = true;
            } else {
                return;
            }
        }
    }
);

AFRAME.registerComponent('custom-shape', {
    init: function () {
        const x = 0, y = 0;

        const heartShape = new THREE.Shape();

        heartShape.moveTo( x + 5, y + 5 );
        heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
        heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
        heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
        heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
        heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
        heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

        const geometry = new THREE.ShapeGeometry( heartShape );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
        const mesh = new THREE.Mesh( geometry, material ) ;
        this.geometry = geometry;
        this.material = material;
        this.mesh = mesh;
        this.el.setObject3D('mesh', this.mesh);
    }
});

AFRAME.registerComponent('hexagon', {
    schema: {
        width: {type: 'float'},
        height: {type: 'float'}
    },
    init: function () {
        const x = 0, y = 0;

        const shape = new THREE.Shape();

        shape.moveTo(0, 0);
        shape.lineTo(0, this.data.width);
        shape.lineTo((this.data.height), (this.data.width * 2));
        shape.lineTo((this.data.height * 2), (this.data.width * 2));
        shape.lineTo((this.data.height * 3), this.data.width);
        shape.lineTo((this.data.height * 3), 0);
        shape.lineTo((this.data.height * 2), -this.data.width);
        shape.lineTo((this.data.height), -this.data.width);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.005,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };
        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        //const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshPhongMaterial({
            color: this.data.color,
            opacity: 1,
            //transparent: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh( geometry, material ) ;
        this.geometry = geometry;
        this.material = material;
        this.mesh = mesh;
        this.el.setObject3D('mesh', this.mesh);
    }
});

AFRAME.registerComponent('hexagon-flat', {
    schema: {
        width: {type: 'float'},
        height: {type: 'float'}
    },
    init: function () {
        const x = 0, y = 0;

        const shape = new THREE.Shape();

        shape.moveTo(0, 0);
        shape.lineTo(0, this.data.width);
        shape.lineTo((this.data.height), (this.data.width * 2));
        shape.lineTo((this.data.height * 2), (this.data.width * 2));
        shape.lineTo((this.data.height * 3), this.data.width);
        shape.lineTo((this.data.height * 3), 0);
        shape.lineTo((this.data.height * 2), -this.data.width);
        shape.lineTo((this.data.height), -this.data.width);
        shape.lineTo(0, 0);

        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshPhongMaterial({
            color: this.data.color,
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh( geometry, material ) ;
        this.geometry = geometry;
        this.material = material;
        this.mesh = mesh;
        this.el.setObject3D('mesh', this.mesh);
    }
});

AFRAME.registerComponent("vr-border", {
    schema: {
        width: { type: "int", default: 1 },
        color: { type: "string", default: "black" },
    },
    init: function () {
        this.running = true;
        const plane = this.el.object3D.children[0];
        const edges = new THREE.EdgesGeometry(plane.geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: this.data.color,
            // Note: Due to webgl restrictions, linewidth always equals 1. Blah
            linewidth: this.data.width
        }));

        this.borderObject = line;
        this.el.object3D.add(this.borderObject);

        line.material.needsUpdate = true;
    },
    update: function () {
        this.borderObject.material.lineWidth = this.data.width;
        this.borderObject.material.color = new THREE.Color(this.data.color);
    },
    updateBorder: function () {
        if (this.el.object3D.visible) {
            this.running = true;
            this.borderObject.material.visible = true;
        }
        else
            this.borderObject.material.visible = false;
    },
    tick: function () {
        if (this.running) {
            const scale = this.el.object3D.scale;
            const plane = this.el.object3D.children[0].geometry.clone();
            plane.scale(scale.x, scale.y, scale.z);
            const edges = new THREE.EdgesGeometry(plane);
            const position = this.el.object3D.position;

            this.borderObject.geometry = edges;

            //this.borderObject.position.set(position.x, position.y - 0.02, position.z + 0.0005 * 2);
            this.running = false;
        }
    },
    remove: function () {
        this.el.object3D.remove(this.borderObject);
    }
});

/**
 * Point component for A-Frame.
 */
AFRAME.registerComponent('point', {
    schema: {
        color: {
            type: 'color',
            default: '#888'
        },
        size: {
            type: 'number',
            default: 1
        },
        perspective: {
            type: 'boolean',
            default: false
        }
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        // Create geometry.
        this.geometry = new THREE.Geometry();
        this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        // Create material.
        this.material = new THREE.PointsMaterial({
            color: this.data.color,
            size: this.data.size,
            sizeAttenuation: this.data.perspective
        });
        // Create mesh.
        this.points = new THREE.Points(this.geometry, this.material);
        // Set mesh on entity.
        this.el.setObject3D('mesh', this.points);
    },

    setPoints: function (points) {
        this.geometry = new THREE.Geometry();
        var vertices = this.geometry.vertices;
        points.forEach(function (point) {
            vertices.push(new THREE.Vector3(point[0], point[1], point[2]));
        });
        // Create mesh.
        this.points = new THREE.Points(this.geometry, this.material);
        // Set mesh on entity.
        this.el.setObject3D('mesh', this.points);
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function () {
        this.el.removeObject3D('mesh');
    }

});

AFRAME.registerPrimitive('a-point', {
    defaultComponents: {
        point: {}
    },
    mappings: {
        color: 'point.color',
        size: 'point.size',
        perspective: 'point.perspective'
    }
});

AFRAME.registerSystem('font-awesome', {
    schema: {
        timeout: { type: 'number', default: 10000 }
    },

    cache: {},
    promises: {},

    loaded: false,
    promise: null,

    draw: function(data) {
        const key = [data.charcode, data.color, data.size].join('-');
        if (!this.cache[key]) {
            const size = data.size;

            //const canvas = document.createElement("canvas");
            const canvas = document.getElementById('font-awesome-canvas');
            const ctx = canvas.getContext("2d");
            // __ ORIGINAL __
            // canvas.width = size;
            // canvas.height = size;
            

            canvas.style.width = size;
            canvas.style.height = size;
            var dpi = window.devicePixelRatio;
            dpi = 4;
            // This means your shapes can actually all be canvas based!!!
            // Set actual size in memory (scaled to account for extra pixel density).
            // let style = {
            // height: +getComputedStyle(canvas).getPropertyValue('height').slice(0,-2),
            // width: +getComputedStyle(canvas).getPropertyValue('width').slice(0,-2)
            // }
            canvas.setAttribute('width', size * dpi);
            canvas.setAttribute('height', size * dpi);
            ctx.scale(dpi, dpi);

            var fontSize = 800 / (1024 / size);
            const position = size / 2;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = data.color;
            ctx.font = '900 ' + fontSize + 'px \'Font Awesome 5 Pro\'';
            //ctx.fillText(String.fromCharCode('0x' + data.charcode),position,position);
            //ctx.fillText("\uF007",position,position);

            // create an icon with the Font Awesome class name you want
            const i = document.getElementById('font-awesome-el')
            i.setAttribute('class', data.charcode);
            // get the styles for the icon you just made
            const iStyles = window.getComputedStyle(i);
            const iBeforeStyles = window.getComputedStyle(i, ':before');

            const fontFamily = iStyles.getPropertyValue('font-family');
            const fontWeight = iStyles.getPropertyValue('font-weight');
            var fontSize = '40px'; // just to make things a little bigger...

            const canvasFont = `${fontWeight} ${fontSize} ${fontFamily}`; // should be something like: '900 40px "Font Awesome 5 Pro"'
            const icon = String.fromCodePoint(iBeforeStyles.getPropertyValue('content').codePointAt(1)); // codePointAt(1) because the first character is a double quote

            ctx.font = canvasFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = data.color;
            ctx.fillText(icon, position, position);

            this.cache[key] = canvas.toDataURL();
        }

        return this.cache[key];
    },

    isStylesheetLoaded: function() {
        if (this.loaded) {
            return Promise.resolve();
        }

        if (this.isFontAwesomeAvailable()) {
            this.onLoaded();
            return Promise.resolve();
        }

        if (!this.promise) {
            this.promise = new Promise((resolve) => {
                if (this.canCheckDocumentFonts()) {
                    const func = () => {
                        if (this.isFontAwesomeAvailable()) {
                            document.fonts.removeEventListener('loadingdone', func)
                            this.onLoaded(resolve);
                        }
                    };
                    document.fonts.addEventListener('loadingdone', func);
                } else {
                    console.warn('aframe-font-awesome: Unable to determine when FontAwesome stylesheet is loaded. Drawing fonts after ' + this.data.timeout + ' seconds');
                    console.warn('aframe-font-awesome: You can change the timeout by adding "font-awesome="timeout: $timeout" to your a-scene')

                    window.setTimeout(() => {
                        this.onLoaded(resolve);
                    }, this.data.timeout);
                }
            });
        }

        return this.promise;
    },

    isFontAwesomeAvailable: function() {
        return this.canCheckDocumentFonts() && document.fonts.check('900 10px \'Font Awesome 5 Pro\'')
    },

    canCheckDocumentFonts: function() {
        return typeof document.fonts !== 'undefined' && document.fonts.check;
    },

    onLoaded: function(resolve) {
        this.el.emit('font-awesome.loaded');
        this.loaded = true;

        if (resolve) {
            resolve();
        }
    }
});

AFRAME.registerComponent('font-awesome', {
    schema: {
        charcode: { type: 'string' },
        color: { default: '#000', type: 'string' },
        size: { default: 1024, type: 'number' },
        visibleWhenDrawn: { default: true, type: 'boolean' },
    },
    update: function() {
        if (this.data.visibleWhenDrawn) {
            this.el.setAttribute('visible', 'false');
        }

        this.system.isStylesheetLoaded().then(function() {
            const result = this.system.draw(this.data);
            this.el.setAttribute('src', result);
            this.el.emit('font-awesome.drawn');

            if (this.data.visibleWhenDrawn) {
                setTimeout(() => this.el.setAttribute('visible', 'true'));
            }
        }.bind(this));
    }
});

AFRAME.registerPrimitive('a-font-awesome', {
    defaultComponents: {
        geometry: { primitive: 'plane' },
        material: { side: 'double', transparent: 'true' },
    },

    mappings: {
        charcode: 'font-awesome.charcode',
        color: 'font-awesome.color',
        size: 'font-awesome.size',
        src: 'material.src',
    }
});

AFRAME.registerComponent('size-watcher', {
    schema: {},
    init: function () {
        this.el.addEventListener('model-loaded', this.rescale.bind(this));
    },
    rescale: function () {
        const model = this.el.object3D;

        const box = new THREE.Box3().setFromObject(model);
        var x = box.max.x - box.min.x;
        var y = box.max.y - box.min.y;
        var z = box.max.z - box.min.z;
        console.log({x, y, z}, this.el);
    },
    update: function() {
        this.rescale();
    },
    remove: function () {
        this.el.removeEventListener('model-loaded', this.rescale);
    }
});

AFRAME.registerComponent('click-watcher', {
    schema: {
        clickCallback: {type: 'string'}
    },
    init: function () {},
    events: {
        click: function (evt) {
            console.log('Component event listener executed', evt);

            // This is a single callback. You cannot use this like a regular "events" model
            if (this.data.clickCallback instanceof Function) {
                // You could emit a global event and a component based event if you wanted
                // This way all listeners would get notified
                // You would have to do this during registration of this callback
                this.data.clickCallback(evt);
            }
        }
    },
});

AFRAME.registerComponent('track-hand-rotation', {
    tick: function () {
        var rotation = document.querySelector('#left-hand').getAttribute('rotation');
        //document.querySelector('a-entity').setAttribute('rotation', rotation);
    }
});

// TODO: Move to APP
var CameraPosition = {x: 0, y: 0, z:0};
var Controls = {
    modifiers: {
        y: false
    }
};
AFRAME.registerComponent('oculus-quest-2-controller-logging', {
    // TODO: Move thumbstick logging here perhaps
    init: function () {
        this.el.addEventListener('bbuttondown', this.aButtonDown);
        this.el.addEventListener('bbuttonup', this.bButtonUp);
        this.el.addEventListener('ybuttondown', this.yButtonDown);
        this.el.addEventListener('ybuttonup', this.yButtonUp);
    },
    aButtonDown: function (evt) {
        if (Controls.modifiers.y) {
            Controls.modifiers.y = false;
        } else {
            Controls.modifiers.y = true;
        }
    },
    aButtonUp: function (evt) {
        Controls.modifiers.y = false;
    },
    yButtonDown: function (evt) {
        if (Controls.modifiers.y) {
            Controls.modifiers.y = false;
        } else {
            Controls.modifiers.y = true;
        }
    },
    yButtonUp: function (evt) {
        Controls.modifiers.y = false;
    }
});
AFRAME.registerComponent('thumbstick-logging', {
    init: function () {
        // TODO: Tell which hand by 'oculus-touch-controls="hand: left/right"' attribute
        this.el.addEventListener('thumbstickmoved', this.logThumbstick);
    },
    logThumbstick: function (evt) {
        var iteration = 0.1;
        //document.querySelector('a-text').setAttribute('value', 'poop');
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            var dd = "";
            if ("xr" in window.navigator) {
                dd += "xr!,";
            } else {
                dd += "no-xr,";
            }
            navigator.xr.isSessionSupported("immersive-ar").then(function (a) {
                if (a) {
                    dd += "ar!,";
                } else {
                    dd += "no-ar,";
                }
                for (var i = 0; i < devices.length; ++i) {
                    dd += devices[i].kind + ",";
                }
                dd += "end";
                //var _devices = JSON.stringify(dd);
                document.querySelector('a-text').setAttribute('value', dd);
            });
        });
        if (evt.detail.y > 0.95) {
            if (mouseToggled) {
                TESTS.sendMouseMoveBy({x: 0, y: (iteration*1)});
            } else {
                if (Controls.modifiers.y) {
                    CameraPosition.y += iteration;
                } else {
                    CameraPosition.z += iteration;
                }
                document.querySelector('#the-camera-rig').setAttribute('position', CameraPosition);
            }
        }
        if (evt.detail.y < -0.95) {
            if (mouseToggled) {
                TESTS.sendMouseMoveBy({x: 0, y: -(iteration*1)});
            } else {
                if (Controls.modifiers.y) {
                    CameraPosition.y -= iteration;
                } else {
                    CameraPosition.z -= iteration;
                }
                document.querySelector('#the-camera-rig').setAttribute('position', CameraPosition);
            }
        }
        if (evt.detail.x < -0.95) {
            if (mouseToggled) {
                TESTS.sendMouseMoveBy({x: -(iteration*1), y: 0});
            } else {
                CameraPosition.x -= iteration;
                document.querySelector('#the-camera-rig').setAttribute('position', CameraPosition);
            }
        }
        if (evt.detail.x > 0.95) {
            if (mouseToggled) {
                TESTS.sendMouseMoveBy({x: (iteration*1), y: 0});
            } else {
                CameraPosition.x += iteration;
                document.querySelector('#the-camera-rig').setAttribute('position', CameraPosition);
            }
        }
    }
});

AFRAME.registerComponent('camera-logger', {
    schema: {
        timestamp: {type: 'int'},
        seconds: {type: 'int'} // default 0
    },

    log : function () {
        var cameraEl = this.el.sceneEl.camera.el;
        var rotation = cameraEl.getAttribute('rotation');
        var worldPos = new THREE.Vector3();
        worldPos.setFromMatrixPosition(cameraEl.object3D.matrixWorld);
        /*console.log("Time: " + this.data.seconds
            + "; Camera Position: (" + worldPos.x.toFixed(2) + ", " + worldPos.y.toFixed(2) + ", " + worldPos.z.toFixed(2)
            + "); Camera Rotation: (" + rotation.x.toFixed(2) + ", " + rotation.y.toFixed(2) + ", " + rotation.z.toFixed(2) + ")");*/
    },

    play: function () {
        this.data.timestamp = Date.now();
        this.log();
    },

    tick: function () {
        if (Date.now() - this.data.timestamp > 1000) {
            this.data.timestamp += 1000;
            this.data.seconds += 1;
            this.log();
        }
    },
});

AFRAME.registerComponent("dragndrop", {
  init: function() {
    this.dist = null
    this.dir = new THREE.Vector3()

    this.scene = APP.getMemoized('UI', 'getTheScene');
    this.camera = document.querySelector('a-camera');
    this.hasMoved = false;
    this.state = false;

    this.el.addEventListener("click", e =>{
        if (this.state === false) {
            this.state = true;
      // update the base distance between the cursor to the object
      this.dist = this.el.object3D.position.clone().sub(this.camera.object3D.position).length()

      //this.dir.copy(this.scene.components.raycaster.raycaster.ray.direction)
      this.dir.copy(this.scene.components.raycaster.data.direction);

      this.el.addState("being-dragged")
        } else {
            this.el.removeState('being-dragged');
            this.state = false;
        }
    })

   /* document.addEventListener("mousemove", (evt) => {
      if (evt.movementX > 0 || evt.movementY > 0) {
          this.hasMoved = true;
          // update the direction from raycaster coponent
          if (this.scene.components.raycaster) {
          //this.dir.copy(this.scene.components.raycaster.raycaster.ray.direction)
          this.dir.copy(this.scene.components.raycaster.data.direction);
        }
      }
    })*/


  },
  tick: function() {
    // only move it when certain state is meet
    if (this.el.is('being-dragged')) {
this.dir.copy(this.scene.components.raycaster.data.direction);
      var target = this.camera.object3D.position.clone().add(this.dir.multiplyScalar(this.dist))
      console.log(target);
      this.el.object3D.position.x = target.x;
      this.el.object3D.position.y = target.y;
      this.el.object3D.position.z = target.z;
    }
  }
});

	AFRAME.registerComponent('rounded', {
	  schema: {
	    enabled: {default: true},
	    width: {type: 'number', default: 1},
	    height: {type: 'number', default: 1},
	    radius: {type: 'number', default: 0.3},
	    topLeftRadius: {type: 'number', default: -1},
	    topRightRadius: {type: 'number', default: -1},
	    bottomLeftRadius: {type: 'number', default: -1},
	    bottomRightRadius: {type: 'number', default: -1},
	    color: {type: 'color', default: "#F0F0F0"},
	    opacity: {type: 'number', default: 1}
	  },
	  init: function () {
	    this.rounded = new THREE.Mesh( this.draw(), new THREE.MeshPhongMaterial( { color: new THREE.Color(this.data.color), side: THREE.DoubleSide } ) );
	    this.updateOpacity();
	    this.el.setObject3D('mesh', this.rounded)
	  },
	  update: function () {
	    if (this.data.enabled) {
	      if (this.rounded) {
	        this.rounded.visible = true;
	        this.rounded.geometry = this.draw();
	        this.rounded.material.color = new THREE.Color(this.data.color);
	        this.updateOpacity();
	      }
	    } else {
	      this.rounded.visible = false;
	    }
	  },
	  updateOpacity: function() {
	    if (this.data.opacity < 0) { this.data.opacity = 0; }
	    if (this.data.opacity > 1) { this.data.opacity = 1; }
	    if (this.data.opacity < 1) {
	      this.rounded.material.transparent = true;
	    } else {
	      this.rounded.material.transparent = false;
	    }
	    this.rounded.material.opacity = this.data.opacity;
	  },
	  tick: function () {},
	  remove: function () {
	    if (!this.rounded) { return; }
	    this.el.object3D.remove( this.rounded );
	    this.rounded = null;
	  },
	  draw: function() {
	    var roundedRectShape = new THREE.Shape();
	    function roundedRect( ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius ) {
	      if (!topLeftRadius) { topLeftRadius = 0.00001; }
	      if (!topRightRadius) { topRightRadius = 0.00001; }
	      if (!bottomLeftRadius) { bottomLeftRadius = 0.00001; }
	      if (!bottomRightRadius) { bottomRightRadius = 0.00001; }
	      ctx.moveTo( x, y + topLeftRadius );
	      ctx.lineTo( x, y + height - topLeftRadius );
	      ctx.quadraticCurveTo( x, y + height, x + topLeftRadius, y + height );
	      ctx.lineTo( x + width - topRightRadius, y + height );
	      ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - topRightRadius );
	      ctx.lineTo( x + width, y + bottomRightRadius );
	      ctx.quadraticCurveTo( x + width, y, x + width - bottomRightRadius, y );
	      ctx.lineTo( x + bottomLeftRadius, y );
	      ctx.quadraticCurveTo( x, y, x, y + bottomLeftRadius );
	    }

	    var corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
	    if (this.data.topLeftRadius != -1) { corners[0] = this.data.topLeftRadius; } else { corners[0] = this.data.height / 3.33; }
	    if (this.data.topRightRadius != -1) { corners[1] = this.data.topRightRadius; } else { corners[1] = this.data.height / 3.33; }
	    if (this.data.bottomLeftRadius != -1) { corners[2] = this.data.bottomLeftRadius; } else { corners[2] = this.data.height / 3.33; }
	    if (this.data.bottomRightRadius != -1) { corners[3] = this.data.bottomRightRadius; } else { corners[3] = this.data.height / 3.33; }

	    roundedRect( roundedRectShape, 0, 0, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3] );
	    return new THREE.ShapeBufferGeometry( roundedRectShape );
	  },
	  pause: function () {},
	  play: function () {}
	});

	AFRAME.registerPrimitive('a-rounded', {
	  defaultComponents: {
	    rounded: {}
	  },
	  mappings: {
	    enabled: 'rounded.enabled',
	    width: 'rounded.width',
	    height: 'rounded.height',
	    radius: 'rounded.radius',
	    'top-left-radius': 'rounded.topLeftRadius',
	    'top-right-radius': 'rounded.topRightRadius',
	    'bottom-left-radius': 'rounded.bottomLeftRadius',
	    'bottom-right-radius': 'rounded.bottomRightRadius',
	    color: 'rounded.color',
	    opacity: 'rounded.opacity'
	  }
	});
