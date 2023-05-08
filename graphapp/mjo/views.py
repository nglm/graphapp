from django.shortcuts import render
from django.http import JsonResponse

import pickle
from os.path import exists
from os import listdir, makedirs
import json

from persigraph.utils.d3 import serialize
import persigraph as pg
import multimet as mm

# Find all files in the data folder
PATH_PROCESSED = "./generated/processed/"
PATH_DATA = "./data"
PATH_GRAPH = "./generated/graphs/"
FILENAMES = [f[:-4] for f in listdir(PATH_DATA) if f.endswith(".txt")]
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
        "time_window": 9,
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
        return render(request, 'mjo/index.html', context)
    # Render only the main content with the specific options selected
    else:
        return render(request, 'mjo/plots.html', context)

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
    full_name = (
        PATH_GRAPH + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep +  "_" + str(w)
    )

    selected_k = context['k']

    # Make sure graph exists, otherwise generate it
    generate_graph(
        filename, method=method, score=score, drep=drep, trep=trep, w=w,
    )

    with open(full_name + ".pg", "rb") as f:
        g = pickle.load(f)
    vertices, edges = g.get_relevant_components(selected_k)
    v_dict = serialize(vertices)
    e_dict = serialize(edges)
    return JsonResponse({"vertices" : v_dict, "edges" : e_dict}, safe=False)

def process_data(filename):
    """
    Process data and save as .json from raw .txt if file doesn't already exist
    """
    output_name = PATH_PROCESSED + filename + ".json"
    if not exists(output_name):
        makedirs(PATH_PROCESSED, exist_ok = True)
        # Preprocess data
        print("_"*30)
        print(
            "Processing raw data from: ",
            PATH_DATA + filename + ".txt"
        )
        print("_"*30)
        data_dict = mm.preprocess.mjo( filename = filename + ".txt")
        try:
            # Exclusive access
            with open(output_name, 'x') as f:
                # Save processed data as .json
                mm.utils.save_as_json(data_dict, output_name)
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
):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist
    """
    fullname = (
        PATH_GRAPH + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep + "_" + str(w)
    )
    if not ( exists(fullname + ".pg") and exists(fullname + ".json") ):

        makedirs(PATH_GRAPH, exist_ok = True)
        # Make sure data has been processed first
        while (not process_data(filename) ):
            pass

        # Load data and extract members and time
        data_dict = await_load(PATH_PROCESSED + filename + ".json")
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
            # Save as .pg and .json
            with open(fullname + ".pg", 'x') as f1:
                g.save(fullname, type="pg")
            with open(fullname + ".json", 'x') as f1:
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

    full_name = (
        PATH_GRAPH + filename + "_" + method + "_" + score
        + "_" + drep + "_" + trep + "_" + str(w)
    )

    # Make sure graph exists, otherwise generate it
    while (not generate_graph(
        filename, method=method, score=score, drep=drep, trep=trep, w=w,
    )):
        pass

    # Return json version of graph
    dict_from_json = await_load(full_name + ".json")

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

    # Make sure the processed data file exists, otherwise generate it
    # Make sure data has been processed first
    while (not process_data(filename)):
        pass

    # Return json version of processed data
    json_fname = PATH_PROCESSED + filename + ".json"
    print("Loading data at", json_fname)
    dict_from_json = await_load(json_fname)
    return JsonResponse(dict_from_json, safe=False)

def find_files(request):
    """
    Find file names and return it as a json
    """
    path = request.GET['path']
    filenames = listdir(path)
    return JsonResponse(filenames, safe=False)

def await_load(fname):
    """
    Load a json file while waiting for it to be fully written
    """
    while (True):
        with open(fname, "rb") as json_file:
            try:
                dict_from_json = json.load(json_file)
            # This happens when we read the file while it's being created...
            except json.decoder.JSONDecodeError:
                pass
            else:
                return dict_from_json