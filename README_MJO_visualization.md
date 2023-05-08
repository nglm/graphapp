
Manual visualization of MJO
===============================================================================

The `MJO visualization` page allows the user to analyse the MJO forecasts, the interpretation of the forecasts made by the `PersiGraph` method, and to interact with both the raw data and the clustered data in order to effortlessly get the most relevant interpretation of the data according to a domain expert.

The `MJO visualization` page is divided into 3 mains sections, the top bar, the side bar and the plots.

Before to visualizing plots, make sure the data has been added to the `GraphApp/data/original` folder, as `.txt` files. All generated files will appear in `GraphApp/data/generated/`.

In case of unexpected behaviour, please reload the page.

Top bar
-------------------------------------------------------------------------------

### Select elements

- `File`: All `.txt` files put in the `GraphApp/data/original` folder will appear here. Select the file that corresponds to the data you want to analyse.
- `Clustering method`: Clustering methods that are natively available in the `PersiGraph` library. A clustering method determines how datapoints are grouped into clusters. Select the clustering method that is the most suitable for your data and goals.
- `Clustering score`: Clustering scores that are natively available in the `PersiGraph` library. Clustering scores evaluates the relevance of the grouping made by the clustering method. Select the clustering score that is the most suitable for your data and goals.
- `Data representation`: Representation of the physical variables.
  - `RMM`: The standard representation of the MJO index. More specifically, each member is represented by a time series of two variables: `RMM1` and `RMM2`, the first 2 principal components.
  - `RMM-squared_radius`: Members are being clustered using transformed `RMM` values, based on the square of their distance to the origin. More specifically, $\texttt{RMM}_{1|2\;squared} = r \times \texttt{RMM}_{1|2}$, where $r = \sqrt{\texttt{RMM}_1^2 + \texttt{RMM}_2^2}$. In MJO data, the inner circle of radius 1 plays a key role. A datapoint slightly inside the circle represents a significantly different behavior than a datapoint slightly outside. Taking into account this feature of the data in it representation might then be desirable.
- `Time representation`: Representation of the time dimension. To cluster members at time $t$ with a time window of length $w$, the time steps used to cluster the members are
  - $[t - \lfloor \frac{w-1}{2}\rfloor , \cdots, t, \cdots, t + \frac{w}{2}]$ if $w$ is even (i.e. the future time steps are favored).
  - $[t - \lfloor \frac{w-1}{2}\rfloor , \cdots, t, \cdots, t + \lfloor \frac{w-1}{2}\rfloor]$ if $w$ is odd (i.e. as many future time steps as past time steps).

### Slider

- `Time window`: Defines the length of the time window $w$ used to cluster a specific time step.

Right bar
-------------------------------------------------------------------------------

### Legend

Correspondence between the assumption on the number $k$ of clusters and the colors.

### Buttons

- `Clear selection button`: Deselect all members / clusters.
- `Default k values button`: Go back to the automated suggestion of number of clusters.

### Options for the type of selection

- `Single`: Select only one cluster at a time. Clicking on a new cluster will deselect the previous one.
- `Intersection`: Enable the selection of multiple clusters. Only the members that belong in all selected clusters will be selected.
- `Accumulation`: Enable the selection of multiple clusters. Any members that belong to at least one selected cluster will be selected.

For more information about selecting members see `Ensemble plots` and for more information about selecting clusters see `Entire graphs` and `Relevant graphs` sections.

### Slider

- `Selected member`: Select a specific member.

### Additional information about selection

- `Intersection of selected clusters`: Show the intersection of all selected clusters.
- `In each selected cluster`: Ordered list of selected clusters. Each item contains the members belonging to the corresponding cluster.

Ensemble plots
-------------------------------------------------------------------------------

### Description

These plots show the raw data.

- The 1st plot is the `phase plot`, where the $x$- and $y$- axes are respectively `RMM1` and `RMM2`. The phase plot is first divided into different categories, representing different MJO regimes. First, a circle of radius one is drawn, when datapoints are inside this circle, the MJO is considered *weak* or inexistent. When outside this circle, the MJO is considered *strong*. In addition, the *strong* category is equally subdivided into 8 categories, representing different phases of the MJO life cycle. It is expected that times series go around the origin in the anticlockwise direction.
- The 2nd and 3rd plots show respectively `RMM1` and `RMM2` values with respect to time.

### Interaction

- Select members by clicking on them. Their numbers appear on the slider in the side bar as explained above.
- Members that correspond to the type of selection chosen (see `type of selection` above) to a selected clusters (see `Entire graphs` and `Relevant graphs` sections for more information about selecting clusters).

### Options

- `Time markers`: add colored time markers, to help visualize the time dimension in the phase plot.
  - Yellow: $t=0$
  - Cyan: $t=\frac{T}{4}$
  - Blue $t=\frac{2T}{4}$
  - Purple: $t=\frac{3T}{4}$
- `Thick lines`: Analysing multimodality might be easier using thick and non-opaque lines, while thinner lines are a more common visualisation in meteorology.

Entire graph plots
-------------------------------------------------------------------------------

### Description

These plots show the entire clustering graph, which is a graph containing the clustering of all possible number of clusters for each time step. The axes are the same as for the `Ensemble plots`.

- The different colors represent the different assumptions on the number $k$ of clusters (see `Legend`).
- The opacity represents the relevance of assuming that number of clusters.
- The thickness represents the number of members in that cluster.

### Interaction

- Select clusters by clicking on them. The members inside the selected cluster(s) appear on the side bar as explained above.

### Options

- `Time markers`: add time marker, to help visualize the time dimension in the phase plot. Note that these plots being already colored, it became necessary to use a scheme using symbols, as opposed to the colored scheme for the ensemble plots.
  - Circle: $t=\frac{T}{4}$
  - Cross $t=\frac{2T}{4}$
  - Triangle: $t=\frac{3T}{4}$

Life span plot
-------------------------------------------------------------------------------

### Description

Show the relevance of the different number of clusters with respect to time.
### Interaction

There is no interaction here.

Most relevant graph plots
-------------------------------------------------------------------------------

### Description

Show the clustering graph but with only one number of clusters for each time step, the one that is deemed most relevant, either as automatically suggested by the `PersiGraph` method, or fine-tuned by the user. The axes are the same as for the `Ensemble plots`.

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

### Options

- `Time markers`: See corresponding section in `Entire graph plots`.