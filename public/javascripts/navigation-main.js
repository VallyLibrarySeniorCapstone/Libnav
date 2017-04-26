/*

 Main js file for navigation functionality

 */

/*project global*/
var entryPoint;
var floorGridFromDB;

/*file globals*/
var grid;
var gridCalc;
var svgn;
var startPos;
var finishPos;

/*flags*/
var isHomeNav = false;
var walkable = true;
var startFlag = true;
var finishFlag = false;
var notWalkFlag = false;
var multiFloorNavFlag = false;

/*load grid for navigation dashboard page*/
var loadGridForAdmin = function (svgi) {

    if (svgi != undefined) {
   
        $("#navGrid").ready(function () {

            drawGrid(svgi);
            gridMouse();

        });
    }

};

/*load grid for point select on known*/
var loadGridForKnown = function (svgi) {

    if (svgi != undefined) {
     
        $("#navGrid").ready(function () {
            drawGrid(svgi);
            markPoints();
            hideGridForKnown();
        });
    }

};

/*Takes svg */
var drawGrid = function (svgP) {

    svgP = svgP._groups[0][0];
    svgn = svgP;
    var h = null;
    var w = null;
    grid = null;

    if(grid !=null){
        deleteGrid();
    }

    if(svg !=null){
        w = svgP.attributes.width.value;
        h = svgP.attributes.height.value;  
    }else{
        w = 700;
        h = 700;
        
    }
    
    //size of grid squares
    var square = 9;
    
    w = w.slice(0, -6);
    h = h.slice(0, -6);

    console.log(w);

    
    // create the svg
    grid = d3.select('#grid').append('svg');

    grid.attr("width", w).attr("height", h).attr("class","navGrid");

    // calculate number of rows and columns
    var squaresRow = _.round(w / square)+1;
    var squaresColumn = _.round(h / square)+1;

    // loop over number of columns
    _.times(squaresColumn, function (n) {

        // create each set of rows

        var rows = grid.selectAll('rect' + ' .row-' + (n + 1)).data(d3.range(squaresRow))
            .enter().append('rect')
            .attr("fill-opacity", '.2')
            .attr("fill", 'white')
            .attr('class', function (d, i) {
                return 'square row-' + (n + 1) + ' ' + 'col-' + (i + 1);
            })
            .attr('id', function (d, i) {
                return 's-' + (n + 1) + "-" + (i + 1);
            })
            .attr("width", square)
            .attr("height", square)
            .attr("x", function (d, i) {
                return i * square;
            })
            .attr('y', n * square)
            .attr("stroke", 'black')
            .attr("stroke-width", ".2");

    });
    
    setGridPathFinderFromDB(squaresColumn, squaresRow, grid);
    allRectangles = grid.selectAll('rect');
};
   

/*Sets new pathfinding grid for pathfinding-js*/
var createNewGridPathFinder = function (squaresColumn, squaresRow, grid) {
    //set grid
    gridCalc = new PF.Grid(squaresColumn + 1, squaresRow + 1);
    //nonwalk
    _.times(squaresColumn, function (n) {

        _.times(squaresRow, function (m) {
            gridCalc.setWalkableAt(n, m, false);
            var recID = "s-" + n + "-" + m;
            grid.select("rect[id='" + recID + "']").attr('fill', 'grey');
        });
    });
};


/*grabs pathfinding grid from db, if not available create new grid*/
var setGridPathFinderFromDB = function (squaresColumn, squaresRow, grid) {
    //set grid
    gridCalc = new PF.Grid(squaresColumn, squaresRow);
    if(floorGridFromDB == null || floorGridFromDB === undefined){
        createNewGridPathFinder(squaresColumn, squaresRow, grid);
    }else{
    gridCalc.nodes = floorGridFromDB;
    if(isHomeNav==false){
        //nonwalk
        _.times(floorGridFromDB.length, function (n) {
            _.times(floorGridFromDB.length, function (m) {
                if(floorGridFromDB[m][n]===undefined){
                   
                }else{
                    if(floorGridFromDB[m][n].walkable){
                        var recID = "s-" + n + "-" + m;
                        grid.select("rect[id='" + recID + "']").attr('fill', 'blue').attr('fill-opacity',.2);
                    }
                    else{
                        var recID = "s-" + n + "-" + m;
                        grid.select("rect[id='" + recID + "']").attr('fill', 'red').attr('fill-opacity',.2);
                    }
                }
            });

        });
    }
    }
};

/*show grid on the known and unkown location forms*/
var showGrid = function () {
    grid.attr("display","initial");
    grid.attr("z-index","1");
};

/*Hides the grid on the known and unknown locations page*/
var hideGridForKnown = function () {
    grid.attr("display","none");
    grid.attr("z-index","-1");
};

/*Hides the grid on the known page, displaying only path*/
var hideGridForHomeNav = function () {
    rects = grid.selectAll('rect');
    rects.each(function () {
        var x = this;
        if (this.attributes.getNamedItem("path") == null) {
            this.attributes.getNamedItem("fill-opacity").value = 0;
            this.attributes.getNamedItem("stroke").value = "none";
        }
    });
};

