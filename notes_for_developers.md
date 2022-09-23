Notes for developers and design choices
===============================================================================

Architecture of the HTML pages
-------------------------------------------------------------------------------

### Figure element

```
fig (div)
    buttons/input (input)
    svg (svg)
        background (rect)
        fig-group (g)
            figtitle (text)
            main (g)
                axes (svg)

axes (svg)
    axes-group (g)
        axtitle (text)
        main (g)
            xlabel (text)
            ylabel (text)
            plot (svg)

plot (svg)
    background (rect)
    plot-group (g)
        xaxis (g)
        yaxis (g)
        members (g)
        vertices (g)
        vertices-event (g)
        mjoClasses (g)
```

### Other comments

- Only ```document``` and ```svg``` elements have a ```.getElementById()``` method.
Therefore ids must be unique in the entire document or within a svg element
- All figures generated in a document can be found as follows

  ```javascript
  let figs = document.getElementsByClassName("container-fig")
  ```

- ```interactiveGroupElem``` is managed by the button/input element within a
fig and can be retrieved as follows:

    ```javascript
    let interactiveGroupElem = document.getElementById(figElem.id + "_input")
    if (groupId == interactiveGroupElem.value) {}
    ```

Managing data and graph files
-------------------------------------------------------------------------------

Data and graph are not stored as Django models but as ```.txt```, ```.json``` and ```.pg``` files directly accessible to the user. This is to ensure that users can easily add their files (e.g. daily meteograms), but also so that users can easily retrieve generated graphs. So far the data and graphs are stored at ```GraphApp/data/data``` and ```GraphApp/data/graphs```.

Ideally most of the computations are done in python using the ```PersiGraph``` package. Otherwise in python in the Django views, and otherwise in javascript.

File-based sessions are used to store filenames, data and graph on the server side.

Updating plots according to the user's input
-------------------------------------------------------------------------------

The first time the plotting function is called, it should create the fig skeleton, the d3 scalers, and only then plot the data. The next time it is called it should retrieve the figure element, re-compute the d3 scalers based on the attributes stored, clear the graph from the data and plot the new data

Interactive elements
-------------------------------------------------------------------------------

Elements like vertices or members have a visible part (e.g. "vertices") and an interactive part (e.g. "vertices-event"). This is so that the hitbox of element can be slightly larger than the element appearing on the graph