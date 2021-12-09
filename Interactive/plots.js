import { d3fy } from "./preprocess.js";

export function dimensions() {

    let fig, labels, axes, plot;

    fig = {
        width: 800, height: 600,
        margin: {top: 5, left: 5, right: 5, bottom: 5}
    };


    labels = {
        x: 130, y: 110, axes: 50, fig: 50
    };

    axes = {
        width: fig.width - (fig.margin.right + fig.margin.left),
        height: fig.height - (fig.margin.top + fig.margin.bottom + labels.fig),
        margin: {top: 5, left: 5, right: 5, bottom: 5},
    };

    plot = {
        width: axes.width - (axes.margin.right + axes.margin.left + labels.y),
        height: axes.height - (axes.margin.top + axes.margin.bottom + labels.axes + labels.x),
        margin: {top: 5, left: 5, right: 5, bottom: 5},
    };

    return {fig, labels, axes, plot}
}

const DIMS = dimensions();

export function draw_fig(dims = DIMS, fig_id = 'fig') {


    // Append 'svg' DOM element at the end of the document to contain our fig
    d3.select("body")
        .append('svg')
        .attr('id', fig_id)
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height)
        .append('rect')                // And style it
        .attr("id", "background")
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height)
        .classed("fig", true);

    // Create our fig group
    let myFig = d3.select("body")
        .select('#'+fig_id)
        .append('g')
        .attr("id", 'fig-group')
        .attr(
            "transform",
            "translate(" + dims.fig.margin.left +","+ dims.fig.margin.top + ")"
        );

    // Fig title
    myFig.append('text')
        .attr("id", "figtitle")
        // Use '50%' in combination with "text-anchor: middle" to center text
        .attr("x", "50%")  // percentage based on the parent container
        .attr("y", dims.labels.fig/2)
        .classed("figtitle", true);

    // Prepare the remaining part of the fig
    myFig.append('g')
        .attr('id', 'main')
        .attr(
            "transform",
            "translate(" + 0 + "," + dims.labels.fig + ")"
        )
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height - dims.labels.fig);

    // create a new SVG and a group inside our fig to contain axes
    // Note that SVG groups 'g' can not be styled
    let myAxes = myFig.select('#main')
        .append("svg")
        .attr("id", 'axes')
        .attr('width', dims.axes.width)
        .attr('height', dims.axes.height - dims.labels.axes)
        .classed('axes', true)
        .append('g')
        .attr("id", 'axes-group')
        .attr(
            "transform",
            "translate(" + dims.axes.margin.left+","+dims.axes.margin.top + ")"
        );

    // Axes title
    myAxes.append('text')
        .attr("id", "axtitle")
        // Use '50%' in combination with "text-anchor: middle" to center text
        .attr("x", "50%")  // percentage based on the parent container
        .attr("y", dims.labels.axes/2)
        .classed("axtitle", true);

    // Prepare the remaining part of the axes
    myAxes.append('g')
        .attr('id', 'main')
        .attr(
            "transform",
            "translate(" + 0 + "," + dims.labels.axes + ")"
        )
        .attr('width', dims.axes.width)
        .attr('height', dims.axes.height - dims.labels.axes);

    // xlabel
    myAxes.select('#main')
        .append('text')
        .attr('id', 'xlabel')
        .attr("x", dims.labels.y + dims.plot.width/2)
        .attr("y", dims.plot.height + dims.labels.x/2)
        .classed("xlabel", true);

    // ylabel
    myAxes.select('#main')
        .append('text')
        .attr('id', 'ylabel')
        .attr("x", -dims.plot.height/2)
        .attr("y", dims.labels.y/2)
        .classed("ylabel", true);

    // Add an svg element for our plot
    // Add a rect element to the group in order to style chart
    myAxes.select('#main')
        .append('svg')
        .attr("id", 'plot')
        .append('rect')                // And style it
        .attr("id", "background")
        .attr('width', dims.plot.width)
        .attr('height', dims.plot.height)
        .attr(
            "transform",
            "translate(" + dims.labels.y + "," + 0 + ")"
        )
        .classed("plot", true);

    let myPlot = myAxes.select('#main')
        .select('#plot')
        .append('g')
        .attr("id", 'plot-group')
        .attr(
            "transform",
            "translate(" + dims.labels.y + "," + 0 + ")"
        );

    // This element will render the xAxis with the xLabel
    myPlot.append("g")
        .attr("id", "xaxis")
        // This transform moves (0,0) to the bottom left corner of the chart
        .attr("transform", "translate(0," + dims.plot.height + ")");

    // This element will render the yAxis with the yLabel
    myPlot.append("g")
        .attr('id', 'yaxis');

    return {myFig, myAxes, myPlot}
}

export function style_ticks(myPlot) {
    myPlot.select('#yaxis')
        .selectAll('.tick')       // Select all ticks
        .selectAll('text')        // Select the text associated with each tick
        .classed("ytext", true);  // Style the text

    myPlot.select('#xaxis')
        .selectAll(".tick")      // Select all ticks,
        .selectAll("text")       // Select the text associated with each tick
        .classed("xtext", true);  // Style the text

    return myPlot
}

