export const COLOR_BREWER = [
    "#636363", // Grey
    "#377eb8", // Blue
    "#a65628", // Brown
    "#984ea3", // Purple
    "#e41a1c", // Red
    "#4daf4a", // Green
    "#ff7f00", // Orange
    "#f781bf", // Pink
    "#ffff33", // Yellow
];

export function get_list_colors(N){
    let i = 0;
    let colors = [];
    while (i < N) {
        for (var j = 0; j < COLOR_BREWER.length; j++ ){
            colors.push(COLOR_BREWER[j]);
            i++;
        }
    }
    return colors
}

export function dimensions({
    figWidth=1200,
    figHeight=600,
    figMarginTop=5,
    figMarginLeft=5,
    figMarginRight=5,
    figMarginBottom=5,
    labelsX=70,
    labelsY=80,
    labelsAxes=50,
    labelsFig=0,
    axesMarginTop=5,
    axesMarginLeft=5,
    axesMarginRight=5,
    axesMarginBottom=5,
    plotWidth=undefined,
    plotHeight=undefined,
    plotMarginTop=5,
    plotMarginLeft=5,
    plotMarginRight=5,
    plotMarginBottom=5,
} = {}) {

    let fig, labels, axes, plot;
    labels = { x: labelsX, y: labelsY, axes: labelsAxes, fig: labelsFig };

    // Compute dimensions based on fig size
    if (plotWidth === undefined) {
        fig = {
            width: figWidth, height: figHeight,
            margin: {
                top: figMarginTop, left: figMarginLeft,
                right: figMarginRight, bottom: figMarginBottom
            }
        };

        axes = {
            width: fig.width - (fig.margin.right + fig.margin.left),
            height: fig.height - (fig.margin.top + fig.margin.bottom + labels.fig),
            margin: {
                top: axesMarginTop, left: axesMarginLeft,
                right: axesMarginRight, bottom: axesMarginBottom
            },
        };

        plot = {
            width: axes.width - (axes.margin.right + axes.margin.left + labels.y),
            height: axes.height - (axes.margin.top + axes.margin.bottom + labels.axes + labels.x),
            margin: {
                top: plotMarginTop, left: plotMarginLeft,
                right: plotMarginRight, bottom: plotMarginBottom
            },
        };
    }
    // Compute dimensions based on plot size
    else {

        plot = {
            width: plotWidth,
            height: plotHeight,
            margin: {
                top: plotMarginTop, left: plotMarginLeft,
                right: plotMarginRight, bottom: plotMarginBottom
            },
        };

        axes = {
            width: plot.width + (plot.margin.right + plot.margin.left + labels.y),
            height: plot.height + (plot.margin.top + plot.margin.bottom + labels.x + labels.axes),
            margin: {
                top: axesMarginTop, left: axesMarginLeft,
                right: axesMarginRight, bottom: axesMarginBottom
            },
        };

        fig = {
            width: axes.width + (axes.margin.right + axes.margin.left),
            height: axes.height + (axes.margin.top + axes.margin.bottom + labels.fig),
            margin: {
                top: figMarginTop, left: figMarginLeft,
                right: figMarginRight, bottom: figMarginBottom
            }
        };
    }
    return {fig, labels, axes, plot}
}

// Some standards fig dimensions

// Compute fig dimensions
const plotHeightMeteogram = 400;
const plotWidthMeteogram = 600;
const plotWidthMJO = 600;

export const DIMS = dimensions();
export const DIMS_meteogram = dimensions(
    {plotWidth : plotWidthMeteogram, plotHeight : plotHeightMeteogram}
    );
export const DIMS_meteogram_with_k = dimensions(
    {plotWidth : plotWidthMeteogram, plotHeight : plotHeightMeteogram *1.3}
    );
export const DIMS_mjo = dimensions(
    {plotWidth : plotWidthMJO, plotHeight : plotWidthMJO}
    );

export function setInnerHTMLById(elem, id, text) {
    let e = document.getElementById(elem.id+"_svg")
    e.getElementById(id).innerHTML = text;
}

export function setFigTitle(figElem, text) {
    setInnerHTMLById(figElem, "figtitle", text);
}

export function setAxTitle(figElem, text) {
    setInnerHTMLById(figElem, "axtitle", text);
}
export function setXLabel(figElem, text) {
    setInnerHTMLById(figElem, "xlabel", text);
}

export function setYLabel(figElem, text) {
    setInnerHTMLById(figElem, "ylabel", text);
}



