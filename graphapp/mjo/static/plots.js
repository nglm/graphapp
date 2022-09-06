
import { d3fy, d3fy_dict_of_arrays, d3fy_life_span } from "./preprocess.js";

import {
    dimensions, setAxTitle, setFigTitle, setXLabel, setYLabel,
    draw_mjo_classes, draw_fig, style_ticks, get_list_colors, add_axes,
} from "./figures.js"
import { onMouseClusterAux, onMouseMemberAux } from "./interact.js";

import {range_rescale, sigmoid, linear} from "./utils.js"

    // <!-- simple dot marker definition -->
    // <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
    //     markerWidth="5" markerHeight="5">
    // <circle cx="5" cy="5" r="5" fill="red" />
    // </marker>
    // </defs>

    // <!-- Coordinate axes with a arrowhead in both direction -->
    // <polyline points="10,10 10,90 90,90" fill="none" stroke="black"
    // marker-start="url(#arrow)" marker-end="url(#arrow)"  />

    // <!-- Data line with polymarkers -->
    // <polyline points="15,80 29,50 43,60 57,30 71,40 85,15" fill="none" stroke="grey"
    // marker-start="url(#dot)" marker-mid="url(#dot)"  marker-end="url(#dot)" />

export const PATH_SCRIPT = document.getElementById("main-script").getAttribute("path_script");
const ROOT_DATA = 'data/'
export const PATH_DATA = ROOT_DATA + "data/";
export const PATH_GRAPH = ROOT_DATA + "graphs/";

function get_brotherhood_size(
    d,
    {g=undefined} = {}
) {
    let brotherhood_size;
    // If d is an edge
    try {
        brotherhood_size = g.vertices[d.time_step][d.v_start].info.brotherhood_size;
    // d is a vertex
    } catch {
        brotherhood_size = d.info.brotherhood_size;
    }
    return brotherhood_size;
}

function f_opacity(
    d,
    {g=undefined, vmin=0, selected_k=undefined} = {}
) {

    let opacity = undefined;
    // Binary opacity if plotting only relevant components
    if (selected_k != undefined) {
        // Opacity = 1 if the component is deemed relevant
        let brotherhood_size = get_brotherhood_size(d, {g : g});
        if (brotherhood_size.includes(selected_k[d.time_step]["k"])) {
            opacity = 1;
        // Otherwise the opacity is 0
        } else {
            opacity = 0;
        }

    // Else, opacity based on the life span of the component
    } else {
        let vmax = g.life_span_max;
        let rescaled = range_rescale(d.life_span, {x0:vmin, x1:vmax});
        opacity = sigmoid(rescaled, {range0_1:true})
    }
    return opacity;
}


function f_polygon_edge(d, g, xscale, yscale, iplot) {
    let offset = 0.*xscale(g.time_axis[1]);
    let t = d.time_step;
    let mean_start = d.info_start.mean[iplot];
    let mean_end = d.info_end.mean[iplot];
    let points = offset + xscale(g.time_axis[t])+","+yscale(mean_start - d.info_start.std_inf[iplot])+" ";
    points += offset + xscale(g.time_axis[t])+","+yscale(mean_start + d.info_start.std_sup[iplot])+" ";
    points += -offset + xscale(g.time_axis[t+1])+","+yscale(mean_end + d.info_end.std_sup[iplot])+" ";
    points += -offset + xscale(g.time_axis[t+1])+","+yscale(mean_end - d.info_end.std_inf[iplot])+" ";
    return points;
}

function f_line_edge_detailed(d, g, xscale, yscale, iplot) {
    let t = d.time_step;
    let start_edge = d.info_start.mean[iplot];
    let end_edge = d.info_end.mean[iplot];
    let start_vertex = g.vertices[t][d.v_start].info.mean[iplot];
    let end_vertex = g.vertices[t+1][d.v_end].info.mean[iplot];
    let points = xscale(g.time_axis[t])+","+yscale(start_vertex)+" ";
    points += xscale(g.time_axis[t])+","+yscale(start_edge)+" ";
    points += xscale(g.time_axis[t+1])+","+yscale(end_edge)+" ";
    points += xscale(g.time_axis[t+1])+","+yscale(end_vertex);
    return points;
}

