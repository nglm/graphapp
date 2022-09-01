from copyreg import constructor
from django.shortcuts import render
from django.http import HttpResponse

import persigraph as pg
import multimet as mm

# Create your views here.

def main(request):
    return render(request, 'index.html', {"app" : "MJO"})

def relevant(request):
    filename = request.GET['filename']
    path_graph = request.GET['path_graph']
    selected_k = request.GET["k"]
    g = pg.PersistentGraph()
    g.load("graphapp" + path_graph + filename + ".pg")
    vertices, edges = g.get_relevant_components(selected_k)
    return HttpResponse({"vertices" : vertices, "edges" : edges})

def generate_graph(request):
    """
    generate and save graph (as .pg and .json)
    """
    filename = request.GET['filename']
    path_data = request.GET['path_data']
    path_graph = request.GET['path_graph']

    # Preprocess data and extract members and time
    print("this is original data file: ", path_data + filename + ".txt")
    data_dict = mm.preprocess.mjo(
        filename = "graphapp" + path_data + filename + ".txt",
    )
    members = data_dict['members']
    time = data_dict['time']

    # Generate graph
    g = pg.PersistentGraph(members, time_axis=time)
    g.construct_graph()
    # Save as .pg and .json
    g.save("graphapp" + path_graph + filename, type="pg")
    g.save("graphapp" + path_graph + filename, type="json")
    return HttpResponse({})
