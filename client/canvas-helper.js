var CANVAS = {
    ratio: [3, 2],
    size: {width: 300, height: 200}, // 100x100 original
    scale: 1,
    layers: [],
    createCanvas: function () {
        var canvas = document.createElement('canvas');
        canvas.drawPosition = {x: 0, y: 0};
        canvas.isGrid = false;
        canvas.isHit = function (x, y) {
            if (this.top && this.bottom) {
                if (x > this.top.x && y > this.top.y && x < this.bottom.a && y < this.bottom.z) {
                    return true;
                }
            }
            return false;
        };
        return canvas;
    },
    createRootCanvas: function (overrideScale) {
        var deW = document.documentElement.clientWidth;
        var deH = document.documentElement.clientHeight;
        var deWS = Math.floor(deW / CANVAS.size.width);
        var deHS = Math.floor(deH / CANVAS.size.height);
        if (deWS > 1 && deHS) {
            // Take the smallest scale
            if (deHS > deWS) {
                CANVAS.scale = deWS;
            } else {
                CANVAS.scale = deHS;
            }
        }
        if (overrideScale) {
            CANVAS.scale = overrideScale;
        }

        // TODO: Need to figure out below. If you do this and set a maxWidth & maxHeight, you screw up position and mouse tracking
        // For a nice crisp image, scale one up then max out the elements width/height to proper scale in UI
        // CANVAS.scale += 1;

        var canvas = CANVAS.createCanvas();
        var context = canvas.getContext('2d');
        canvas.width = CANVAS.size.width * CANVAS.scale;
        canvas.height = CANVAS.size.height * CANVAS.scale;
        var gradient = context.createRadialGradient(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 0, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), canvas.width);
        gradient.addColorStop(0, 'rgb(80, 80, 80)');
        gradient.addColorStop(1, 'rgb(30, 30, 30)');
        // context.scale(2, 2); // NOTE: This works but it's not very intuitive if you have a fixed width canvas
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        return canvas;
    },
    // TODO: To make this functional, pass in the actual scale instead of depending on CANVAS global variable
    createRootGrid: function (scaled) {
        var width = CANVAS.ratio[0] * 10;
        var height = CANVAS.ratio[1] * 10;
        if (scaled) {
            width *= CANVAS.scale;
            height *= CANVAS.scale;
        }
        var rows = (CANVAS.size.width * CANVAS.scale) / width;
        var columns = (CANVAS.size.height * CANVAS.scale) / height;

        // TODO: Standardize this as element
        return {
            rows,
            columns,
            size: {width, height},
            isGrid: true,
            shouldRender: true,
            color: 'rgba(40, 40, 40, 1)',
            elements: [],
            getGrid: function (x, y) {
                var top = {
                    x: ((x * this.size.width) - this.size.width),
                    y: ((y * this.size.height) - this.size.height),
                    a: (x * this.size.width),
                    z: (y * this.size.height)
                };
                var bottom = {
                    x: ((x * this.size.width) - this.size.width),
                    y: (y * this.size.height),
                    a: (x * this.size.width),
                    z: (y * this.size.height)
                };
                return {top, bottom, width: this.size.width, height: this.size.height};
            }
        };
    },
    renderGrid: function (grid, canvas, color) {
        for (var y = 0; y < grid.rows; ++y) {
            for (var x = 0; x < grid.columns; ++x) {
                var rect = CANVAS.createRectangle(grid.size.width, grid.size.height, false, color);
                var context = canvas.getContext('2d');
                context.drawImage(rect, (x * grid.size.width), (y * grid.size.height));
            }
        }
    },
    createGrid: function (parentGrid, spaces, options) {
        var grid = {
            // originalGridId: parentGrid.id, // TODO: This
            parentGrid: parentGrid,
            originalSpaces: spaces,
            isGrid: true,
            spaces: [],
            rows: 0,
            columns: 0,
            size: {width: 0, height: 0},
            elements: [],
            shouldRender: false,
            color: 'rgba(255, 0, 0, 0.3)',
            id: false
        };
        if (options) {
            if (options.color) {
                grid.color = options.color;
            }
            if (options.shouldRender) {
                grid.shouldRender = options.shouldRender;
            }
            if (options.id) {
                grid.id = options.id;
            }
        }
        grid.calculateSpaceBoundaries = function () {
            var lastX = 0;
            for (var i = 0; i < this.originalSpaces.length; ++i) {
                var space = this.originalSpaces[i];
                var newSpace = {x: space.x, y: space.y};
                newSpace.top = {x: 0, y: 0, z: 0, a: 0};
                newSpace.bottom = {x: 0, y: 0, z: 0, a: 0};
                newSpace.width = 0;
                newSpace.height = 0;
                for (var x = 0; x < space.grids.length; ++x) {
                    var spaceGrids = space.grids[x];
                    var cursorX = spaceGrids.x;
                    var cursorY = spaceGrids.y;
                    var originalCursorX = spaceGrids.x;
                    var fullWidth = 0;
                    var fullHeight = 0;
                    var maxX = spaceGrids.x;
                    var maxY = spaceGrids.y;
                    if (spaceGrids.x.from && spaceGrids.x.to) {
                        cursorX = spaceGrids.x.from;
                        originalCursorX = spaceGrids.x.from;
                        maxX = spaceGrids.x.to;
                    }
                    if (spaceGrids.y.from && spaceGrids.y.to) {
                        cursorY = spaceGrids.y.from;
                        maxY = spaceGrids.y.to;
                    }
                    ++maxX;
                    ++maxY;
                    while (cursorY < maxY) {
                        cursorX = originalCursorX;
                        fullWidth = 0;
                        var height = 0;
                        while (cursorX < maxX) {
                            var dimensions = this.parentGrid.getGrid(cursorX, cursorY); // TODO: Grab grid by ID from a function or global register somewhere
                            fullWidth += dimensions.width;
                            height = dimensions.height;
                            ++cursorX;
                        }
                        fullHeight += height;
                        ++cursorY;
                    }
                    newSpace.width = fullWidth;
                    newSpace.height = fullHeight;
                    var top = {
                        x: ((newSpace.x * newSpace.width) - newSpace.width),
                        y: ((newSpace.y * newSpace.height) - newSpace.height),
                        a: (newSpace.x * newSpace.width),
                        z: (newSpace.y * newSpace.height)
                    };
                    var bottom = {
                        x: ((newSpace.x * newSpace.width) - newSpace.width),
                        y: (newSpace.y * newSpace.height),
                        a: (newSpace.x * newSpace.width),
                        z: (newSpace.y * newSpace.height)
                    };
                    newSpace.top = top;
                    newSpace.bottom = bottom;
                }
                this.spaces.push(newSpace);
                this.columns = newSpace.x;
                this.rows = newSpace.y;
            }
            this.size.width = this.spaces[0].width;
            this.size.height = this.spaces[0].height;
        };
        grid.getGrid = function (x, y) {
            for (var i = 0; i < this.spaces.length; ++i) {
                var space = this.spaces[i];
                if (space.x === x && space.y === y) {
                    return {top: space.top, bottom: space.bottom, width: space.width, height: space.height};
                }
            }
        };
        grid.calculateSpaceBoundaries();
        return grid;
    },
    elementMove: function () {
        // TODO: All these element functions need to set a "needsRedraw" flag on the root canvas so it knows to redraw
    },
    elementHide: function () {},
    elementShow: function () {},
    elementRotate: function () {},
    createHorizontalList: function () {},
    createCircle: function () {},
    createSquare: function () {},
    createRoundedSquare: function () {},
    createRectangle: function (width, height, scaled, color) {
        var canvas = CANVAS.createCanvas();
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        if (color) {
            context.strokeStyle = color;
        }
        context.rect(0, 0, width, height);
        context.stroke();
        return canvas;
    },
    createRoundedRectangle: function (width, height, radius, scaled) {
        var x = 0;
        var y = 0;
        var canvas = CANVAS.createCanvas();
        if (scaled) {
            // TODO: Should be a "maintainAspectRatio" option here
            width *= CANVAS.ratio[0] * CANVAS.scale;
            height *= CANVAS.ratio[1] * CANVAS.scale;
        }
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        if (width < 2 * radius) { radius = width / 2; }
        if (height < 2 * radius) { radius = height / 2; }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fill();
        return canvas;
    },
    createHexagon: function () {},
    createOctagon: function () {},
    createTriangle: function () {},
    createPolygon: function () {},
    createHalfCircle: function () {},
    createLine: function () {},
    createText: function (width, height, text, scaled) {
        var _ = CANVAS.createCanvas();
        var fontSize = 3;
        if (scaled) {
            fontSize *= CANVAS.scale;
        }
        var padding = 10;
        var paddingLeft = 0;
        var paddingRight = 0;
        var paddingTop = 0;
        var paddingBottom = 0;
        if (padding) {
            paddingLeft = padding;
            paddingRight = padding;
            paddingTop = padding;
            paddingBottom = padding;
        }
        // TODO: margin but then you have to calculate innerWidth and innerHeight without margin so you can adjust border appropriately
        // NOTE: if you're going to anime.js this then you would use "object properties" for rgb and animate those individual properties
        _.width = ((text.length * fontSize) + (paddingLeft + paddingRight));
        _.height = (fontSize + (paddingTop + paddingBottom));
        var __ = _.getContext('2d');
        __.fillStyle = 'rgb(200, 200, 200)';
        __.font = fontSize + 'px Consolas';
        __.textBaseLine = 'middle';
        __.fillText(text, 0, 0);
        // Fill it to get width then re-fill it with better sizing
        // TODO: Is there a smarter way to do this?
        var fontMetrics = __.measureText(text);
        __.clearRect(0, 0, _.width, _.height);
        _.width = fontMetrics.width + (paddingLeft + paddingRight);

        _.width = width;
        _.height = height;
        //if (scaled) {
        //    _.width *= CANVAS.scale;
        //    _.height *= CANVAS.scale;
        //}
        // __.scale(0.5, 0.5); // NOTE: This works but it's usually a good idea to go from big to small
        __.fillStyle = 'rgb(200, 200, 200)';
        __.font = fontSize + 'px Consolas';
        // __.textBaseAlign = 'middle';
        // __.textAlign = 'center';
        //__.fillText(text, paddingLeft, ((fontSize - fontMetrics.fontBoundingBoxDescent) + paddingTop));
        __.fillText(text, ((_.width / 2) - (fontMetrics.width / 2)), ((_.height / 2) + Math.floor(fontMetrics.fontBoundingBoxAscent / 2)));
        // Border
        var border = true;
        if (border) {
            __.strokeStyle = 'rgb(255, 255, 255)';
            __.lineWidth = 1;
            __.strokeRect(0, 0, _.width, _.height);
        }
        return _;
    },
    putElementOntoCanvas: function (childCanvas, rootCanvas, x, y) {
        var rootContext = rootCanvas.getContext('2d');
        // Note: It might feel wrong to put this on the canvas itself but if you need to move the thing around your canvas is what you want to re-draw on the root canvas
        childCanvas.top = {
            x: x,
            y: y,
            a: (x + childCanvas.width),
            z: y
        };
        childCanvas.bottom = {
            x: x,
            y: (y + childCanvas.height),
            a: (x + childCanvas.width),
            z: (y + childCanvas.height)
        };
        rootContext.drawImage(childCanvas, x, y);
        return childCanvas;
    }
};
