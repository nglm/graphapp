
Manual visualization of MJO
===============================================================================

Top bar
-------------------------------------------------------------------------------

### Select elements

- `File`: All `.txt` files put in the `GraphApp/data/data` folder will appear here. Select the file that corresponds to the plot you want to see.
- `Clustering method`: Clustering methods that are natively available in the `persigraph` library. A clustering method determines how datapoints are grouped into clusters. Select the clustering method that is the most suitable for your data and goals.
- `Clustering score`: Clustering scores that are natively available in the `persigraph` library. Clustering scores evaluates the relevance of the grouping made by the clustering method. Select the clustering score that is the most suitable for your data and goals.
- `Data representation`: Representation of the physical variables.
- `Time representation`: Representation of the time dimension.

### Slider

- `Time window`: length of the time window used to cluster a specific time step

Right bar
-------------------------------------------------------------------------------

### Legend

Correspondence between the number of clusters and the colors.

### Options for the type of selection

- `Intersection`: Enable the selection of multiple clusters. Only the members that belong in all selected clusters will be selected
- `Accumulation`: Enable the selection of multiple clusters. Any members that belong to at least one selected cluster will be selected.

### Buttons

- `Clear selection button`: Deselect all members / clusters
- `Default k values button`: Go back to the automated suggestion of number of clusters.

### Slider

- `Selected member`: Show the selected member.