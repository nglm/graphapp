import { dimensions, setAxTitle } from "./figures.js";

import {
    draw_mjo, draw_meteogram,
    draw_entire_graph_mjo, draw_entire_graph_meteogram,
    life_span_plot,
    draw_relevant_graph_mjo, draw_relevant_graph_meteogram,
} from "./plots.js";

const path_script = document.getElementById("main-script").getAttribute("path_script");
// const data_path = path_script + "data/";
// const data_graph = path_script + "graphs/";
const data_path = "";
const data_graph = "";
const f1 = "ec.ens.2020011400.sfc.meteogram";
const f2 = "ec.ens.2020011500.sfc.meteogram";
const f3 = "ec.ens.2020011600.sfc.meteogram";
const f4 = "z_s2s_rmm_ecmf_prod_rt_2015030500";
const f4_polar = "z_s2s_rmm_ecmf_prod_rt_2015030500_polar";
const f5 = "z_s2s_rmm_ecmf_prod_rt_2020120300";

const plotHeightMeteogram = 400;
const plotWidthMeteogram = 600;
const plotWidthMJO = 600;
const dims_meteogram = dimensions(
    {plotWidth : plotWidthMeteogram, plotHeight : plotHeightMeteogram}
    );
const dims_mjo = dimensions(
    {plotWidth : plotWidthMJO, plotHeight : plotWidthMJO}
    );
const dims_relevant_meteogram = dimensions(
    {plotWidth : plotWidthMeteogram, plotHeight : plotHeightMeteogram *1.3}
    );

const kmax = 8;

// -----------  Plot members -----------

let mjo = await draw_mjo(f4,{ dims : dims_mjo, id : "mjo"});
setAxTitle(mjo, f4);
let meteogr_rmm = await draw_meteogram(
    f4, {dims : dims_meteogram, id:"mjo_rmm"});



// -----------  Plot Entire graph -----------

let mjo_graph = await draw_entire_graph_mjo(
    f4, {dims : dims_mjo, id: "mjo_graph"});

let meteogr_rmm_graph = await draw_entire_graph_meteogram(
    f4,
    {dims : dims_meteogram, id : "mjo_rmm_graph"});



// -----------  Plot life span -----------

let life_span = await life_span_plot(
    f4, {dims : dims_mjo, id : "life_span"});
d3.select("body").append('text').html('<br>');

// -----------  Plot relevant graph -----------

let mjo_rmm_graph_relevant = await draw_relevant_graph_mjo(
    f4,
    {dims : dims_mjo, id : "mjo_rmm_graph_relevant"});

let meteogr_rmm_graph_relevant = await draw_relevant_graph_meteogram(
    f4,
    {dims : dims_meteogram, id : "mjo_rmm_graph_relevant"});





// let mjo_polar = await draw_meteogram(
//     f4_polar, {dims : dims_meteogram, id : "mjo_polar"});


// await draw_meteogram(data_path + f4, undefined, "fig01");
// await draw_mjo(data_path + f4, dims_mjo, "fig04");