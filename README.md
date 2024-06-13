GraphApp
===============================================================================

`GraphApp` is a package specialized in interactive visualization of ensemble of time-series, notably when the ensemble size is small such as in ensemble weather prediction. `GraphApp` interpretation of the data relies on the [`PersiGraph`](https://github.com/nglm/persigraph) method (which itself uses the [`PyCVI`](https://github.com/nglm/pycvi) package to assess the quality of the clusters).

How to install
-------------------------------------------------------------------------------

### Prerequisite

1. Install poetry (recommended) or anaconda

### Once prerequisites are met

1. Copy / clone the content of the `GraphApp` folder from `github.com:nglm/graphapp.git`.
2. You should have the following arborescence: (Note that the  `GraphApp` folder can be renamed or merged with another of your personal folder)

   ```txt
    GraphApp/
        data/
        graphapp/
        LICENSE.txt
        notes_for_developers.
        poetry.lock
        pyproject.toml
        requirements.txt
        README.md
   ```

3. In the `GraphApp` folder, run the command that corresponds to your python package manager (see `Prerequisite`) in order to create a virtual environment with the packages required for the `GraphApp` application.
   - OPTION A. using poetry (recommended).

   ```bash
   poetry install
   ```

   - OPTION B. using anaconda

   ```bash
   # Replacing <environment_name> with a custom name for your environment
   # conda create --name <environment_name> --file requirements.txt
   # Example:
   conda create --name ga-env --file requirements.txt
   ```

How to run once installed
-------------------------------------------------------------------------------

1. Put your data in the `GraphApp/data` folder
2. In the `GraphApp` folder, run the command that corresponds to your python package manager (see `Prerequisite`) in order to run the application locally

   - OPTION A. using poetry (recommended).

    ```bash
    poetry run python graphapp/manage.py runserver 8080
    ```

   - OPTION B. using anaconda

   ```bash
   # Replacing <environment_name> with the name of your environment
   # conda create --name <environment_name> --file requirements.txt
   # Example:
   conda run --name ga-env python graphapp/manage.py runserver 8080
   ```

3. In your browser, go to the following URL `http://127.0.0.1:8080/`
4. Choose your type of visualization
5. Interact with the plots as you wish
6. The generated graphs are saved in the `GraphApp/data/generated/graphs` folder and can be loaded and manipulated with the [`PersiGraph`](https://github.com/nglm/persigraph) python package.