function f_line_edge(d, g, xscale, yscale, iplot) {
    let t = d.time_step;
    let start_vertex = g.vertices[t][d.v_start].info.mean[iplot];
    let end_vertex = g.vertices[t+1][d.v_end].info.mean[iplot];
    let points = xscale(g.time_axis[t])+","+yscale(start_vertex)+" ";
    points += xscale(g.time_axis[t+1])+","+yscale(end_vertex);
    return points;
}

function f_line_edge_mjo(d, g, xscale, yscale) {
    let t = d.time_step;
    let mean_start = g.vertices[t][d.v_start].info.mean;
    let mean_end = g.vertices[t+1][d.v_end].info.mean;
    let points = xscale(mean_start[0])+","+yscale(mean_start[1])+" ";
    points += xscale(mean_end[0])+","+yscale(mean_end[1]);
    return points;
}

function f_line_life_span(d, g, xscale, yscale) {
    let t = d.time_step;
}

function f_polygon_vertex(d, g, xscale, yscale, iplot) {
    let offset = 0.2*xscale(g.time_axis[1]);
    let t = d.time_step;
    let points = ""
    for (let e_num of d.e_to) {
        let e = g.edges[t-1][e_num];
        let mean_start = e.info_end.mean[iplot];
        let mean_end = d.info.mean[iplot];
        points += -offset + xscale(g.time_axis[t])+","+yscale(mean_start + e.info_end.std_sup[iplot])+" ";
        points += -offset + xscale(g.time_axis[t])+","+yscale(mean_start - e.info_end.std_inf[iplot])+" ";
        points += xscale(g.time_axis[t])+","+yscale(mean_end - d.info.std_inf[iplot])+" ";
        points += xscale(g.time_axis[t])+","+yscale(mean_end + d.info.std_sup[iplot])+" ";
    }
    for (let e_num of d.e_from) {
        let e = g.edges[t][e_num];
        let mean_start = d.info.mean[iplot];
        let mean_end = e.info_start.mean[iplot];
        points += offset + xscale(g.time_axis[t])+","+yscale(mean_end + e.info_start.std_sup[iplot])+" ";
        points += offset + xscale(g.time_axis[t])+","+yscale(mean_end - e.info_start.std_inf[iplot])+" ";
        points += xscale(g.time_axis[t])+","+yscale(mean_start - d.info.std_inf[iplot])+" ";
        points += xscale(g.time_axis[t])+","+yscale(mean_start + d.info.std_sup[iplot])+" ";
    }
    return points;
}

function f_color(
    d,
    {colors = get_list_colors(50), g=undefined} = {}
) {
    return colors[get_brotherhood_size(d, {g : g})[0]];
}

function f_radius(d) {
    return (4*d.ratio_members)
}

function f_stroke_width(d) {
    return (4*d.ratio_members)
}

function add_members(
    myPlot, fun_line, members, interactiveGroupElem,
) {

    // This element will (display) render the lines but they won't be
    // interactive
    myPlot.append('g')
        .attr('id', 'members')
        .selectAll('.line')
        .data(members)
        .enter()
        .append("path")                     // path: svg element for lines
        .classed("line", true)              // Style
        .attr("d", (d => fun_line(d)))      // How to compute x and y
        .attr("id", ((d, i) => "m" + i));   // Member's id (for selection)

    // This element won't display anything but will react to the mouse
    // The area is typically larger than their displayed counterpart
    myPlot.append('g')
        .attr('id', 'members-event')
        .selectAll('.line-event')
        .data(members)
        .enter()
        .append("path")
        .classed("line-event", true)
        // Add listeners for mouseover/mouseout event
        .on("mouseover", onMouseOverMember(interactiveGroupElem))
        .on("mouseout", onMouseOutMember(interactiveGroupElem))
        .attr("d", (d => fun_line(d)))
        .attr("id", ((d, i) => "m-event" + i));
}

