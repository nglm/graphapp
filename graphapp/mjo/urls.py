from django.urls import path
from . import views

urlpatterns = [
    path("", views.main, name="main"),
    path("relevant/", views.relevant),
    path("load_graph/", views.load_graph),
    path("load_data/", views.load_data),
    path("find_files/", views.find_files),
]