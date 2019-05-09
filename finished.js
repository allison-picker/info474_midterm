'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 800)
      .attr('height', 800);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data.csv")
      .then((data) => makePlot(data));
    
  }

  // make scatter plot with trend line
  function makePlot(csvData) {
    data = csvData // assign data as global variable
    
    // get arrays of fertility rate data and life Expectancy data
    let avg_viewer= data.map((row) => parseFloat(row["Avg. Viewers (mil)"]));
    let season_year = data.map((row) => parseFloat(row["Year"]));
    let typeOfAvg = data["Data"];
   
    
    
    // find data limits
    let axesLimits = findMinMax(season_year,avg_viewer);


    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Avg. Viewers (mil)", "Year", season_year);
    //console.log(mapFunctions);
    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
    makeAvgLine(avg_viewer, mapFunctions);
    makeLegend();
  }

  function makeAvgLine(values, map){
    let average = calcAverage(values);
    let yMap = map.y;
 
    svgContainer.append("g")
    .attr("transform", "translate(0, "+yMap(average)+")")
    .append("line")
    .attr("x1", 50)
    .attr("x2", 800)
    .style("stroke", "#2ecc71")
    .style("stroke-width", "3px");
    svgContainer.append("text")
    .attr("x", 600)
    .attr("y", yMap(average) - 7)
    .style('font-size', '14pt')
    .text("13.5 Average Viewers")


  }

  // make title and axes labels
  function makeLabels() {
   

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 750)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 400)rotate(-90)')
      .style('font-size', '10pt')
      .text('Average Viewers in Millions');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    
    
    //get years for drop down

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
   
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

   
   
    let rect = svgContainer.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .style("fill", function(d) { if(d["Data"] == "Actual" ) {
                                     return "steelblue";
                                  }else {
                                    return "gray";
                                  }})
    .attr("x", function(d) { return xMap(d["Year"]) + 5; })
    .attr("width", 20)
    .attr("y", function(d) { return yMap(d["Avg. Viewers (mil)"]); })
    .attr("height", function(d) { return 650 - yMap(d["Avg. Viewers (mil)"]); })
    .attr("data-legend",function(d) { return d["Data"]})
    .on("mouseover", (d) => {
      div.transition()
        .duration(700)
        .style("opacity", 1);
      div.html("Season " + d["Season"] + "<br/>"  + "Most Watched Episode: " + d["Most watched episode"])
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY) + "px");
    })
    .on("mouseout", (d) => {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });

    let barLabel = svgContainer.selectAll(".text")
          .data(data)
          .enter()
          .append("text")
          .attr('x', function(d) { return xMap(d["Year"]) + 3; })
          .attr('y', function(d) { return yMap(d["Avg. Viewers (mil)"]) -10; })
          .style('font-size', '8pt')
          .text(function(d) { return d["Avg. Viewers (mil)"]});
          
          
    
  




        
  }

  function makeLegend() {
    let data = ["Actual", "Estimate"];
    let legendSize = 20;
    let legendSpace = 5;
    var legend = svgContainer.selectAll('.legend')                     // NEW
          .data(data)                                   // NEW
          .enter()                                                // NEW
          .append('g')                                            // NEW
          .attr('class', 'legend')                                // NEW
          .attr('transform', 'translate(700,20)');        // NEW
                                                               // NEW

        legend.append('rect')                                     // NEW
          .attr('width', legendSize)                          // NEW
          .attr('height', legendSize) 
          .attr("y", function(d) { if(d == "Actual" ) {
                                    return 2;
                                  }else {
                                      return 27;}} )                       // NEW
          .style('fill', function(d) { if(d == "Actual" ) {
                                              return "steelblue";
                                      }else {
                                              return "gray";}} );                                                         // NEW
          
        legend.append('text')                                     // NEW
          .attr('x', legendSize + legendSpace)              // NEW
          .attr('y', function(d) { if(d == "Actual" ) {
            return 4;
          }else {
              return 31;}} )               // NEW
          .text(function(d) { console.log(d); return d; });                       // NEW

  }

  function calcAverage(values) {
    let total = values.reduce((acc, c) => acc + c, 0);
    return total/values.length;
  }
  // draw the axes and ticks
  function drawAxes(limits, x, y, csvData) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }
 
    // function to scale x value
    let xScale = d3.scaleLinear()
    .domain([limits.xMin, limits.xMax]) // give domain buffer
    .range([50, 750]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(d); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale).ticks(25);
    svgContainer.append("g")
      .attr('transform', 'translate(15, 650)')
      .call(xAxis)
      .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 650]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(d); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }
  function getFilters(data){
      let years = data.map((row) => parseFloat(row["time"]));
      years = [... new Set(years)];
      return years;
  }
  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
