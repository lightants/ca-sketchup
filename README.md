# CA Sketchup

A browser-based terrain modeler for Mindanao, Philippines. Paste Google Earth coordinates in decimal degrees or DMS, choose the site width, inspect the terrain, and download a native SketchUp model.

[Open CA Sketchup](https://lightants.github.io/ca-sketchup/)

## Run locally

Run `python3 -m http.server 8000` in this directory and open `http://localhost:8000/`. GitHub Pages publishes the static files from the root of this branch.

## Elevation data

The viewer reports the elevation source, nominal spacing and vertical reference used for each model. The three sample sites include extracts from Copernicus GLO-30. Other locations can load Mapzen Terrain Tiles, with bundled Copernicus GLO-90 regional coverage as a fallback. Elevations support preliminary planning. Construction grades and boundaries require field measurements.

Produced using Copernicus WorldDEM-30 and WorldDEM-90 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA. All rights reserved. [Copernicus elevation data](https://registry.opendata.aws/copernicus-dem/) · [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).

The browser exporter uses OpenSKP. Its license is included in [export/OpenSKP-LICENSE.txt](export/OpenSKP-LICENSE.txt).