export function init_fig(
    {
        dims=DIMS, fig_id="fig", filename=undefined,
        data_type = undefined, plot_type = undefined, parent=undefined}
) {
    // Append 'div'>'svg'>'rect' elements at the end of 'body' to contain our fig
    if (parent === undefined) {
        parent = "body";
    }

    // if (fig_id === undefined) {
    //     fig_id = data_type + "_" + plot_type
    // }
    d3.select(parent)
        .append('div')
        .attr('id', fig_id)
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height)
        .attr('filename', filename)
        .attr('data_type', data_type)
        .attr('plot_type', plot_type)
        .classed('container-fig', true)
        .append('svg')
        .attr('id', fig_id + "_svg")
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height)
        .append('rect')                // And style it
        .attr("id", "background")
        .attr('width', dims.fig.width)
        .attr('height', dims.fig.height)
        .classed("fig", true);

    let figElem = document.getElementById(fig_id);


    // Button for the interactivegroup
    d3.select(figElem)
        .append('input')
        .attr('id', fig_id + "_input")
        .attr('type', 'number')
        .attr('value', 1)
        .attr("min", 1)
        .attr("max", 9)
        .classed("input-interactive-group", true)

    // Create our fig group
    let fig_group_width = dims.fig.width - dims.fig.margin.left - dims.fig.margin.right;
    let fig_group_height = dims.fig.height - dims.fig.margin.top - dims.fig.margin.bottom;
    let myFig = d3.select(figElem)
        .select('svg')
        .append('g')
        .attr("id", 'fig-group')
        .attr(
            "transform",
            "translate(" + dims.fig.margin.left +","+ dims.fig.margin.top + ")"
        )
        .attr('width', fig_group_width)
        .attr('height', fig_group_height);


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
        .attr('width', fig_group_width)
        .attr('height', fig_group_height - dims.labels.fig);

    // create a new SVG and a group inside our fig to contain axes
    // Note that SVG groups 'g' can not be styled
    let axes_group_width = dims.axes.width - dims.axes.margin.left - dims.axes.margin.right;
    let axes_group_height = dims.axes.height - dims.axes.margin.top -  dims.axes.margin.bottom;
    let myAxes = myFig.select('#main')
        .append("svg")
        .attr("id", 'axes')
        .attr('width', dims.axes.width)
        .attr('height', dims.axes.height)
        .classed('axes', true)
        .append('g')
        .attr("id", 'axes-group')
        .attr(
            "transform",
            "translate(" + dims.axes.margin.left+","+dims.axes.margin.top + ")"
        )
        .attr('width', axes_group_width)
        .attr('height', axes_group_height);

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
        .attr('width', axes_group_width)
        .attr('height', axes_group_height - dims.labels.axes);

    // xlabel
    myAxes.select('#main')
        .append('text')
        .attr('id', 'xlabel')
        .attr("x", dims.labels.y + dims.plot.width/2)
        .attr("y", dims.plot.height + 0.80*dims.labels.x )
        .classed("xlabel", true);

    // ylabel
    myAxes.select('#main')
        .append('text')
        .attr('id', 'ylabel')
        .attr("x", -dims.plot.height/2)
        .attr("y", 0.3*dims.labels.y)
        .classed("ylabel", true);

    // Add an svg element for our plot
    // Add a rect element to the group in order to style chart
    myAxes.select('#main')
        .append('svg')
        .attr("id", 'plot')
        .attr('width', axes_group_width)
        .attr('height', axes_group_height - dims.labels.axes)
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

    return figElem
}

export function style_ticks(figElem) {

    d3.select(figElem)
        .select("#yaxis")
        .selectAll('.tick')       // Select all ticks
        .selectAll('text')        // Select the text associated with each tick
        .classed("ytext", true);  // Style the text

    d3.select(figElem)
        .select("#xaxis")
        .selectAll(".tick")       // Select all ticks,
        .selectAll("text")        // Select the text associated with each tick
        .classed("xtext", true);  // Style the text
}

export function draw_mjo_classes(figElem, x, y, vmax=5) {

    // Draw classes and weak section
    const mjoClassLine = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    let limit = Math.cos(Math.PI/4);

    const mjoClassCoord = [
        // bottom left - top right
        [ { x: -vmax, y: -vmax}, { x: -limit, y: -limit} ],
        [ { x: limit, y: limit}, { x: vmax, y: vmax} ],
        // vertical
        [ { x: 0, y: -vmax}, { x: 0, y: -1} ],
        [ { x: 0, y: 1}, { x: 0, y: vmax} ],
        // horizontal
        [ { x: -vmax, y: 0}, { x: -1, y: 0} ],
        [ { x: 1, y: 0}, { x: vmax, y: 0} ],
        // top left - bottom right
        [ { x: -vmax, y: vmax}, { x: -limit, y: limit} ],
        [ { x: limit, y: -limit}, { x: vmax, y: -vmax} ]
    ];

    let myPlot = d3.select(figElem).select("#plot-group");

    // Put all lines in one group
    myPlot.append('g')
        .attr('id', 'mjoClasses');

    myPlot.select('#mjoClasses')
        .selectAll('.mjoClass')
        .data(mjoClassCoord)
        .enter()
        .append("path")  // "path" is the svg element for lines
        .classed("mjoClass", true)
        .attr("d",  (d => mjoClassLine(d)));

    myPlot.select('#mjoClasses')
        .append("circle")
        .attr("cx", x(0))
        .attr("cy", y(0))
        .attr("r", (x(1)-x(0)))
        .classed("mjoClass", true)
}


