import webbrowser
from django.core import management

def start():
    management.call_command('runserver', '8080')
    webbrowser.open("http://127.0.0.1:8080/mjo/")