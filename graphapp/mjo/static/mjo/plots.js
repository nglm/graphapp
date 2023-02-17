
import { d3fy, d3fy_dict_of_arrays, d3fy_life_span } from "./preprocess.js";

import {
    dimensions, setAxTitle, setFigTitle, setXLabel, setYLabel,
    init_fig, style_ticks, get_list_colors, fig_meteogram, fig_mjo, get_scalers,
    DIMS_mjo, set_fig_attrs
} from "./figures.js"
import { onEventClusterAux, onEventMemberAux, updateSliderValue} from "./interact.js";

import {range_rescale, sigmoid, linear} from "./utils.js"

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
    if (selected_k) {
        // Opacity = 1 if the component is deemed relevant
        opacity = 1;
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
    figElem, fun_line, members,
) {
    let myPlot = d3.select(figElem).select("#plot-group");

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
        .on("mouseover", onMouseOverMember(figElem))
        .on("mouseout", onMouseOutMember(figElem))
        .on("click", onClickMember(figElem))
        .attr("d", (d => fun_line(d)))
        .attr("id", ((d, i) => "m-event" + i));
}

function add_vertices(
    figElem, fun_cx, fun_cy, g, vertices,
    {fun_opacity = f_opacity,
    fun_size = f_radius,
    fun_color = f_color,
    list_colors = get_list_colors(50),
    selected_k = false,
    } = {},
) {
    let myPlot = d3.select(figElem).select("#plot-group");

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
        .on("mouseover", onMouseOverCluster(figElem))
        .on("mouseout", onMouseOutCluster(figElem))
        .on("click", onClickCluster(figElem))
        .attr("cx", (d => fun_cx(d)))
        .attr("cy", (d => fun_cy(d)))
        .attr("r", (d => 4*fun_size(d)) )
        .attr("id", (d => "v-event" + d.key));

    if (figElem.getAttribute("plot_type") === "mjo") {

        draw_time_markers_vertices(
            figElem, fun_cx, fun_cy, g, vertices,
            {fun_opacity : fun_opacity, selected_k : selected_k}
        );
    }
}

function draw_time_markers_members( figElem, members, ) {
    // Find vertices before and after 1st 1/3 of time. Same with 2nd third
    // We draw the marker on the edge between the 2 vertices NOOOOO
    // This is a mess to use edges for the graphs, it would be possible just for
    // the spaghetti plots
    // get d3 scalers
    let {x, y, xk, yk} = get_scalers(figElem);
    let T = members[0].length;
    let steps = [Math.floor(1*T/4), Math.floor(2*T/4), Math.floor(3*T/4)];
    // let steps = [2, 30];
    console.log(T, steps);

    let cx = (d => x( d.rmm1 ));
    let cy = (d => y( d.rmm2 ));

    let rx = (d => 0.5);
    let ry = (d => 4);
    let f_opac = (d => 1);
    let colors = ["cyan", "blue", "purple"]

    for (let i = 0; i < steps.length; i++) {
        let markers = [];

        members.forEach((m) => { markers.push(m[steps[i]]) });

        add_time_marker(
            figElem, cx, cy, markers,
            {
                g : undefined, fun_opacity : f_opac, fun_ry : ry, fun_rx : rx,
                color : colors[i]
            }
        );
    }
}

function draw_time_markers_vertices(
    figElem, fun_cx, fun_cy, g, vertices,
    {fun_opacity = f_opacity,
    selected_k = false,
    } = {},
) {
    // Find vertices before and after 1st 1/3 of time. Same with 2nd third
    // We draw the marker on the edge between the 2 vertices NOOOOO
    // This is a mess to use edges for the graphs, it would be possible just for
    // the spaghetti plots
    let T = g.time_axis.length;
    let steps = [Math.floor(1*T/4), Math.floor(3*T/4)];
    for (var step of steps) {
        let markers = [];

        vertices.forEach((v) => {
            if (v.time_step === step) { markers.push(v); }
        });

        add_time_marker(
            figElem, fun_cx, fun_cy, markers,
            {g : g, fun_opacity : fun_opacity, selected_k : selected_k}
        );
    }
}