export function add_axes_mjo(
    figElem,
) {
    let myPlot = d3.select(figElem).select("#plot-group");
    let xk, yk;

    const plotWidth = d3.select(figElem)
        .select("#plot")
        .select("#background")
        .attr("width");

    const plotHeight = d3.select(figElem)
        .select("#plot")
        .select("#background")
        .attr("height");

    const vmax = 5;

    // Reminder:
    // - Range: output range that input values to map to
    // - scaleLinear: Continuous domain mapped to continuous output range
    let x = d3.scaleLinear().range([0, plotWidth]),
        y = d3.scaleLinear().range([plotHeight, 0]);

    // Reminder: domain = min/max values of input data
    x.domain([ -vmax, vmax ]);
    y.domain([ -vmax, vmax ]);

    // This element will render the xAxis with the xLabel
    myPlot.select('#xaxis')
        // add d3 scalers properties as attributes
        .attr("data-range", [0, plotWidth])
        .attr("data-domain", [ -vmax, vmax ])
        .attr("data-scaler", 'linear')
        // Create many sub-groups for the xAxis
        .call(d3.axisBottom(x).tickSizeOuter(0));

    myPlot.select('#yaxis')
        // add d3 scalers properties as attributes
        .attr("data-range", [plotHeight, 0])
        .attr("data-domain", [ -vmax, vmax ])
        .attr("data-scaler", 'linear')
        // Create many sub-groups for the yAxis
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d));

    return {x, y, xk, yk}
}


export function add_axes_meteogram(
    figElem, xvalues, yvalues,
    {include_k=true, kmax=4, iplot=0, portion=0.25} = {}
) {
    let myPlot = d3.select(figElem).select("#plot-group");

    const plotWidth = d3.select(figElem)
        .select("#plot")
        .select("#background")
        .attr("width");

    const plotHeight = d3.select(figElem)
        .select("#plot")
        .select("#background")
        .attr("height");

    // Find extremum to set axes limits
    const ymin = d3.min(yvalues, (d => d3.min(d[iplot])) ),
        ymax = d3.max(yvalues, (d => d3.max(d[iplot])) );

    // Default value if not include_k
    let yMinDomain = ymin;
    const plotHeightK = plotHeight * portion;

    const date_min = d3.min(xvalues),
        date_max = d3.max(xvalues);

    // Reminder:
    // - Range: output range that input values to map to
    // - scaleLinear: Continuous domain mapped to continuous output range
    let x = d3.scaleLinear().range([0, plotWidth]),
        y = d3.scaleLinear().range([plotHeight, 0]);

    let xk, yk;

    if (include_k === "yes") {
        // Additional scales for relevant k
        yk = d3.scaleLinear().range([plotHeightK, 0]);
        xk = d3.scaleLinear().range([0, plotWidth]);

        // Reminder: domain = min/max values of input data
        xk.domain([ date_min, date_max ] );
        yk.domain([0.5, kmax]);
    }

    if (include_k != "no") {
        // Extra space if include_k = "yes" or "blank"
        yMinDomain = ymin-Math.abs(ymax-ymin) * portion;
    }

    // Reminder: domain = min/max values of input data
    x.domain([ date_min, date_max ] );
    y.domain([yMinDomain, ymax]);

    myPlot.select('#xaxis')
        // add d3 scalers properties as attributes
        .attr("data-range", [0, plotWidth])
        .attr("data-domain", [ date_min, date_max ])
        .attr("data-scaler", 'linear')
        // Create many sub-groups for the xAxis
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .attr("plotWidth", plotWidth);

    myPlot.select('#yaxis')
        // add d3 scalers properties as attributes
        .attr("data-range", [plotHeight, 0])
        .attr("data-domain", [yMinDomain, ymax])
        .attr("data-scaler", 'linear')
        // Create many sub-groups for the yAxis
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d))
        .attr("plotHeight", plotHeight);

    if (include_k === "yes") {
        myPlot.append("g")
            .attr('id', 'xaxis-k')
            // add d3 scalers properties as attributes
            .attr("data-range", [0, plotWidth])
            .attr("data-domain", [ date_min, date_max ])
            .attr("data-scaler", 'linear')
            .attr("transform", "translate(0, " + plotHeight + ")");

        myPlot.select('#xaxis-k')
            .call(d3.axisBottom(xk).tickValues([]));

        myPlot.append("g")
            .attr('id', 'yaxis-k')
            // add d3 scalers properties as attributes
            .attr("data-range", [plotHeightK, 0])
            .attr("data-domain", [0.5, kmax])
            .attr("data-scaler", 'linear')
            .attr(
                "transform",
                "translate("+(plotWidth - 12)+ ", "+ (plotHeight-plotHeightK) +")")
            .attr("plotHeight", plotHeightK)
            .attr("yoffset", plotHeight-plotHeightK);

        myPlot.select('#yaxis-k')
            .call(d3.axisLeft(yk)
                //.ticks(kmax)
                .tickValues(d3.range(kmax, 0, -1))
                .tickFormat(d3.format("d")));
    }

    return {x, y, xk, yk}
}