export async function draw_meteogram(
    filename,
    dims = dimensions(),
    fig_id="fig",
) {
    // "async" so that we can call 'await' inside and therefore use the data

    let meteogram = draw_fig(dims, fig_id);

    let myFig = meteogram.myFig;
    let myAxes = meteogram.myAxes;
    let myPlot = meteogram.myPlot;

    // Reminder:
    // - domain: min/max values of input data
    // - Range: output range that input values to map to.
    // - scaleOrdinal from discrete and map to discrete numeric output range.
    // - scaleBand like scaleOrdinal except the output range is continuous and
    // numeric (so from discrete to continuous)
    // - scaleLinear: Continuous domain mapped to continuous output range
    var x = d3.scaleLinear().range([0, dims.plot.width]),
    y = d3.scaleLinear().range([dims.plot.height, 0]);

    // Load the data and wait until it is ready
    const myData =  await d3.json(filename);
    let data_xy = d3fy(myData);

    const ymin = d3.min(myData.members, (d => d3.min(d[0])) ),
        ymax = d3.max(myData.members, (d => d3.max(d[0])) );

    // Now we can specify the domain of our scales
    x.domain([ d3.min(myData.time, (d => d)), d3.max(myData.time, (d => d)) ]);
    y.domain([ymin, ymax]);

    // Add the title of the figure
    myFig.select('#figtitle')
        .text("Figure");

    // Add the title of the axes
    myAxes.select('#axtitle')
        .text(myData.filename);

    // This element will render the xAxis with the xLabel
    myPlot.select('#xaxis')
        // The next line will create many sub-groups for the xAxis
        //
        // D3’s "call(myF)" takes a selection as input and hands that
        // selection off to any function myF.
        // So selection.call(myF) is equiv to myF(selection)
        //
        // d3.axisBottom(scale) constructs a x-axis generator for the given
        // scale, with empty tick arguments, a tick size of 6 and padding of 3.
        // In this orientation, ticks are drawn below the line.
        // Note that this generator has to be called (using .call) by a
        // svg element in order to render the axis onto the HTML page
        .call(d3.axisBottom(x).tickSizeOuter(0));

    myAxes.select('#main')
        .select('#xlabel')
        .text("Time (h)");

    myPlot.select('#yaxis')
        // The next line will create many sub-groups for the yAxis
        // We can specify the tickFormat with '.tickFormat()'. Otherwise
        // raw range values are written (see xAxis above)
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d).ticks(10));

    myPlot = style_ticks(myPlot);

    myAxes.select('#main')
        .select("#ylabel")
        .text(myData.long_names +" (" + myData.units + ")");

    const myLine = d3.line()
        .x(d => x(d.t))
        .y(d => y(d.m));

    // This element will render the lines
    myPlot.append('g')
        .selectAll('.line')
        .data(data_xy)
        .enter()
        .append("path")  // "path" is the svg element for lines
        .classed("line", true)
        // .on("mouseover", onMouseOver) //Add listener for the mouseover event
        // .on("mouseout", onMouseOut)   //Add listener for the mouseout event
        .attr("d", (d => myLine(d)));
        // .attr("width", x.bandwidth())
        // .transition()
        // .ease(d3.easeLinear)
        // .duration(400)
        // .delay((d, i) => (i * 50))
        // .attr("height", d => (myHeight - y(d.value)));

    return {myFig, myAxes, myPlot}
}


//mouseover event handler function
function onMouseOver(e, d) {

    // The selection.transition method now takes an optional transition
    // instance which can be used to synchronize a new transition with an
    // existing transition
    //
    // In this callback function we will use this optional parameter
    // and in the next callback we will chain all the functions.
    //
    // .ease() control apparent motion in animation
    // .ease(d3.easeLinear) is actually the default configuration so
    // we could have omitted it (we will in the next callback function)
    const tr = d3.transition().duration(400).ease(d3.easeLinear);

    // Change the attributes of the DOM element ('this') associated with
    // the event fired
    // Note that the style itself has already been configured in
    // the css subclass '.bar:hover'
    // We could have changed to a completely different class also
    d3.select(this).transition(tr)
        .attr("width", (x.bandwidth() + 5))
        .attr("height", d => (myHeight - y(d.value) + 10))
        .attr("y", d => (y(d.value) - 10) );

    // Show the value corresponding to this bar
    myAxes.append("text")
        .attr('class', 'val')
        .attr('x', () => x(d.year))
        .attr('y', () => (y(d.value) - 15))
        .text(() => ('$' +d.value) );
}

//mouseout event handler function
function onMouseOut(e, d) {

    // Note that the style itself has already been configured in
    // the css subclass '.bar:hover'
    d3.select(this)
        .transition()   // initiate a transition
        .duration(400)  // specifies the duration of the transition
        .attr('width', x.bandwidth())
        .attr("y", d => y(d.value))
        .attr("height", d => (axes.height - y(d.value)));

    // removes the text value we had added during the bar selection
    d3.selectAll('.val')
        .remove()
}
