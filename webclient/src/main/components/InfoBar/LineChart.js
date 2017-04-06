import * as d3 from "d3";
import {COLORS} from "../../../common/constants.js";
import {sprintf} from 'sprintf-js';


//var COLORS = ["#7FCAFF", "#7F97FF", "#A77FFF", "#E77FFF", "#FF7FB0", "#FF9C7E", "#FFBD7E", "#FFD77E", "#FFF17E", "#F3FF7E", "#CAF562", "#62F5C8"];

var DURATION = 1500;
var DELAY    = 500;

function drawLineChart( elementId, dataDict) {
  // parse helper functions on top
  var parse = d3.timeParse( '%Y-%m-%d' );
  // data manipulation first
  var data = [];

  for (var key in dataDict){
    dataDict[key] = dataDict[key]["stars"].map( function( datum ) {
      datum.date = parse( datum.date );

      return datum;
    } );
    for (var k=0; k < dataDict[key].length; k++){
      data.push(dataDict[key][k]); //hack for finding optima
    }
  }


  // TODO code duplication check how you can avoid that
  var containerEl = document.getElementById( elementId );

  var width       = containerEl.clientWidth,
      height      = width * 0.4,
      margin      = {
        top    : 30,
        right  : 10,
        left   : 10
      },

      detailWidth  = 98,
      detailHeight = 55,
      detailMargin = 10,

      container   = d3.select( containerEl ),
      hor_shift = (margin.right+margin.left);
      var svg =       container.append("svg")
                              .attr( 'width', width-hor_shift)
                              .attr( 'height', height + margin.top ),

      x          = d3.scaleTime().range( [ 0, width - detailWidth ] ),
      xAxis      = d3.axisBottom( x )
                                .ticks ( 8 )
                                .tickSize( -height ),
      xAxisTicks = d3.axisBottom( x )
                                .ticks( 16 )
                                .tickSize( -height )
                                .tickFormat( '' ),
      y          = d3.scaleLinear().range( [ height, 0 ] ),
      yAxisTicks = d3.axisRight( y )
                                .ticks( 12 )
                                .tickSize( width-(margin.right+margin.left) )
                                .tickFormat( '' ),

      area = d3.area()
                    .curve(d3.curveLinear)
                    .x( function( d )  { return x( d.date ) + detailWidth / 2; } )
                    .y0( height )
                    .y1( function( d ) { return y( d.value ); } ),

      line = d3.line()
                .curve(d3.curveLinear)
                .x( function( d ) { return x( d.date ) + detailWidth / 2; } )
                .y( function( d ) { return y( d.value ); } ),

      circleContainer;

  var dates = data.map( function( datum ) {
    return datum.date;
  } );
  var min_date = dates.reduce(function (a, b) { return a < b ? a : b; });
  var max_data = dates.reduce(function (a, b) { return a > b ? a : b; });
  // Compute the minimum and maximum date, and the maximum price.
  x.domain( [ min_date, max_data ] );
  // hacky hacky hacky :(
  y.domain( [ 0, d3.max( data, function( d ) { return d.value; } ) + 1 ] );

  svg.append( 'g' )
      .attr( 'class', 'lineChart--xAxisTicks' )
      .attr( 'transform', 'translate(' + (detailWidth - (hor_shift / 2)) / 2 + ',' + height + ')' )
      .call( xAxisTicks );

  svg.append( 'g' )
      .attr( 'class', 'lineChart--xAxis' )
      .attr( 'transform', 'translate(' + (detailWidth - (hor_shift / 2)) / 2 + ',' + ( height + 7 ) + ')' )
      .call( xAxis );

  svg.append( 'g' )
    .attr( 'class', 'lineChart--yAxisTicks' )
    .attr( 'transform', 'translate(' + margin.right + ',' + 0 + ')' )
    .call( yAxisTicks );

  var last_index = 0;

  var start_datas = {};

  for (var key in dataDict){
    start_datas[key] = dataDict[key].map( function( datum ) {return {date  : datum.date, value : 0 };});
  }

  var i = 0;
  for(var key in dataDict){
      // Add the line path.
      if (dataDict[key].length > 0) {
        svg.append( 'path' )
            .datum( start_datas[key] )
            .attr( 'stroke', COLORS[i])
            .attr( 'stroke-width', 3)
            .attr( 'fill', 'None')
            .attr( 'id', 'line_' + key)
            .attr( 'd', line )
            .transition()
            .duration( DURATION )
            .delay( DURATION / 2 )
            .attrTween( 'd', tween( dataDict[key], line ) );
      }
      i++;
  };

  /*svg.append("linearGradient")
      .attr("id", "lineChart--gradientBackgroundArea")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", 1)
    .selectAll("stop")
      .data([
        {offset: "0%", color: "#CCAC00"},
        {offset: "100%", color: "#DBC44C"}
      ])
    .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });
  */

  // Helper functions!!!

  function tween( b, callback ) {
    return function( a ) {
      var i = d3.interpolateArray( a, b );

      return function( t ) {
        return callback( i ( t ) );
      };
    };
  }

  function twane( callback ) {
    var i = d3.interpolateArray( a, b );
    return function(t) {
      return t;
    };

  };

  function animateOff(){
      var all_paths = svg.selectAll("path");
      all_paths.transition()
               .duration( DURATION/3 )
               .style('opacity', 0)
               .remove();
  };

  function reDrawLines(dataDict){
      var parse = d3.timeParse( '%Y-%m-%d' );
      start_datas = {};

      for (var key in dataDict){
        dataDict[key] = dataDict[key]["stars"].map( function( datum ) {
          datum.date = parse( datum.date );

          return datum;
        } );
      }

      for (var key in dataDict){
        start_datas[key] = dataDict[key].map( function( datum ) {return {date  : datum.date, value : 0 };});
      }

      // add the line path.
      var i = 0;
      for(var key in dataDict){
          // Add the line path.
          if (dataDict[key].length > 0) {
            svg.append( 'path' )
                .datum( start_datas[key] )
                .attr( 'stroke', COLORS[i])
                .attr( 'stroke-width', 3)
                .attr( 'fill', 'None')
                .attr( 'id', 'line_' + key)
                .attr( 'd', line )
                .transition()
                .duration( DURATION )
                .delay( DURATION / 2 )
                .attrTween( 'd', tween( dataDict[key], line ) );
          }
          i++;
      };
      // add the area path.
      /*svg.append( 'path' )
          .datum( start_datas[i] )
          .attr( 'class', 'linechart--area' )
          .attr( 'd', area )
          .transition()
          .duration( duration )
          .attrtween( 'd', tween( data2d[i], line ) );*/
  }

  function fadeAllButOne(key){
    var all_paths = svg.selectAll(sprintf("path:not([id='line_%s'])", key));
    all_paths.transition()
             .duration( DURATION/3 )
             .style('opacity', 0.3)
             .style('stroke-width', 2);
    var the_one = svg.selectAll(sprintf("path[id='line_%s']", key));
    the_one.transition()
           .style('stroke-width', 4);
  }

  function unfadeAll(){
    console.log("HERE2");
    var all_paths = svg.selectAll("path");
    all_paths.transition()
             .duration( 0 )
             .style('opacity', 1)
             .style('stroke-width', 3);
  }

  return {animateOff: animateOff, reDrawLines: reDrawLines, fadeAllButOne: fadeAllButOne, unfadeAll: unfadeAll};
}

export default drawLineChart;