function add_vertices(
    myPlot, fun_cx, fun_cy, g, vertices, interactiveGroupElem,
    {fun_opacity = f_opacity,
    fun_size = f_radius,
    fun_color = f_color,
    list_colors = get_list_colors(50),
    selected_k = undefined,
    } = {},
) {
    // This element will render (display) the vertices but they won't be
    // interactive
    myPlot.append('g')
        .attr('id', 'vertices')
        .selectAll('.vertex')
        .data(vertices)
        .enter()
        .append("circle")                  // path: svg element for lines
        .classed("vertex", true)           // Style
        .attr("cx", (d => fun_cx(d)))      // Compute x coord
        .attr("cy", (d => fun_cy(d)))      // Compute y coord
        .attr("r", (d => fun_size(d)) )    // Compute radius
        .attr("opacity", (d => fun_opacity(
            d, {g : g, selected_k : selected_k}
        )))
        .attr("fill", (d => fun_color(d, {colors : list_colors})))
        .attr("id", (d => "v" + d.key));

    // This element won't display anything but will react to the mouse
    // The area is typically larger than their displayed counterpart
    myPlot.append('g')
        .attr('id', 'vertices-event')
        .selectAll('.vertex-event')
        .data(vertices)
        .enter()
        .append("circle")
        .classed("vertex-event", true)
        // Add listeners for mouseover/mouseout event
        .on("mouseover", onMouseOverCluster(interactiveGroupElem))
        .on("mouseout", onMouseOutCluster(interactiveGroupElem))
        .attr("cx", (d => fun_cx(d)))
        .attr("cy", (d => fun_cy(d)))
        .attr("r", (d => 2*fun_size(d)) )
        .attr("id", (d => "v-event" + d.key));
}

function add_k_options(
    myPlot, fun_cx, fun_cy, g, life_spans, interactiveGroupElem,
    {fun_opacity = f_opacity,
    fun_size = (d => 5),
    } = {},
) {
    // This element will render (display) the vertices but they won't be
    // interactive
    myPlot.append('g')
        .attr('id', 'k-options')
        .selectAll('.k-option')
        .data(life_spans)
        .enter()
        .append("circle")                  // path: svg element for lines
        .classed("k-option", true)           // Style
        .attr("cx", (d => fun_cx(d)))      // Compute x coord
        .attr("cy", (d => fun_cy(d)))      // Compute y coord
        .attr("r", (d => fun_size(d)) )    // Compute radius
        .attr("opacity", (d => fun_opacity( d, {g : g} )/2))
        .attr("id", (d => "k-opt" + d.k));
}

function add_edges(
    myPlot, fun_edge, g, edges, interactiveGroupElem,
    {fun_opacity = f_opacity,
    fun_size = f_stroke_width,
    fun_color = f_color,
    list_colors = get_list_colors(50),
    selected_k = undefined,
    } = {},
) {

    myPlot.append('g')
        .attr('id', 'edges')
        .selectAll('.edges')
        .data(edges)
        .enter()
        .append("polyline")
        .classed("edge", true)
        .attr("points", (d => fun_edge(d)))
        .attr("marker-start",(d => "url(graph.svg#dot) markerWidth="+f_radius(d)) )
        .attr("opacity", (d => fun_opacity(
            d, {g : g, selected_k : selected_k}
        )))
        .attr("stroke", (d => fun_color(d, {colors : list_colors, g : g})))
        .attr("stroke-width", (d => fun_size(d)))
        .attr("id", (d => "e" + d.key) );
}

// Give filename
// Return json graph (both as .json)
async function load_graph(
    filename
) {
    // For some reasons, when we are in the 'python world', the path
    // becomes "graphapp" + ...
    // But not when we are still in the javascript world...
    return await $.get(
        "generate_graph/",             // URL
        {                              // Additional data
            filename : filename,
            path_data : PATH_DATA,
            path_graph : PATH_GRAPH
        },
        function(data) {       // Callback on success
            // "data" is the value returned by the python function
            return data
        })
        .fail(function(data, status) {
            console.log('Calling generate_graph failed', data, status);
            return data
        })
        .always(function(data, status) {
            return data
        })
}