export function get_scalers(
    figElem,
) {
    let axis, range, domain;
    let x, y, xk, yk;

    axis = figElem.querySelector("#xaxis");
    range = axis.dataset.range.split(",").map(Number);
    domain = axis.dataset.domain.split(",").map(Number);
    x = d3.scaleLinear().range(range).domain(domain);

    axis = figElem.querySelector("#yaxis");
    range = axis.dataset.range.split(",").map(Number);
    domain = axis.dataset.domain.split(",").map(Number);
    y = d3.scaleLinear().range(range).domain(domain);

    axis = figElem.querySelector("#xaxis-k");
    if (axis != null) {
        range = axis.dataset.range.split(",").map(Number);
        domain = axis.dataset.domain.split(",").map(Number);
        xk = d3.scaleLinear().range(range).domain(domain);
    }

    axis = figElem.querySelector("#yaxis-k");
    if (axis != null) {
        range = axis.dataset.range.split(",").map(Number);
        domain = axis.dataset.domain.split(",").map(Number);
        yk = d3.scaleLinear().range(range).domain(domain);
    }

    return {x, y, xk, yk}
}

export function fig_mjo(
    {
        id = undefined, dims = DIMS_mjo, filename = undefined,
        data_type = undefined, parent = undefined} = {},
) {

    let figElem = document.getElementById(id);
    // if id already exists, return figElem
    if (figElem != null) {
        return figElem
    // otherwise:
    // - init fig
    // - draw axes
    // - draw mjo classes
    // - set titles and axes labels
    } else {

        let plot_type = "mjo";
        if (id === undefined) {
            id = data_type + "_" + plot_type
        }

        figElem = init_fig(
            {
                dims : dims, fig_id : id, filename : filename,
                data_type : data_type, plot_type : plot_type, parent : parent,
            });

        // Add x and y axis element
        let {x, y, xk, yk} = add_axes_mjo(figElem);

        // Add titles and labels and style ticks
        setFigTitle(figElem, "");
        setAxTitle(figElem, "");
        setXLabel(figElem, "RMM1");
        setYLabel(figElem, "RMM2");
        style_ticks(figElem);

        // Add mjo classes lines
        draw_mjo_classes(figElem, x, y);
        return figElem
    }
}

export function fig_meteogram(
    data,
    {
        id = undefined, dims = DIMS_meteogram_with_k, include_k = "yes",
        kmax = 4, filename = undefined, data_type = undefined,
        parent = undefined,
    } = {},
) {
    let figElem = document.getElementById(id + "_0");
    let figs = [];
    let axes = [];
    let d = data.var_names.length;

    // if id + "_" + 0 already exists, return a list of d figElem with axes
    if (figElem != null) {
        for(var iplot = 0; iplot < d; iplot++ ) {
            figElem = document.getElementById(id + "_" + iplot);
            figs.push(figElem);
        }

    } else {
    // otherwise:
    // - for each variable
    // -- init fig
    // -- draw axes
    // -- draw mjo classes
    // -- set titles and axes labels

        let plot_type = "meteogram"
        if (id === undefined) {
            id = data_type + "_" + plot_type
        }

        for(var iplot = 0; iplot < d; iplot++ ) {

            figElem = init_fig({
                dims : dims, fig_id : id + "_" + iplot, filename : filename,
                data_type : data_type, plot_type : plot_type,
                parent : parent,
            });

            // Add x and y axis element
            let {x, y, xk, yk} = add_axes_meteogram(
                figElem, data.time, data.members,
                {include_k : include_k, iplot : iplot}
            );

            // Add titles and labels  and style ticks
            setFigTitle(figElem, " ");
            setAxTitle(figElem, "");
            setXLabel(figElem, "Time (h)");
            setYLabel(
                figElem, data.long_name[iplot] +" (" + data.units[iplot] + ")"
            );
            style_ticks(figElem);

            figs.push(figElem);
        }
    }
    return figs
}
