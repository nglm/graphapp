
Manual visualization of MJO
===============================================================================

The `MJO visualization` page allows the user to analyse the MJO forecasts, the interpretation of the forecasts made by the `PersiGraph` method, and to interact with both the raw data and the clustered data in order to effortlessly get the most relevant interpretation of the data according to a domain expert.

This page is divided into 3 mains sections, the top bar, the side bar and the plots.

Before trying to visualize your plots, make sure you have added the data in the `GraphApp/data/data` folder, as `.txt` files.

Top bar
-------------------------------------------------------------------------------

### Select elements

- `File`: All `.txt` files put in the `GraphApp/data/data` folder will appear here. Select the file that corresponds to the plots you want to analyse.
- `Clustering method`: Clustering methods that are natively available in the `persigraph` library. A clustering method determines how datapoints are grouped into clusters. Select the clustering method that is the most suitable for your data and goals.
- `Clustering score`: Clustering scores that are natively available in the `persigraph` library. Clustering scores evaluates the relevance of the grouping made by the clustering method. Select the clustering score that is the most suitable for your data and goals.
- `Data representation`: Representation of the physical variables.
- `Time representation`: Representation of the time dimension.

### Slider

- `Time window`: Defines the length of the time window used to cluster a specific time step.

Right bar
-------------------------------------------------------------------------------

### Legend

Correspondence between the number of clusters and the colors.

### Options for the type of selection

- `Single`: Select only one cluster at a time. Clicking on a new cluster will deselect the previous one.
- `Intersection`: Enable the selection of multiple clusters. Only the members that belong in all selected clusters will be selected.
- `Accumulation`: Enable the selection of multiple clusters. Any members that belong to at least one selected cluster will be selected.

For more information about selecting members see `Spaghetti plots` and for more information about selecting clusters see `Entire graphs` and `Relevant graphs` sections.

### Buttons

- `Clear selection button`: Deselect all members / clusters.
- `Default k values button`: Go back to the automated suggestion of number of clusters.

### Slider

- `Selected member`: Select a specific member.

### Additional information about selection

- `Intersection of selected clusters`: Show the intersection of all selected clusters.
- `In each selected cluster`: Ordered list of selected clusters. Each item contains the members belonging to the corresponding cluster.

Spaghetti plots
-------------------------------------------------------------------------------

### Description

These plots show the raw data.

### Interaction

- Select members by clicking on them. Their numbers appear on the slider in the side bar as explained above.
- Members that correspond to the type of selection chosen (see `type of selection` above) to a selected clusters (see `Entire graphs` and `Relevant graphs` sections for more information about selecting clusters).

Entire graph plots
-------------------------------------------------------------------------------

### Description

These plots show the entire clustering graph, which is a graph containing the clustering of all possible number of clusters for each time step.

- The different colors represent the different assumptions on the number of clusters (see `Legend`).
- The opacity represent the relevance of assuming that this is a relevant number of cluster.
- The thickness represent the number of members in that cluster.

### Interaction

- Select clusters by clicking on them. The members inside the selected cluster(s) appear on the side bar as explained above.

Life span plot
-------------------------------------------------------------------------------

### Description

Show the relevance of the different number of clusters for each time step.
### Interaction

There is no interaction here.

Most relevant graph plots
-------------------------------------------------------------------------------

### Description

Show the clustering graph but with only one number of clusters for each time step, the one that is deemed the most relevant one, either as automatically suggested by the `PersiGraph` method, or fine-tuned by the user.

Upper part, the graph itself:

- The different colors represent the different assumptions on the number of clusters (see `Legend`).
- The opacity is always maximal, contrary to the `Entire graph`
- The thickness represent the number of members in that cluster.

Lower part, the assumed number of clusters

- For each time step, the selected number of clusters appear in red
- The opacity of each assumption $k$ represent the relevance of the assumption.

### Interaction

- Select clusters by clicking on them.
- Change the number of clusters assumed by clicking on the different nodes in the lower part of the plot.
