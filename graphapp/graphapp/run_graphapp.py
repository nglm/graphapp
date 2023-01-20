import webbrowser
from django.core import management
from django.conf import settings
from django import setup
import secrets



def start():
    settings.configure(
        DEBUG=False,
        ALLOWED_HOSTS = ['localhost', '127.0.0.1',],
        SECRET_KEY = secrets.token_urlsafe(),
        ROOT_URLCONF = 'graphapp.urls')
    setup()
    # for name in dir(settings):
    #     print(name, getattr(settings, name))
    management.call_command('runserver', '8080')
    webbrowser.open("http://127.0.0.1:8080/mjo/")