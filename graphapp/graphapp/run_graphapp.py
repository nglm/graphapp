import webbrowser
from django.core import management
from django.conf import settings



def start():
    settings.configure(DEBUG=False, ALLOWED_HOSTS = ['localhost', '127.0.0.1',])
    management.call_command('runserver', '8080')
    webbrowser.open("http://127.0.0.1:8080/mjo/")