async function load_data(
    filename
) {
    return await $.get(
        "load_data/",             // URL
        {                              // Additional data
            filename : PATH_DATA + filename,
        },
        function(data) {       // Callback on success
            // "data" is the value returned by the python function
            return data
        })
        .fail(function(data, status) {
            console.log('Calling load_data failed', data, status);
            return data
        })
        .always(function(data) {
            return data
        })
}


export async function draw_meteogram(
    filename,
    {include_k = "blank", kmax = 4, id="fig", dims = dimensions()} = {},
) {
    // Load the data and wait until it is ready
    const data =  await load_data(filename);
    // d3 expects a very specific data format
    let data_xy = d3fy(data);
    // where we will store all our figs
    let figs = [];

    // We create a new fig for each variable
    for(var iplot = 0; iplot < data.var_names.length; iplot++ ) {

        let figElem = draw_fig(dims, id + "_" + iplot);
        let myPlot = d3.select(figElem).select("#plot-group");
        let interactiveGroupElem = document.getElementById(figElem.id + "_input");

        // Add x and y axis element
        let {x, y, xk, yk} = add_axes(
            figElem, data.time, data.members,
            {include_k:include_k, iplot:iplot}
        );

        // Add titles and labels  and style ticks
        setFigTitle(figElem, "");
        setAxTitle(figElem, "");
        setXLabel(figElem, "Time (h)");
        setYLabel(
            figElem, data.long_name[iplot] +" (" + data.units[iplot] + ")"
        );
        style_ticks(figElem);

        let myLine = d3.line()
            .x(d => x(d.t))
            .y(d => y(d[data.var_names[iplot]]));

        add_members(
            myPlot, myLine, data_xy, interactiveGroupElem,
        );

        figs.push(figElem);
    }
    return figs
}



export async function draw_mjo(
    filename,
    {id="fig", dims = dimensions()} = {},
) {

    let figElem = draw_fig(dims, id);
    let myPlot = d3.select(figElem).select("#plot-group");
    let interactiveGroupElem = document.getElementById(figElem.id + "_input");
    let vmax = 5;

    // x y scales and their range <-> domain
    var x = d3.scaleLinear().range([0, dims.plot.width]),
    y = d3.scaleLinear().range([dims.plot.height, 0]);

    x.domain([-vmax, vmax]);
    y.domain([-vmax, vmax]);

    // Load the data and wait until it is ready
    const data =  await load_data(filename);
    let data_xy = d3fy(data);

    // This element will render the xAxis with the xLabel
    myPlot.select('#xaxis')
        .call(d3.axisBottom(x).tickSizeOuter(0));

    myPlot.select('#yaxis')
        .call(d3.axisLeft(y).tickSizeOuter(0));

    // Add titles and labels and style ticks
    setFigTitle(figElem, "");
    setAxTitle(figElem, "");
    setXLabel(figElem, "RMM1");
    setYLabel(figElem, "RMM2");
    style_ticks(figElem);

    let myLine = d3.line()
        .x(d => x(d.rmm1))
        .y(d => y(d.rmm2));

    add_members(
        myPlot, myLine, data_xy, interactiveGroupElem,
    );

    // Add mjo classes lines
    draw_mjo_classes(figElem, x, y, vmax=vmax);
    return figElem
}


