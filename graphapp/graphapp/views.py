from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.

def main(request):
    return render(request, "graphapp/welcome.html")