var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

  //   .domain([0, d3.max(censusData, d => d.healthcare)])
  //   .range([height, 0]);


// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    // .domain([d3.min(censusData, d => d[chosenYAxis]) * 1.2,
    //   d3.max(censusData, d => d[chosenYAxis]) * 0.8
    // ])
    // .range([height, 0]);
    .domain([0, d3.max(censusData, d => d[chosenYAxis])])
    .range([height, 0]);
  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
// function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText) {

  var labelX;

  if (chosenXAxis === "poverty") {
    labelX = "In Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    labelX = "Age (Median):";
  }
  else {
    labelX = "Household Income (Median):";
  }

  var labelY;

  if (chosenYAxis === "healthcare") {
    labelY = "Lacks Healthcare (%):";
  }
  else if (chosenYAxis === "obesity") {
    labelY = "Obesity (%):";
  }
  else {
    labelY = "Smokes (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  // circleText.call(tooltip)

  // circleText.on("mouseover", function(data) {
  //   toolTip.show(data);
  // })
  //   // onmouseout event
  //   .on("mouseout", function(data, index) {
  //     toolTip.hide(data);
  //   });

  return circlesGroup;
  // return circleText;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;
  // console.log(censusData)
  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
  // console.log(censusData)
  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(censusData, d => d.healthcare)])
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .attr("transform", `translate(0, ${height}*0.5)`)
  .call(leftAxis);

  // chartGroup.append("g")
  //   .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "LightBlueSky")
    .attr("opacity", ".5");

  // // add text inside circles
  // // =======================
  // var circleText = chartGroup.selectAll(null)
  //   .data(censusData).enter().append("text")
  //   .attr("x", d => xLinearScale(d[chosenXAxis]))
  //   .attr("y", d => yLinearScale(d[chosenYAxis]))
  //   .text(function(d) {
  //     return d.abbr;
  //   })
  //   .attr("font-family", "sans-serif")
  //   .attr("font-size", "10px")
  //   .attr("text-anchor", "middle")
  //   .attr("dominant-baseline", "middle")
  //   .attr("fill", "white");

  // Create group for three x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
    
  // Create group for three y-axis labels
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = labelsGroupY.append("text")
    .attr("y", -80)
    // .attr("x", 0 - (height / 2))
    .attr("x", -160)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("x", -160)
    .attr("y", -60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%)");

  var smokesLabel = labelsGroupY.append("text")
    .attr("x", -160)
    .attr("y", -40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)"); 
  
  // // append y axis
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
    // .attr("y", 0 - margin.left)
    // .attr("x", 0 - (height / 2))
  //   .attr("dy", "1em")
  //   .classed("axis-text", true)
  //   .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // // add text inside circles
        // // =======================
        // var circleText = chartGroup.selectAll(null)
        // .data(censusData).enter().append("text")
        // .attr("x", d => xLinearScale(d[chosenXAxis]))
        // .attr("y", d => yLinearScale(d[chosenYAxis]))
        // .text(function(d) {
        // return d.abbr;
        // })
        // .attr("font-family", "sans-serif")
        // .attr("font-size", "10px")
        // .attr("text-anchor", "middle")
        // .attr("dominant-baseline", "middle")
        // .attr("fill", "white");

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  labelsGroupY.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderAxesY(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
        .classed("active", true)
        .classed("inactive", false);
      }
    }
  });

}).catch(function(error) {
  console.log(error);
});


