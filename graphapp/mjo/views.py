from copyreg import constructor
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

import pickle
from os.path import exists
from os import listdir
import json

from persigraph.utils.d3 import serialize
import persigraph as pg
import multimet as mm

# Create your views here.

def main(request):
    context = {
        "app" : "MJO",
        "filename" : "z_s2s_rmm_ecmf_prod_rt_2015030500",
    }
    return render(request, 'index.html', context)

def relevant(request):
    """
    Return relevant vertices and edges as a dictionary
    """
    filename = request.GET['filename']
    path_graph = request.GET['path_graph']
    selected_k = request.GET["k"]
    # If k == -1, take the list of relevant k by default
    if selected_k == "-1":
        selected_k = None
    else:
        # From string to list of int
        selected_k = list(map(int, selected_k.split(",")))
    print("Loading graph at: ", path_graph + filename + ".pg")
    with open(path_graph + filename + ".pg", "rb") as f:
        g = pickle.load(f)
    vertices, edges = g.get_relevant_components(selected_k)
    v_dict = serialize(vertices)
    e_dict = serialize(edges)
    return JsonResponse({"vertices" : v_dict, "edges" : e_dict}, safe=False)

def generate_graph(request):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist

    Return the json version of the graph.
    """
    filename = request.GET['filename']
    path_data = request.GET['path_data']
    path_graph = request.GET['path_graph']

    # check if graph exists and if so, do nothing
    if not (exists(path_graph + filename + ".pg") and exists(path_graph + filename + ".json")):

        # Preprocess data and extract members and time
        print("Generating graph from: ", path_data + filename + ".txt")
        data_dict = mm.preprocess.mjo(
            filename = path_data + filename + ".txt",
        )
        members = data_dict['members']
        time = data_dict['time']

        # Generate graph
        g = pg.PersistentGraph(members, time_axis=time, k_max=5)
        g.construct_graph()
        # Save as .pg and .json
        g.save(path_graph + filename, type="pg")
        g.save(path_graph + filename, type="json")
    else:
        print("Graph already generated", exists(path_graph + filename + ".pg"))

    # Return json version of graph
    with open(path_graph + filename + ".json", "rb") as json_file:
        dict_from_json = json.load(json_file)
    return JsonResponse(dict_from_json, safe=False)

def load_data(request):
    """
    Load data (json file), and return it as a json as well
    """
    filename = request.GET['filename']
    with open(filename + ".json", "rb") as json_file:
        print("Loading data at", filename + ".json")
        dict_from_json = json.load(json_file)
    return JsonResponse(dict_from_json, safe=False)

def find_files(request):
    """
    Find file names and return it as a json
    """
    path = request.GET['path']
    filenames = listdir(path)
    return JsonResponse(filenames, safe=False)