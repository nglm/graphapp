from django.shortcuts import render
from django.http import JsonResponse

import pickle
from os.path import exists
from os import listdir
import json

from persigraph.utils.d3 import serialize
import persigraph as pg
import multimet as mm

# Find all files in the data folder
FILENAMES = [f[:-4] for f in listdir("./data/data") if f.endswith(".txt")]
METHODS = pg.CLUSTERING_METHODS["names"]
SCORES = pg.SCORES
DATA_REPRESENTATIONS = ["RMM-squared_radius", "RMM"]
TIME_REPRESENTATIONS = ["Standard", "DTW"]

def read_request(request):
    context = {
        "app" : "MJO",
        "filenames" : FILENAMES,
        "filename" : FILENAMES[0],
        "methods" : METHODS,
        "method" : METHODS[0],
        "scores" : SCORES,
        "score" : SCORES[0],
        "drepresentations" : DATA_REPRESENTATIONS,
        "drepresentation" : DATA_REPRESENTATIONS[0],
        "trepresentations" : TIME_REPRESENTATIONS,
        "trepresentation" : TIME_REPRESENTATIONS[0],
        "time_window": 3,
    }
    if "filename" in request.GET:
        context["filename"] = request.GET['filename']
    if "method" in request.GET:
        if request.GET['method'] != "":
            context["method"] = request.GET['method']
    if "score" in request.GET:
        if request.GET['score'] != "":
            context["score"] = request.GET['score']
    if "drepresentation" in request.GET:
        if request.GET['drepresentation'] != "":
            context["drepresentation"] = request.GET['drepresentation']
    if "trepresentation" in request.GET:
        if request.GET['trepresentation'] != "":
            context["trepresentation"] = request.GET['trepresentation']
    if "time_window" in request.GET:
        if request.GET['time_window'] != "":
            context["time_window"] = request.GET['time_window']
    if "k" in request.GET:
        selected_k = request.GET['k']
        # If k == -1, take the list of relevant k by default
        if selected_k == "-1":
            context["k"] = None
        else:
            # From string to list of int
            context["k"] = list(map(int, selected_k.split(",")))
    return context

def main(request):
    context = read_request(request)
    # Render default view (with buttons etc.)
    if (
        "filename" not in request.GET or "method" not in request.GET
        or "score" not in request.GET
    ):
        return render(request, 'mjo_explore/index.html', context)
    # Render only the main content with the specific options selected
    else:
        return render(request, 'mjo_explore/plots.html', context)

def relevant(request):
    """
    Return relevant vertices and edges as a dictionary
    """
    context = read_request(request)
    filename = context['filename']
    method = context['method']
    score = context['score']
    drep = context["drepresentation"]
    trep = context["trepresentation"]
    w = context['time_window']
    path_graph = request.GET['path_graph']
    path_data = request.GET['path_data']
    full_name = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep +  "_" + str(w)
    )

    selected_k = context['k']

    # Make sure graph exists, otherwise generate it
    generate_graph(
        filename, method=method, score=score, drep=drep, trep=trep, w=w,
        path_data=path_data, path_graph=path_graph,
    )

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
    output_name = path_data + filename + ".json"
    if not exists(output_name):
        # Preprocess data
        print("_"*30)
        print(
            "Processing raw data from: ",
            path_data + filename + ".txt"
        )
        print("_"*30)
        data_dict = mm.preprocess.mjo(
            filename = filename + ".txt",
            path_data = path_data
        )
        try:
            # Exclusive access
            with open(output_name, 'x') as f:
                # Save processed data as .json
                mm.utils.save_as_json(data_dict, filename, path=path_data)
                return True
        except FileExistsError:
            print("_"*30)
            print(output_name, ' is already (being) created!')
            print("_"*30)
            return False
    else:
        return True

def generate_graph(
    filename, method="", score="", drep="", trep="", w="",
    path_data="", path_graph="",
):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist
    """
    fullname = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep + "_" + str(w)
    )
    if not ( exists(fullname + ".pg") and exists(fullname + ".json") ):

        # Make sure data has been processed first
        while (not generate_data(filename, path_data=path_data)):
            continue

        # Load data and extract members and time
        with open(path_data + filename + ".json", "rb") as json_file:
            data_dict = json.load(json_file)
        members = data_dict['members']
        time = data_dict['time']

        # Generate graph
        print("_"*30)
        print("Generating graph: ", fullname + ".pg")
        print("_"*30)
        squared_radius = "squared_radius" in drep
        DTW = "DTW" in trep
        g = pg.PersistentGraph(
            members, time_axis=time, model_class=method,
            score_type=score, k_max=5,
            squared_radius=squared_radius, DTW=DTW, time_window=w
        )
        g.construct_graph()
        # Exclusive access
        try:
            with open(fullname + ".json", 'x') as f1:
                with open(fullname + ".pg", 'x') as f2:
                    # Save as .pg and .json
                    g.save(fullname, type="pg")
                    g.save(fullname, type="json")
                    return True
        except:
            print("_"*30)
            print(fullname + ".json", ' is already (being) created!')
            print("_"*30)
            return False
    else:
        return True

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
    drep = context["drepresentation"]
    trep = context["trepresentation"]
    w = context['time_window']
    path_data = request.GET['path_data']
    path_graph = request.GET['path_graph']

    full_name = (
        path_graph + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep + "_" + str(w)
    )

    # Make sure graph exists, otherwise generate it
    while (not generate_graph(
        filename, method=method, score=score, drep=drep, trep=trep, w=w,
        path_data=path_data, path_graph=path_graph,
    )):
        continue

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
    # Make sure data has been processed first
    while (not generate_data(filename, path_data=path_data)):
        continue

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