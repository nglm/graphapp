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

# Create your views here.

def main(request):
    # Find all files in the data folder
    filenames = listdir("./data/data")
    # Select only relevant ones, and remove extension
    filenames = [f[:-4] for f in filenames if f.endswith(".txt")]
    context = {
        "app" : "MJO",
        "filenames" : filenames,
        "filename" : filenames[0],
    }
    if "filename" in request.GET:
        print("view has been called with GET + filename")
        context["filename"] = request.GET['filename']
        return render(request, 'index.html', context)
    else:
        print("view has been called with GET")
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

def generate_graph(filename, path_data="", path_graph=""):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist
    """
    if not (
        exists(path_graph + filename + ".pg")
        and exists(path_graph + filename + ".json")
    ):
        # Make sure data has been processed first
        generate_data(filename, path_data=path_data)

        # Load data and extract members and time
        with open(path_data + filename + ".json", "rb") as json_file:
            data_dict = json.load(json_file)
        members = data_dict['members']
        time = data_dict['time']

        # Generate graph
        print("Generating graph for ", filename)
        g = pg.PersistentGraph(members, time_axis=time, k_max=5)
        g.construct_graph()

        # Save as .pg and .json
        g.save(path_graph + filename, type="pg")
        g.save(path_graph + filename, type="json")
    else:
        print("Graph already generated at ", path_graph + filename + ".pg")

def load_graph(request):
    """
    Generate and save graph (as .pg and .json) if it doesn't already exist

    If the .json and .pg files are not found, create them first based on the
    data files
    """
    filename = request.GET['filename']
    path_data = request.GET['path_data']
    path_graph = request.GET['path_graph']

    # Make sure graph exists, otherwise generate it
    generate_graph(filename, path_data=path_data, path_graph=path_graph)

    # Return json version of graph
    with open(path_graph + filename + ".json", "rb") as json_file:
        dict_from_json = json.load(json_file)
    return JsonResponse(dict_from_json, safe=False)

def load_data(request):
    """
    Load data (json file), and return it as a json as well

    If the json file is not found, create it first based on the txt file.
    The json file is a preprocessed version of the raw data contained in the
    txt file.
    """
    filename = request.GET['filename']
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