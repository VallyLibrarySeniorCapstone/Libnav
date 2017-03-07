/**
 * Project:
 * File: render-map
 * Author: Nathan Healea, Matthew Zakrevsky
 * Created: 1/16/17
 */

var pointArray = [];

window.onload = function () {

console.log("loaded draw poly");

    var count = 0;


    var floor = "../floor-6-redesign";

    $("#map-wrapper").ready(function () {
 /*       var a = document.getElementById("map-wrapper");
        console.log(a);
        var svgDoc = a.contentDocument;
        console.log(svgDoc);
        var svgItem = svgDoc.getElementById("Background");
        var svg = d3.select(svgItem);
*/


 var a = document.getElementById("map-wrapper");
        var svgDoc = a.contentDocument;
        var svgChildren = svgDoc.childNodes;
        var svgItem = svgChildren[2];



        var polyLayer = svg.append("g").attr("id", "polygons");

        document.getElementById("btn-draw").onclick = function () {

            svg.on("click", function (ev) {
                console.log('cliking');
                //var point = d3.mouse(this), p = {x:point[0], y:point[1]};
                //var $div = $(ev.target);
                //var offset = $div.offset();
                pos = d3.mouse(this);
                //pointArray.push([(ev.clientX-offset.left),(ev.clientY -  offset.top)]);
                point = {
                    "x": pos[0],
                    "y": pos[1]
                };
                console.log(point);

                pointArray.push(point);
                console.log(pointArray);

                polyLayer.append("circle")
                    .attr("class", "click-circle")
                    //.attr("transform", "translate("+ p.x+ ","+ p.y+")")
                    .attr('cx', point.x)
                    .attr('cy', point.y)
                    .attr("r", "5")
                    .style("fill", "000000");


                svg.append("line")
                    .attr("class", "click-line")
                    .attr("x1", pointArray[count].x)
                    .attr("y1", pointArray[count].y)
                    .attr("x2", pointArray[(count + 1)].x)
                    .attr("y2", pointArray[(count + 1)].y)
                    .style("fill", "0cff00")
                    .style("stroke", "0cff00")
                    .style("strokeWidth", 0.5);
                count++;

                document.getElementById("btn-fill").onclick = function () {
                    svg.append("polygon")
                        .attr("class", "drawn-poly")
                        .attr("points", function () {
                            return pointArray.map(function (d) {
                                return [d.x, d.y].join(",");
                            }).join(" ");
                        })
                        .style("fill", "0cff00")
                        .style("stroke", "0cff00")
                        .style("opacity", .25);

                };

                document.getElementById("btn-clear").onclick = function () {
                    console.log("attempting to remove items")
                    svg.selectAll("circle.click-circle").remove();
                    svg.selectAll("polygon.drawn-poly").remove();
                    svg.selectAll("line.click-line").remove();
                    //pointArray = [];
                    //clear all points in the array
                    while(pointArray.length > 0) {
                         pointArray.pop();
                }    
                count = 0;
                }
            });

        }
    });

};