/*Test a line on the dashboard navigation page*/
function drawLineTest() {

    var allRectangles = grid.selectAll('rect');

    allRectangles.on('click', function (d, i) {

        var pos = this.id.split('-');
        var row = pos[1];
        var col = pos[2];
        if (startFlag) {
            startPos = [row, col];
            startFlag = false;
            finishFlag = true;
            d3.select(this).attr('fill', 'blue');

        } else if (finishFlag) {
            finishPos = [row, col];
            finishFlag = false;
            d3.select(this).attr('fill', 'red');
        } else {
            notWalkFlag = false;
        }

        if (startFlag != true && finishFlag != true) {
            var finder = new PF.AStarFinder();
            var path = finder.findPath(startPos[0], startPos[1], finishPos[0], finishPos[1], gridCalc);
            startFlag = false;
            finishFlag = false;


            for (var x = 1; x < path.length - 1; x++) {
                var recID = "s-" + path[x][0] + "-" + path[x][1];
                grid.select("rect[id='" + recID + "']").attr('fill', 'black');
            }

            for (var x = 0; x < path.length; x++) {
                var recID = "s-" + path[x][0] + "-" + path[x][1];
                grid.select("rect[id='" + recID + "']").attr("path", 'true');
            }

        }

        d3.select('#grid-ref').text(function () {
            return 'row: ' + (n + 1) + ' | ' + 'column: ' + (i + 1);
        });


    });
    
}


var navigate = function(point1, point2){
  if(point1.floor != point2.floor && multiFloorNavFlag==false){
        navToDiffFloors(point1,point2);
    }else{
        drawGrid(svg);
        drawLine(point1,point2);
    }
};

/*given two points, draw line from point 1 to point 2*/ 
var drawLine = function(point1, point2){
  
     var pos1 = point1.entry_point.split('-');
     var row1 = parseInt(pos1[1]);
     var col1 = parseInt(pos1[2]);
     var pos2 = point2.entry_point.split('-');
     var row2 = parseInt(pos2[1]);
     var col2 = parseInt(pos2[2]);
     path = null;    
     var finder = new PF.AStarFinder();
     if(gridCalc == null || gridCalc===undefined){
        setGridPathFinderFromDB();
        var gridBackup = gridCalc.clone(); 
        path = finder.findPath(row1, col1,  row2, col2, gridBackup);
     }else{
        //var gridBackup = gridCalc.clone();
         var gridBackup = gridCalc;
        path = finder.findPath(row1, col1,  row2, col2, gridBackup);
     }


     for (var x = 0; x < path.length; x++) {
         var recID = "s-" + path[x][0] + "-" + path[x][1];
         grid.select("rect[id='" + recID + "']")
             .attr('fill', '#c34500')
             .attr("path", 'true')
             .attr("fill-opacity",".8")
             .attr("stroke", 'none');
     }


     hideGridForHomeNav();
 };


var navToDiffFloors = function( point1, point2){
    var elevator1;
    var elevator2;
    var firstFloor = "#floor-" + point1.floor;
    var secondFloor = "#floor-" + point2.floor;
    $(firstFloor).click();
    drawGrid(svg);
  
        _.forEach(locations, function(loc){
            if(_.includes(loc.name,"elevator")){
                if(point1.floor == loc.floor){
                    elevator1 = loc;
                }else if(point2.floor == loc.floor){
                    elevator2 = loc;
                }
            }
        });

        multiFloorNavFlag = true;
        drawLine(point1, elevator1);

        $(secondFloor).click(function(){
            deleteGrid();
            navigate(point2, elevator2);
            $(this).unbind();
        });
}

 
/* sets all of the on click/drag functionality for the the grid */
var gridMouse = function () {
    var allRectangles = grid.selectAll('rect');
    var isDragging = false;

    var makeWalkMouseDown = allRectangles.on('mousedown', function () {
        isDragging = true;
    });

    var makeWalkMouseDrag = allRectangles.on('mousemove', function () {
        var pos = this.id.split('-');
        var row = pos[1];
        var col = pos[2];
        if (isDragging) {
            if (walkable) {
                var thisRec = grid.select("rect[id='" + this.id + "']").attr('fill', 'green').attr('fill-opacity',.5);
                thisRec.attr("walkable", true);
                gridCalc.setWalkableAt(row, col, true);
            } else {
                grid.select("rect[id='" + this.id + "']").attr('fill', 'white').attr('fill-opacity', '.1');
                gridCalc.setWalkableAt(row, col, false);
            }
        }
    });

    var makemouseUp = allRectangles.on('mouseup', function () {
        var wasDragging = isDragging;
        isDragging = false;
        if (!wasDragging) {
        }
    });
};

/* mark the entry point for a location  */
var markPoints = function () {

    var lastPoint;
    var allRectangles = grid.selectAll('rect');

    allRectangles.on('click', function (d, i) {

        var pos = this.id.split('-');
        var row = pos[1];
        var col = pos[2];

        if (lastPoint != "" && lastPoint != undefined && lastPoint != null)
            grid.select("rect[id='" + lastPoint + "']").attr('fill', 'white');

        lastPoint = this.id;
        grid.select("rect[id='" + this.id + "']").attr('fill', 'blue').attr("fill-opacity", ".8");
        
        entryPoint = this.id; 

    });
};


function deleteGrid(){
    //var grid = svg.select('#grid');
    //grid.remove();
    $("#grid > svg").remove();
}



$("#navLine").on("click", function () {
    var allRectangles = grid.selectAll('rect');
    allRectangles.on('click', null);
    drawLineTest();
});


