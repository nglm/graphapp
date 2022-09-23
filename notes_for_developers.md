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