export async function draw_entire_graph_meteogram(
    filename,
    {include_k = "yes", kmax = 4, id="fig", dims = dimensions()} = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph(filename);
    const vertices = g.vertices.flat();
    const edges = g.edges.flat();
    const time = g.time_axis;
    const members = g.members;
    const colors = get_list_colors(g.n_clusters_range.length);

    const data =  await load_data(filename);

    // where we will store all our figs
    let figs = [];

    // We create a new fig for each variable
    for(var iplot = 0; iplot < g.d; iplot++ ) {

        let figElem = draw_fig(dims, id + "_" + iplot);
        let interactiveGroupElem = document.getElementById(figElem.id + "_input");
        let myPlot = d3.select(figElem).select("#plot-group");

        // Add x and y axis element
        let {x, y, xk, yk} = add_axes(
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

        let cx = (d => x( g.time_axis[d.time_step] ));
        let cy = (d => y( d.info.mean[iplot] ));

        add_vertices(
            myPlot, cx, cy, g, vertices, interactiveGroupElem,
            {list_colors : colors}
        );

        let fun_edge = (d => f_line_edge(d, g, x, y, iplot));

        add_edges(
            myPlot, fun_edge, g, edges, interactiveGroupElem,
            {list_colors : colors}
        );

        // This element will render the standard deviation of edges
        // myPlot.append('g')
        //     .attr('id', 'edges-std')
        //     .selectAll('.edge-std')
        //     .data(edges)
        //     .enter()
        //     .append("polygon")
        //     .classed("edge-std", true)
        //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
        //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
        //     .attr("points", (d => f_polygon_edge(d, g, x, y, iplot)))
        //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
        //     .attr("fill", (d => f_color(d, g, colors)))
        //     .attr("id", (d => "e-std" + d.key) );

        // // This element will render the standard deviation of vertices
        // myPlot.append('g')
        //     .attr('id', 'vertices-std')
        //     .selectAll('.vertex-std')
        //     .data(vertices)
        //     .enter()
        //     .append("polygon")
        //     .classed("vertex-std", true)
        //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
        //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
        //     .attr("points", (d => f_polygon_vertex(d, g, x, y, iplot)))
        //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
        //     .attr("fill", (d => f_color(d, g, colors)))
        //     .attr("id", (d => "v-std" + d.key) );

        figs.push(figElem);
    }
    return figs
}

async function get_relevant_components(filename, {k = -1} = {}) {
    return $.get(
        "relevant/",                   // URL
        {                              // Additional data
            filename : filename,
            k: k,
            path_graph : PATH_GRAPH
        },
        function(data) {       // Callback function, called on success
            // Function called on success
            // "data" is the value returned by the python function
            // mapped to the "mjo/relevant/" address
            return data
        })
        .fail(function(data, status) {
            console.log('Calling get_relevant_components failed', data, status);
            return data
        })
        .always(function(data) {
            return data
        })
}

export async function draw_relevant_graph_meteogram(
    filename,
    {include_k = "yes", kmax = 4, id="fig", dims = dimensions()} = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph(filename);
    const time = g.time_axis;
    const members = g.members;
    const colors = get_list_colors(g.n_clusters_range.length);
    const data =  await load_data(filename);

    let k_max = d3.min([kmax, g.k_max]);
    const life_spans = d3fy_life_span(g.life_span, {k_max : k_max}).flat();
    let selected_k = d3fy_dict_of_arrays(g.relevant_k);

    console.log("life_spans in draw relevant meteogram", life_spans);

    // where we will store all our figs
    let figs = [];

    // document ready return a promise, se we should wait
    await $(async function () {
        // sending_HTTP_request return a promise, so we should wait
        let relevant_components = await get_relevant_components(filename);

        let vertices = relevant_components.vertices.flat();
        let edges = relevant_components.edges.flat();

        // We create a new fig for each variable
        for(var iplot = 0; iplot < g.d; iplot++ ) {

            let figElem = draw_fig(dims, id + "_" + iplot);
            let interactiveGroupElem = document.getElementById(figElem.id + "_input");
            let myPlot = d3.select(figElem).select("#plot-group");

            // Add x and y axis element
            let {x, y, xk, yk} = add_axes(
                figElem, data.time, data.members,
                {include_k : include_k, kmax : kmax, iplot : iplot}
            );

            // Add titles and labels  and style ticks
            setFigTitle(figElem, " ");
            setAxTitle(figElem, "");
            setXLabel(figElem, "Time (h)");
            setYLabel(
                figElem, data.long_name[iplot] +" (" + data.units[iplot] + ")"
            );
            style_ticks(figElem);


            let yk_offset = myPlot.select('#yaxis-k').attr("yoffset");
            // Add k options using life_spans variable
            let cxk = (d => x( g.time_axis[d.t] ));
            let cyk = (d => (parseFloat(yk_offset) + parseFloat(yk( d.k ))).toString());
            add_k_options(
                myPlot, cxk, cyk, g, life_spans, interactiveGroupElem,
            );

            // Add vertices
            let cx = (d => x( g.time_axis[d.time_step] ));
            let cy = (d => y( d.info.mean[iplot] ));
            add_vertices(
                myPlot, cx, cy, g, vertices, interactiveGroupElem,
                {list_colors : colors, selected_k : selected_k}
            );

            // Add edges
            let fun_edge = (d => f_line_edge(d, g, x, y, iplot));
            add_edges(
                myPlot, fun_edge, g, edges, interactiveGroupElem,
                {list_colors : colors, selected_k : selected_k}
            );

            // This element will render the standard deviation of edges
            // myPlot.append('g')
            //     .attr('id', 'edges-std')
            //     .selectAll('.edge-std')
            //     .data(edges)
            //     .enter()
            //     .append("polygon")
            //     .classed("edge-std", true)
            //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
            //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
            //     .attr("points", (d => f_polygon_edge(d, g, x, y, iplot)))
            //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
            //     .attr("fill", (d => f_color(d, g, colors)))
            //     .attr("id", (d => "e-std" + d.key) );

            // // This element will render the standard deviation of vertices
            // myPlot.append('g')
            //     .attr('id', 'vertices-std')
            //     .selectAll('.vertex-std')
            //     .data(vertices)
            //     .enter()
            //     .append("polygon")
            //     .classed("vertex-std", true)
            //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
            //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
            //     .attr("points", (d => f_polygon_vertex(d, g, x, y, iplot)))
            //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
            //     .attr("fill", (d => f_color(d, g, colors)))
            //     .attr("id", (d => "v-std" + d.key) );

            figs.push(figElem);
        }
        return undefined
    })
    return figs
}


export async function draw_entire_graph_mjo(
    filename,
    {id="fig", dims = dimensions()} = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph(filename);
    const vertices = g.vertices.flat();
    const edges = g.edges.flat();
    const time = g.time_axis;
    const members = g.members;
    const colors = get_list_colors(g.n_clusters_range.length);

    const vmax = 5;

    let figElem = draw_fig(dims, id + "_mjo");
    let interactiveGroupElem = document.getElementById(figElem.id + "_input");
    let myPlot = d3.select(figElem).select("#plot-group");

    // Reminder:
    // - Range: output range that input values to map to
    // - scaleLinear: Continuous domain mapped to continuous output range
    let x = d3.scaleLinear().range([0, dims.plot.width]),
        y = d3.scaleLinear().range([dims.plot.height, 0]);

    // Reminder: domain = min/max values of input data
    x.domain([ -vmax, vmax ]);
    y.domain([ -vmax, vmax ]);

    // This element will render the xAxis with the xLabel
    myPlot.select('#xaxis')
        // Create many sub-groups for the xAxis
        .call(d3.axisBottom(x).tickSizeOuter(0));

    myPlot.select('#yaxis')
        // Create many sub-groups for the yAxis
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d));

    // Add titles and labels  and style ticks
    setFigTitle(figElem, " ");
    setAxTitle(figElem, "");
    setXLabel(figElem, "RMM1");
    setYLabel(figElem, "RMM2");
    style_ticks(figElem);

    let cx = (d => x( d.info.mean[0] ));
    let cy = (d => y( d.info.mean[1] ));

    add_vertices(
        myPlot, cx, cy, g, vertices, interactiveGroupElem,
        {list_colors : colors}
    );

    let fun_edge = (d => f_line_edge_mjo(d, g, x, y));

    add_edges(
        myPlot, fun_edge, g, edges, interactiveGroupElem,
        {list_colors : colors}
    );

    // This element will render the standard deviation of edges
    // myPlot.append('g')
    //     .attr('id', 'edges-std')
    //     .selectAll('.edge-std')
    //     .data(edges)
    //     .enter()
    //     .append("polygon")
    //     .classed("edge-std", true)
    //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
    //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
    //     .attr("points", (d => f_polygon_edge(d, g, x, y, iplot)))
    //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
    //     .attr("fill", (d => f_color(d, g, colors)))
    //     .attr("id", (d => "e-std" + d.key) );

    // // This element will render the standard deviation of vertices
    // myPlot.append('g')
    //     .attr('id', 'vertices-std')
    //     .selectAll('.vertex-std')
    //     .data(vertices)
    //     .enter()
    //     .append("polygon")
    //     .classed("vertex-std", true)
    //     // .on("mouseover", onMouseOverCluster(interactiveGroupElem))
    //     // .on("mouseout", onMouseOutCluster(interactiveGroupElem))
    //     .attr("points", (d => f_polygon_vertex(d, g, x, y, iplot)))
    //     .attr("opacity", (d => f_opacity(d.life_span, g.life_span_max)/3 ))
    //     .attr("fill", (d => f_color(d, g, colors)))
    //     .attr("id", (d => "v-std" + d.key) );


    // Add mjo classes lines
    draw_mjo_classes(figElem, x, y, vmax);

    return figElem
}



