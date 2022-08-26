from copyreg import constructor
from django.shortcuts import render
from django.http import HttpResponse

import persigraph as pg

# Create your views here.

def main(request):
    return render(request, 'index.html', {"app" : "MJO"})

def relevant(request):
    filename = request.GET['filename']
    g = pg.PersistentGraph()
    g.load(filename + ".pg")
    selected_k = request.GET["k"]
    print('selected_k', selected_k)
    # vertices, edges = g.get_relevant_components(selected_k)
    # return HttpResponse({"vertices" : vertices, "edges" : edges})
    return HttpResponse({"vertices" : "vertices", "edges" : "edges"})