function add_time_marker(
    figElem, fun_cx, fun_cy, markers,
    {
        g = undefined, fun_opacity = f_opacity, color = "black",
        selected_k = false, fun_rx = (d => 1.), fun_ry = (d => 7),
    } = {},
) {

    let myPlot = d3.select(figElem).select("#plot-group");

    myPlot.append('g')
        .attr('id', 'markers')
        .selectAll('.bli')
        .data(markers)
        .enter()
        .append("ellipse")                 // path: svg element for ellipses
        .classed("time-marker", true)
        .attr("cx", (d => fun_cx(d)))      // Compute x, y coord
        .attr("cy", (d => fun_cy(d)))
        .attr("rx", (d => fun_rx(d)))      // Compute radius
        .attr("ry", (d => fun_ry(d)))
        .attr("opacity", (d => 2*fun_opacity(
            d, {g : g, selected_k : selected_k}
        )))
        .attr("fill", color)

    myPlot.append('g')
        .attr('id', 'markers')
        .selectAll('.bla')
        .data(markers)
        .enter()
        .append("ellipse")
        .classed("time-marker", true)
        .attr("cx", (d => fun_cx(d)))
        .attr("cy", (d => fun_cy(d)))
        .attr("ry", (d => fun_rx(d)))
        .attr("rx", (d => fun_ry(d)))
        .attr("opacity", (d => 2*fun_opacity(
            d, {g : g, selected_k : selected_k}
        )))
        .attr("fill", color)
    }

function add_k_options(
    figElem, fun_cx, fun_cy, g, life_spans, selected_k,
    {fun_opacity = f_opacity,
    fun_size = (d => 7),
    } = {},
) {
    if (typeof(selected_k) === 'string') {
        selected_k = selected_k.split(",")
    }
    if (typeof(selected_k[0]) === 'string') {
        selected_k = selected_k.map(Number);
    }

    let myPlot = d3.select(figElem).select("#plot-group");

    function def_class(d) {
        if (d.k === selected_k[d.t]) {
            return "k-optionOSelected"
        } else {
            return "k-optionO"
        }
    }


    // This element will render (display) the vertices but they won't be
    // interactive
    myPlot.append('g')
        .attr('id', 'k-options')
        //.attr("data-selected_k", selected_k) // update selected_k attribute
        .selectAll('.k-optionO')
        .data(life_spans)
        .enter()
        .append("circle")                  // path: svg element for lines
        .attr("class", (d => def_class(d)))           // Style
        .attr("cx", (d => fun_cx(d)))      // Compute x coord
        .attr("cy", (d => fun_cy(d)))      // Compute y coord
        .attr("r", (d => fun_size(d)) )    // Compute radius
        .attr("opacity", (d => fun_opacity( d, {g : g} )/2))
        .attr("id", (d => "k-opt_" + d.k + "_" + d.t))
        .attr("time_step", (d => d.t))
        .attr("k", (d => d.k));

    // This element won't display anything but will react to the mouse
    // The area is typically larger than their displayed counterpart
    myPlot.append('g')
        .attr('id', 'k-options-event')
        .selectAll('.k-optionO-event')
        .data(life_spans)
        .enter()
        .append("circle")
        .classed("k-optionO-event", true)
        // Add listeners for mouseover/mouseout event
        .on("click", onClickK(figElem))
        .attr("cx", (d => fun_cx(d)))
        .attr("cy", (d => fun_cy(d)))
        .attr("r", (d => fun_size(d)) )
        .attr("id", (d => "k-opt-event_" + d.k + "_" + d.t));
}

