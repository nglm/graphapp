from copyreg import constructor
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

import pickle
from os.path import exists
from os import listdir, getcwd
import json

from persigraph.utils.d3 import serialize
import persigraph as pg
import multimet as mm

# Find all files in the data folder
FILENAMES = [f[:-4] for f in listdir("./data/data") if f.endswith(".txt")]
METHODS = pg.CLUSTERING_METHODS
SCORES = pg.SCORES

def read_request(request):
    context = {
        "app" : "MJO",
        "filenames" : FILENAMES,
        "filename" : FILENAMES[0],
        "methods" : METHODS,
        "method" : METHODS[0],
        "scores" : SCORES,
        "score" : SCORES[0],
        "time_window": 1,
    }
    if "filename" in request.GET:
        context["filename"] = request.GET['filename']
    if "method" in request.GET:
        if request.GET['method'] != "":
            context["method"] = request.GET['method']
    if "score" in request.GET:
        if request.GET['score'] != "":
            context["score"] = request.GET['score']
    if "time_window" in request.GET:
        if request.GET['time_window'] != "":
            context["time_window"] = request.GET['time_window']
    return context

def main(request):
    context = read_request(request)
    # Render default view (with buttons etc.)
    if (
        "filename" not in request.GET or "method" not in request.GET
        or "score" not in request.GET
    ):
        return render(request, 'index.html', context)
    # Render only the main content with the specific options selected
    else:
        return render(request, 'plots.html', context)

def relevant(request):
    """
    Return relevant vertices and edges as a dictionary
    """
    context = read_request(request)
    filename = context['filename']
    method = context['method']
    score = context['score']
    w = context['time_window']
    path_graph = request.GET['path_graph']
    full_name = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + str(w)
    )

    selected_k = request.GET["k"]
    # If k == -1, take the list of relevant k by default
    if selected_k == "-1":
        selected_k = None
    else:
        # From string to list of int
        selected_k = list(map(int, selected_k.split(",")))

    print("Loading graph at: ", full_name + ".pg")
    with open(full_name + ".pg", "rb") as f:
        g = pickle.load(f)
    vertices, edges = g.get_relevant_components(selected_k)
    v_dict = serialize(vertices)
    e_dict = serialize(edges)
    return JsonResponse({"vertices" : v_dict, "edges" : e_dict}, safe=False)

def generate_data(filename, path_data=""):
    """
    Process data and save as .json from raw .txt if file doesn't already exist
    """
    if not exists(path_data + filename + ".json"):

        # Preprocess data
        print("Processing raw data from: ", path_data + filename + ".txt")
        data_dict = mm.preprocess.mjo(
            filename =filename + ".txt",
            path_data = path_data
        )

        # Save processed data as .json
        mm.utils.save_as_json(data_dict, filename, path=path_data)

def generate_graph(
    filename, method="", score="", path_data="", path_graph="", w=""):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist
    """
    full_name = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + str(w)
    )
    if not ( exists(full_name + ".pg") and exists(full_name + ".json") ):

        # Make sure data has been processed first
        generate_data(filename, path_data=path_data)

        # Load data and extract members and time
        with open(path_data + filename + ".json", "rb") as json_file:
            data_dict = json.load(json_file)
        members = data_dict['members']
        time = data_dict['time']

        # Generate graph
        print("Generating graph: ", full_name + ".pg")
        g = pg.PersistentGraph(
            members, time_axis=time, model_class=method, score_type=score,
            k_max=5, time_window=w
        )
        g.construct_graph()

        # Save as .pg and .json
        g.save(full_name, type="pg")
        g.save(full_name, type="json")
    else:
        print("Graph already generated at ", full_name+ ".pg")

def load_graph(request):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist

    If the .json and .pg files are not found, create them first based on the
    data files
    """
    context = read_request(request)
    filename = context['filename']
    method = context['method']
    score = context['score']
    w = context['time_window']
    path_data = request.GET['path_data']
    path_graph = request.GET['path_graph']

    full_name = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + str(w)
    )

    # Make sure graph exists, otherwise generate it
    generate_graph(
        filename, method=method, score=score,
        path_data=path_data, path_graph=path_graph, w=w
    )

    # Return json version of graph
    with open(full_name + ".json", "rb") as json_file:
        dict_from_json = json.load(json_file)
    return JsonResponse(dict_from_json, safe=False)

def load_data(request):
    """
    Load data (json file), and return it as a json as well

    If the json file is not found, create it first based on the txt file.
    The json file is a preprocessed version of the raw data contained in the
    txt file.
    """
    context = read_request(request)
    filename = context['filename']
    path_data = request.GET['path_data']

    # Make sure the processed data file exists, otherwise generate it
    generate_data(filename, path_data=path_data)

    # Return json version of processed data
    with open(path_data + filename + ".json", "rb") as json_file:
        print("Loading data at", path_data + filename + ".json")
        dict_from_json = json.load(json_file)
    return JsonResponse(dict_from_json, safe=False)

def find_files(request):
    """
    Find file names and return it as a json
    """
    path = request.GET['path']
    filenames = listdir(path)
    return JsonResponse(filenames, safe=False)