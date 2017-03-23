import * as d3 from "d3";
import {COLORS} from "../../../common/constants.js";

var DELAY = 300;

// Mike Bostock "margin conventions"
function drawBarGraph( elementId, data ) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      containerEl = document.getElementById( elementId ),
      width = containerEl.clientWidth - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // D3 scales = just math
  // x is a function that transforms from "domain" (data) into "range" (usual pixels)
  // domain gets set after the data loads
  var x = d3.scaleBand()
    .range([0, width])
    .paddingOuter(.1)
    .paddingInner(.1);

  var y = d3.scaleLinear()
      .range([height, 0]);

  // D3 Axis - renders a d3 scale in SVG
  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y)
      .ticks(10);

  var container   = d3.select( containerEl );
  var svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "bar--x bar--axis")
      .attr("transform", "translate(0," + height + ")");

  svg.append("g")
      .attr("class", "bar--y bar--axis")
    .append("text") // just for the title (ticks are automatic)
      .attr("transform", "rotate(-90)") // rotate the text!
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  // d3.tsv is a wrapper around XMLHTTPRequest, returns array of arrays (?) for a TSV file
  // type function transforms strings to numbers, dates, etc.
  replay(data);

  function type(d) {
    // + coerces to a Number from a String (or anything)
    d.frequency = +d.frequency;
    return d;
  }

  function replay(data) {
    var slices = [];
    for (var i = data.length; i > 0 ; i--) {
      slices.push(data.slice(i-1, data.length));
    }
    slices.push(data);
    slices.forEach(function(slice, index){
      setTimeout(function(){
        draw(slice);
      }, index * DELAY);
    });
  }

  function draw(data) {
    // measure the domain (for x, unique letters) (for y [0,maxFrequency])
    // now the scales are finished and usable
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    // another g element, this time to move the origin to the bottom of the svg element
    // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
    //   for everything in the selection\
    // the end result is g populated with text and lines!
    svg.select('.bar--x.bar--axis').transition().duration(DELAY).call(xAxis);

    // same for yAxis but with more transform and a title
    svg.select(".bar--y.bar--axis").transition().duration(DELAY).call(yAxis);

    // THIS IS THE ACTUAL WORK!
    var bars = svg.selectAll(".bar").data(data, function(d) { return d.letter; }); // (data) is an array/iterable thing, second argument is an ID generator function

    bars.exit()
      .transition()
        .duration(300)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();

    // data that needs DOM = enter() (a set/selection, not an event!)
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("fill", COLORS[0])
      .attr("y", y(0))
      .attr("height", height - y(0));

    // the "UPDATE" set:
    bars.transition().duration(300).attr("x", function(d) { return x(d.letter); }) // (d) is one item from the data array, x is the scale object from above
      .attr("width", x.bandwidth()) // constant, so no callback function(d) here
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); }); // flip the height, because y's domain is bottom up, but SVG renders top down

  }
}

export default drawBarGraph;
