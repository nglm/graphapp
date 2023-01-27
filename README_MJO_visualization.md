
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

- `Single`: Select only one cluster at a time. Clicking on a new cluster will deselect the previous one.
- `Intersection`: Enable the selection of multiple clusters. Only the members that belong in all selected clusters will be selected.
- `Accumulation`: Enable the selection of multiple clusters. Any members that belong to at least one selected cluster will be selected.

### Buttons

- `Clear selection button`: Deselect all members / clusters
- `Default k values button`: Go back to the automated suggestion of number of clusters.

### Slider

- `Selected member`: Show the selected member.
- `Intersection of selected clusters`: *Updated only when the selection of multiple clusters is enabled (i.e. `Intersection` or `Accumulation` type of selection is checked).* Show the intersection of all selected clusters.
- `In each selected cluster`: *Updated only when the selection of multiple clusters is enabled (i.e. `Intersection` or `Accumulation` type of selection is checked)*. Ordered list of clusters. Clicking on a new cluster will append a new item on this list. Each item contains the members belonging to the corresponding cluster.