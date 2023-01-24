GraphApp
===============================================================================

GraphApp is a package specialized in interactive visualization of ensemble of time-series, notably when the ensemble size is small such as in ensemble weather prediction. GraphApp interpretation of the data relies on the PersiGraph method.

How to install
-------------------------------------------------------------------------------

1. Copy / clone the content of the `GraphApp` folder. You should have the following arborescence: (Note that the  `GraphApp` folder can be renamed or merged with another folder)

   ```txt
    GraphApp/
        data/
        graphapp/
        LICENSE.txt
        notes_for_developers.
        poetry.lock
        pyproject.toml
        README.md
   ```

2. In the `GraphApp` folder, run the following command in order to create a poetry virtual environment with the packages specified in the `pyproject.toml` file

   ```bash
   poetry install
   ```

How to use once installed
-------------------------------------------------------------------------------

1. In the `GraphApp` folder, run the following command in order to run the application locally

    ```bash
    poetry run python graphapp/manage.py runserver 8080
    ```

2. In your browser, go to the following URL `http://127.0.0.1:8080/`
