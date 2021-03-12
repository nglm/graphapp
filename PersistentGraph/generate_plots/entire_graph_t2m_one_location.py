#!/usr/bin/env python3
import sys
import os
from os import listdir, makedirs
import numpy as np
import matplotlib.pyplot as plt
from netCDF4 import Dataset

sys.path.insert(1, os.path.join(sys.path[0], '..'))
sys.path.insert(1, os.path.join(sys.path[0], '../..'))

from DataAnalysis.statistics import preprocess_data
from PersistentGraph import PersistentGraph
from PersistentGraph.plots import *



# ---------------------------------------------------------
# Parameters
# ---------------------------------------------------------

PG_TYPE = 'KMeans'

SCORE_TYPE = 'max_variance'
if PG_TYPE == 'Naive':
    SCORE_TYPE = 'max_diameter'


ZERO_TYPE = 'uniform'

var_names = ['tcwv']

# Absolute path to the files
# type: str
PATH_DATA = "/home/natacha/Documents/Work/Data/Bergen/"

# Choose the path where the figs will be saved
# type: str
PATH_FIG_PARENT = (
    "/home/natacha/Documents/tmp/figs/PG/"
    + PG_TYPE + "/" + str(var_names[0])
    + "/entire_graph/" + SCORE_TYPE + "/"
)

# Choose which files should be used
LIST_FILENAMES = listdir(PATH_DATA)
LIST_FILENAMES = [
    fname for fname in LIST_FILENAMES
    if fname.startswith("ec.ens.") and  fname.endswith(".nc")
]


# ---------------------------------------------------------
# Functions
# ---------------------------------------------------------

def main():
    if PG_TYPE == 'Naive':
        weights_range = [True, False]
    else:
        weights_range = [False]
    for weights in weights_range:
        for filename in LIST_FILENAMES:

            # To get the right variable names and units
            nc = Dataset(PATH_DATA + filename,'r')

            list_var, list_names, time = preprocess_data(
                filename = filename,
                path_data = PATH_DATA,
                var_names=var_names,
                ind_time=None,
                ind_members=None,
                ind_long=[0],
                ind_lat=[0],
                to_standardize = False,
                )

            members = list_var[0]

            if weights:
                weights_file = (
                    "/home/natacha/Documents/tmp/figs/global_variation_"
                    + var_names[0] +'/'
                    + "all_forecasts_max_distance.txt"
                )
                weights_values = np.loadtxt(weights_file)
            else:
                weights_values = None

            g = PersistentGraph(
                    time_axis = time,
                    members = members,
                    score_is_improving = False,
                    weights = weights_values,
                    score_type = SCORE_TYPE,
                    zero_type = ZERO_TYPE,
                    model_type = PG_TYPE,
                    k_max = 8,
            )
            g.construct_graph(
                verbose=True,
            )

            # ---------------------------
            # Plot entire graph
            # ---------------------------
            ax_kw = {
                'xlabel' : "Time (h)",
                'ylabel' :  (
                    nc.variables[var_names[0]].long_name
                    + ' (' + nc.variables[var_names[0]].units + ')'
                )
                }

            fig, ax = plot_as_graph(
                g, show_vertices=True, show_edges=True, show_std = True,
                ax_kw=ax_kw
            )

            fig_suptitle = (
                filename
                + "\nEntire graph, variable " + str(var_names[0])
            )

            if weights:
                fig_suptitle += "_weights"

            ax.set_title(fig_suptitle)
            # ---------------------------
            # Save plot and graph
            # ---------------------------
            path_fig = PATH_FIG_PARENT + "plots/"
            name_fig = path_fig + filename[:-3]
            if weights:
                name_fig += "_weights.png"
            else:
                name_fig += '.png'
            makedirs(path_fig, exist_ok = True)
            fig.savefig(name_fig)
            plt.close()

            path_graph = PATH_FIG_PARENT + "graphs/"
            makedirs(path_graph, exist_ok = True)
            name_graph = path_graph + filename[:-3]
            g.save(name_graph)

main()