export async function life_span_plot(
    filename,
    {id="fig", dims = dimensions()} = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph(filename);
    const life_spans = d3fy_life_span(g.life_span);
    const colors = get_list_colors(g.n_clusters_range.length);

    console.log("life_spans in life span plot", life_spans);

    let figElem = draw_fig(dims, id);
    let myPlot = d3.select(figElem).select("#plot-group");

    let x = d3.scaleLinear().range([0, dims.plot.width]),
        y = d3.scaleLinear().range([dims.plot.height, 0]);

    x.domain([ d3.min(g.time_axis), d3.max(g.time_axis) ] );
    y.domain([0, 1]);

    myPlot.select('#xaxis')
        .call(d3.axisBottom(x).tickSizeOuter(0));

    myPlot.select('#yaxis')
        .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat(d => d));

    // Add titles and labels  and style ticks
    setFigTitle(figElem, " ");
    setAxTitle(figElem, "");
    setXLabel(figElem, "Time (h)");
    setYLabel(figElem, "Life span");
    style_ticks(figElem);

    const myLine = d3.line()
        .x(d => x(g.time_axis[d.t]))
        .y(d => y(d.life_span));

    // This element will render the life span
    myPlot.append('g')
        .attr('id', 'life-spans')
        .selectAll('.life-span')
        .data(life_spans)
        .enter()
        .append("path")
        .classed("life-span", true)
        .attr("d", (d => myLine(d)))
        .attr("stroke", (d => colors[d[0].k]))
        .attr("id", (d => "k" + d[0].k) );

    return figElem
}

//mouseover event handler function using closure
function onMouseOverMember(interactiveGroupElem, e, d) {
    return function (e, d) {
        onMouseMemberAux(e, d, this, interactiveGroupElem, 'lineSelected')
    }
}

//mouseout event handler function using closure
function onMouseOutMember(interactiveGroupElem, e, d) {
    return function (e, d) {
        onMouseMemberAux(e, d, this, interactiveGroupElem, 'line')
    }
}

//mouseover event handler function using closure
function onMouseOverCluster(interactiveGroupElem, e, d) {
    return function (e, d) {
        onMouseClusterAux(
            e, d, this, interactiveGroupElem,
            "vertexSelected", "lineSelectedbyCluster")
    }
}

//mouseout event handler function using closure
function onMouseOutCluster(interactiveGroupElem, e, d) {
    return function (e, d) {
        onMouseClusterAux(
            e, d, this, interactiveGroupElem,
            "vertex", "line")
    }
}