function add_edges(
    figElem, fun_edge, g, edges,
    {fun_opacity = f_opacity,
    fun_size = f_stroke_width,
    fun_color = f_color,
    list_colors = get_list_colors(50),
    selected_k = false,
    } = {},
) {
    let myPlot = d3.select(figElem).select("#plot-group");

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
    filename,
    options = {
        method = "", score = "", time_window = "", drepresentation="",
        trepresentation="",
    } = {},
) {
    return await $.get(
        "load_graph/",                 // URL
        {                              // Additional data
            filename : filename,
            method: options.method,
            score: options.score,
            drepresentation : options.drepresentation,
            trepresentation : options.trepresentation,
            time_window : options.time_window,
            path_data : PATH_DATA,
            path_graph : PATH_GRAPH
        },
        function(data) {       // Callback on success
            // "data" is the value returned by the python function
            return data
        })
        .fail(function(data, status) {
            console.log('Calling load_graph failed', data, status);
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
        "load_data/",                  // URL
        {                              // Additional data
            filename : filename,
            path_data : PATH_DATA,
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

export async function find_files() {
    return await $.get(
        "find_files/",                  // URL
        {                              // Additional data
            path : PATH_DATA,
        },
        function(data) {       // Callback on success
            // "data" is the value returned by the python function
            return data
        })
        .fail(function(data, status) {
            console.log('Calling find_files failed', data, status);
            return data
        })
        .always(function(data) {
            return data
        })
}


export async function draw_meteogram(
    filename,
    {
        id=undefined, dims = undefined, include_k = "blank", kmax = 4,
        parent = undefined,
    } = {},
) {
    // Load the data and wait until it is ready
    const data =  await load_data(filename);
    // d3 expects a very specific data format
    let data_xy = d3fy(data);
    // Create or retrieve figs if they were already created
    let figs = fig_meteogram(
        data,
        {
            id: id, dims : dims, include_k : include_k, kmax : kmax,
            parent : parent}
    );

    // We create a new fig for each variable
    for(var iplot = 0; iplot < data.var_names.length; iplot++ ) {

        // get d3 scalers
        let {x, y, xk, yk} = get_scalers(figs[iplot]);

        let myLine = d3.line()
            .x(d => x(d.t))
            .y(d => y(d[data.var_names[iplot]]));

        add_members(figs[iplot], myLine, data_xy,);

    }
    return figs
}



export async function draw_mjo(
    filename,
    {id=undefined, dims = undefined, parent = undefined} = {},
) {

    // Load the data and wait until it is ready
    const data =  await load_data(filename);
    let data_xy = d3fy(data);

    // Create or retrieve figs if they were already created
    let figElem = fig_mjo( { id : id, dims : dims, parent : parent });

    // get d3 scalers
    let {x, y, xk, yk} = get_scalers(figElem);

    let myLine = d3.line()
        .x(d => x(d.rmm1))
        .y(d => y(d.rmm2));

    add_members(figElem, myLine, data_xy);
    draw_time_markers_members(figElem, data_xy)

    return figElem
}

export async function draw_members(
    filename,
    {
        plot_type = "meteogram", include_k = "blank", kmax = 4, id=undefined,
        dims = undefined, parent = undefined,
    } = {},
) {
    let res;
    if (plot_type === "mjo") {
        res = await draw_mjo(filename, {id : id, dims : dims, parent : parent})
    } else {
        res = await draw_meteogram(filename, {
            id : id, dims : dims, parent : parent, include_k: include_k,
            kmax : kmax,
        })
    }
    set_fig_attrs(res, {data_type : "members", filename : filename});
    return res
}

export async function draw_entire_graph_meteogram(
    filename,
    {
        include_k = "yes", kmax = 4, id=undefined, dims = undefined,
        parent = undefined, options = undefined,
    } = {},
) {
    // Load the graph and wait until it is ready
    const data =  await load_data(filename);
    const g =  await load_graph( filename, options );
    const vertices = g.vertices.flat();
    const edges = g.edges.flat();
    const time = g.time_axis;
    const members = g.members;
    const colors = get_list_colors(g.n_clusters_range.length);



    // Create or retrieve figs if they were already created
    let figs = fig_meteogram(
        data,
        {
            id : id, dims : dims, include_k : include_k, kmax : kmax,
            parent : parent
        });

    // We create a new fig for each variable
    for(var iplot = 0; iplot < g.d; iplot++ ) {

        // get d3 scalers
        let {x, y, xk, yk} = get_scalers(figs[iplot]);

        let cx = (d => x( g.time_axis[d.time_step] ));
        let cy = (d => y( d.info.mean[iplot] ));

        add_vertices(figs[iplot], cx, cy, g, vertices, {list_colors : colors});

        let fun_edge = (d => f_line_edge(d, g, x, y, iplot));

        add_edges(figs[iplot], fun_edge, g, edges, {list_colors : colors});

    }
    return figs
}

export async function draw_entire_graph_mjo(
    filename,
    {
        id=undefined, dims = undefined, parent = undefined, options = undefined,
    } = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph( filename, options );
    const vertices = g.vertices.flat();
    const edges = g.edges.flat();
    const time = g.time_axis;
    const members = g.members;
    const colors = get_list_colors(g.n_clusters_range.length);

    let figElem = fig_mjo(
        {
            id : id, dims : dims, parent : parent
        });

    // Add x and y axis element
    let {x, y, xk, yk} = get_scalers(figElem);

    let cx = (d => x( d.info.mean[0] ));
    let cy = (d => y( d.info.mean[1] ));
    add_vertices(figElem, cx, cy, g, vertices, {list_colors : colors} );

    let fun_edge = (d => f_line_edge_mjo(d, g, x, y));
    add_edges( figElem, fun_edge, g, edges, {list_colors : colors} );

    return figElem
}

export async function draw_entire_graph(
    filename,
    {
        plot_type = "meteogram", include_k = "yes", kmax = 4, id=undefined,
        dims = undefined, parent = undefined, options = undefined,
    } = {},
) {
    let res;
    if (plot_type === "mjo") {
        res = await draw_entire_graph_mjo(filename, {
            id : id, dims : dims, parent : parent, options : options,
        });
    } else {
        res = await draw_entire_graph_meteogram(filename, {
            id : id, dims : dims, parent : parent, include_k: include_k,
            kmax : kmax, options : options,
        });
    }
    set_fig_attrs(res, options);
    set_fig_attrs(res, {data_type : "entire_graph", filename : filename});
    return res
}

async function get_relevant_components(
    filename,
    options = {
        k = -1, method = "", score = "", time_window = "", drepresentation=""
    } = {},
) {
    // Pass array as string
    if (options.k != -1) {
        options.k = options.k.map(String).join(",")
    }
    return await $.get(
        "relevant/",                   // URL
        {                              // Additional data
            filename : filename,
            method: options.method,
            score: options.score,
            drepresentation : options.drepresentation,
            time_window : options.time_window,
            k: options.k,
            path_graph : PATH_GRAPH,
            path_data : PATH_DATA
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

export async function clear_graph(figElem) {
    let plotGroup = figElem.querySelector('#plot-group');
    try {
        plotGroup.querySelector("#vertices").remove();
    // There was no such element
    } catch {}
    try {
        plotGroup.querySelector("#vertices-event").remove()
    } catch {}
    try {
        plotGroup.querySelector("#edges").remove()
    } catch {}
    try {
        plotGroup.querySelector("#edges-event").remove()
    } catch {}
    try {
        plotGroup.querySelector("#k-options").remove()
    } catch {}
    try {
        plotGroup.querySelector("#k-options-event").remove()
    } catch {}
}

export async function draw_relevant_graph_meteogram(
    filename,
    {
        include_k = "yes", kmax = 4, id=undefined, dims = undefined,
        parent = undefined, options = undefined,
    } = {},
) {
    // Load the graph and wait until it is ready
    let opts = {...options};
    const data =  await load_data(filename);
    const g =  await load_graph( filename, opts );
    const colors = get_list_colors(g.n_clusters_range.length);


    let k_max = d3.min([kmax, g.k_max]);
    // To draw k options
    const life_spans = d3fy_life_span(g.life_span, {k_max : k_max}).flat();

    // Create or retrieve figs if they were already created
    let figs = fig_meteogram(
        data,
        {
            id : id, dims : dims, include_k : include_k, kmax : kmax,
            parent : parent}
    );

    // list of k values to plot
    // opts defined but k not in opts or opts.k is the default value
    // Then return default value according to the graph
    if ( (opts != undefined) && (!('k' in opts)) || (opts.k === -1) ){
        opts.k = g.relevant_k.k;
    }
    if (opts === undefined) {
        opts = {k : g.relevant_k.k};
    }

    // document ready return a promise, se we should wait
    await $(async function () {
        // sending_HTTP_request return a promise, so we should wait
        let relevant_components = await get_relevant_components(
            filename, opts
        );

        let vertices = relevant_components.vertices.flat();
        let edges = relevant_components.edges.flat();

        // We create a new fig for each variable
        for(var iplot = 0; iplot < g.d; iplot++ ) {

            // get d3 scalers
            let {x, y, xk, yk} = get_scalers(figs[iplot]);
            let myPlot = d3.select(figs[iplot]).select("#plot-group");

            // Clear previous relevant graph
            clear_graph(figs[iplot]);

            // Add k options using life_spans variable
            let yk_offset = myPlot.select('#yaxis-k').attr("yoffset");
            let cxk = (d => x( g.time_axis[d.t] ));
            let cyk = (d => (parseFloat(yk_offset) + parseFloat(yk( d.k ))).toString());
            add_k_options(figs[iplot], cxk, cyk, g, life_spans, opts.k);

            // Add vertices
            let cx = (d => x( g.time_axis[d.time_step] ));
            let cy = (d => y( d.info.mean[iplot] ));
            add_vertices(
                figs[iplot], cx, cy, g, vertices,
                {list_colors : colors, selected_k : true}
            );

            // Add edges
            let fun_edge = (d => f_line_edge(d, g, x, y, iplot));
            add_edges(
                figs[iplot], fun_edge, g, edges,
                {list_colors : colors, selected_k : true}
            );
        }
        return undefined
    })
    set_fig_attrs(figs, {k : opts.k});
    return figs
}

export async function draw_relevant_graph_mjo(
    filename,
    {
        id=undefined, dims = undefined, parent = undefined,
        options = undefined,
    } = {},
) {
    // Load the graph and wait until it is ready
    let opts = {...options};
    const g =  await load_graph( filename, opts );
    const colors = get_list_colors(g.n_clusters_range.length);


    // Create or retrieve figs if they were already created
    let figElem =  fig_mjo( { id : id, dims : dims, parent : parent });

    // list of k values to plot
    // opts defined but k not in opts or opts.k is the default value
    // Then return default value according to the graph
    if ( (opts != undefined) && (!('k' in opts)) || (opts.k === -1) ){
        opts.k = g.relevant_k.k;
    }
    if (opts === undefined) {
        opts = {k : g.relevant_k.k};
    }

    // document ready return a promise, se we should wait
    await $(async function () {
        // sending_HTTP_request return a promise, so we should wait
        let relevant_components = await get_relevant_components(
            filename, opts,
        );

        let vertices = relevant_components.vertices.flat();
        let edges = relevant_components.edges.flat();

        // get d3 scalers
        let {x, y, xk, yk} = get_scalers(figElem);

        // Clear previous relevant graph
        clear_graph(figElem);

        // Add vertices
        let cx = (d => x( d.info.mean[0] ));
        let cy = (d => y( d.info.mean[1] ));
        add_vertices(
            figElem, cx, cy, g, vertices,
            {list_colors : colors, selected_k : true}
        );

        // Add edges
        let fun_edge = (d => f_line_edge_mjo(d, g, x, y));
        add_edges( figElem, fun_edge, g, edges,
            {list_colors : colors, selected_k : true}
        );
        return undefined
    })
    set_fig_attrs(figElem, {k : opts.k});
    return figElem
}

export async function draw_relevant_graph(
    filename,
    {
        plot_type = "meteogram", include_k = "yes", kmax = 4, id=undefined,
        dims = undefined, parent = undefined, options = undefined,
    } = {},
) {
    let res;
    if (plot_type === "mjo") {
        res = await draw_relevant_graph_mjo(filename, {
            id : id, dims : dims, parent : parent, options : options,
        });
    } else {
        res = await draw_relevant_graph_meteogram(filename, {
            id : id, dims : dims, parent : parent, include_k: include_k,
            kmax : kmax, options : options,
        });
    }
    // K is added inside the functions because if it's a default value '-1'
    // then the g.relevant_k.k should added instead of options.k
    delete options["k"];
    set_fig_attrs(res, options);
    set_fig_attrs(res, {data_type : "relevant_graph", filename : filename});
    return res
}

export async function redraw_relevant_graph(selected_k=-1, interactGroupId=1){
    // -------- Update relevant components graphs ---------------------

    // All figs in the body
    let figs = document.getElementsByClassName("container-fig");
    let to_ignore = [];

    // Sort figures based on their interactive group and data_type
    for (let i = 0; i < figs.length; i++) {

        let groupId = document.getElementById(figs[i].id + "_input").value;

        // Consider current fig only if it is a relevant type
        // And in the same interactive group
        if (
            (groupId == interactGroupId)
            && (figs[i].getAttribute('data_type') === "relevant_graph")
        ) {

            let ignore = false
            let id = figs[i].id;
            let plot_type = figs[i].getAttribute('plot_type');

            // Ignore current fig if id matches an already drawn
            // figure from a group of meteograms
            if (plot_type === "meteogram") {
                // Remove "_" + 0/1 at the end of id
                id = id.slice(0, -2);
                if (to_ignore.includes(id)){
                    ignore = true;
                } else {
                    to_ignore.push(id)
                }
            }

            // Update relevant graph
            if (!ignore) {
                let options = {
                    k : selected_k,
                    method : figs[i].getAttribute("method"),
                    score : figs[i].getAttribute("score"),
                    drepresentation : figs[i].getAttribute("drepresentation"),
                    time_window : figs[i].getAttribute("time_window"),
                };
                await draw_relevant_graph(
                    figs[i].getAttribute("filename"),
                    {
                        id : id, plot_type : plot_type, options : options,
                    }
                );
            }
        }
    }
}

export async function draw_life_span(
    filename,
    {
        id=undefined, dims = DIMS_mjo, parent = undefined, options = undefined,
    } = {},
) {
    // Load the graph and wait until it is ready
    const g =  await load_graph( filename, options );
    const life_spans = d3fy_life_span(g.life_span);
    const colors = get_list_colors(g.n_clusters_range.length);

    let figElem = init_fig( { dims : dims, fig_id : id, parent : parent});
    let attrs = {
        filename : filename, data_type : "life_span", plot_type : "meteogram",
    };
    set_fig_attrs(figElem, attrs);
    set_fig_attrs(figElem, options)
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
function onMouseOverMember(figElem, e, d) {
    return function (e, d) {
        onEventMemberAux(
            e, d, this, figElem, 'lineHovered',
            {deselect : false}
        )
    }
}

//mouseover event handler function using closure
function onMouseOutMember(figElem, e, d) {
    return function (e, d) {
        onEventMemberAux(
            e, d, this, figElem, 'lineHovered',
            {select : false}
        )
    }
}

//mouseover event handler function using closure
function onClickMember(figElem, e, d) {
    return function (e, d) {
        let m_id = this.id.slice(7);
        // Update the displayed number of member selected
        $("#member_selected").html(m_id);
        // Update the slider position
        document.getElementById("members_range").value = m_id;

        // Determine whether we are taking the accumulation of members
        let accumulation = document.getElementById('accumulation').checked;
        // Update styles of elements
        onEventMemberAux(
            e, d, this, figElem, 'lineClicked',
            {accumulation : accumulation}
        )
    }
}

//mouseover event handler function using closure
function onMouseOverCluster(figElem, e, d) {
    return function (e, d) {
        onEventClusterAux(
            e, d, this, figElem,
            'vertexHovered', 'lineClusterHovered',
            {deselect : false, show_cluster_content : false}
        )
    }
}

//mouseout event handler function using closure
function onMouseOutCluster(figElem, e, d) {
    return function (e, d) {
        onEventClusterAux(
            e, d, this, figElem,
            'vertexHovered', 'lineClusterHovered',
            {select : false, show_cluster_content : false}
        )
    }
}

//mouseover event handler function using closure
function onClickCluster(figElem, e, d) {

    return function (e, d) {
        // Determine whether we are taking the intersection or accumulation
        // or clusters one by one
        let intersection = document.getElementById('check-intersection').checked;
        let accumulation = document.getElementById('check-accumulation').checked;

        onEventClusterAux(
            e, d, this, figElem,
            'vertexClicked', 'lineClustered',
            {intersection : intersection, accumulation : accumulation}
        )
    }
}

/**
 * Update relevant components figures
 *
 * Update selected k options
 * Update relevant components graphs
 *
 * @param {*} figElem - DOM element of the fig that fired the event
 * @param {*} e - event
 * @param {*} d - datapoint associated with the event
 */
function onClickK(figElem, e, d) {
    //click event handler function using closure
    return function (e, d) {

        // ------------------ Update selected k options -----------------------

        // Find current selected k values (so element which was clicked
        // on + currently selected elements for other time steps)
        let selected_k = figElem.getAttribute("k").split(",").map(Number);

        // do something only if a new k has really been selected.
        if (selected_k[d.t] !=  d.k) {

            selected_k[d.t] = d.k;

            // update attribute
            figElem.setAttribute("k", selected_k)

            // -------- Update relevant components graphs ---------------------

            // Interactive group of the fig that fired the event
            let interactGroupId = document.getElementById(figElem.id + "_input").value;
            redraw_relevant_graph(selected_k, interactGroupId);
        }
    }
}