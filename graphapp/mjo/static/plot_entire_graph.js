import { dimensions, setAxTitle } from "./figures.js";

import {
    draw_mjo, draw_meteogram,
    draw_entire_graph_mjo, draw_entire_graph_meteogram,
    life_span_plot,
    draw_relevant_graph_mjo, draw_relevant_graph_meteogram,
} from "./plots.js";


const f4 = "z_s2s_rmm_ecmf_prod_rt_2015030500";

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

// -----------  Plot Entire graph -----------

let mjo_graph = await draw_entire_graph_mjo(
    f4, {dims : dims_mjo, id: "mjo_graph"});

let meteogr_rmm_graph = await draw_entire_graph_meteogram(
    f4,
    {dims : dims_meteogram, id : "mjo_rmm_graph"});