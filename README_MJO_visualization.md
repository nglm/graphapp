
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

- Select members by clicking on them. Their numbers appear on the slider in the side bar as explained above
- Members that correspond to the type of selection chosen (see `type of selection` above) to a selected clusters (see `Entire graphs` and `Relevant graphs` sections for more information about selecting clusters)

Entire graph plots
-------------------------------------------------------------------------------


Life span plot
-------------------------------------------------------------------------------


Most relevant graph plots
-------------------------------------------------------------------------------

