# YCS Sketchup

A browser-based terrain modeler for Mindanao, Philippines. Paste Google Earth coordinates in decimal degrees or DMS, choose the site width, inspect the terrain, and download a native SketchUp model.

[Open YCS Sketchup](https://lightants.github.io/ca-sketchup/)

## Terrain layers and site photos

Choose **Terrain layer → Satellite** to drape the 2016 Sentinel‑2 mosaic on the model, or **Street map** to see roads and place names. Satellite imagery and street maps require internet access. The satellite image and its attribution are included when you export a model; the street map is for viewing only.

For your own image, generate terrain at the site coordinates, then use **Site photo → Choose photo** (JPG, PNG or WebP, up to 25 MB). A north-up aerial image works best. Use Plan view and **Align photo** to rotate, scale and shift the image in metres. The photo stays in your browser until you export it embedded in the SketchUp file. Refreshing or changing sites clears the photo. A single photo does not measure ground elevation.

Satellite: [EOxCloudless](https://cloudless.eox.at/) by EOX IT Services GmbH, contains modified Copernicus Sentinel data 2016, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), cropped and reprojected for the model. Street map: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Run locally

Run `python3 -m http.server 8000` in this directory and open `http://localhost:8000/`. GitHub Pages publishes the static files from the root of this branch.

## Elevation data

The viewer reports the elevation source, nominal spacing and vertical reference used for each model. The three sample sites include extracts from Copernicus GLO-30. Other locations can load Mapzen Terrain Tiles, with bundled Copernicus GLO-90 regional coverage as a fallback. Elevations support preliminary planning. Construction grades and boundaries require field measurements.

Produced using Copernicus WorldDEM-30 and WorldDEM-90 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA. All rights reserved. [Copernicus elevation data](https://registry.opendata.aws/copernicus-dem/) · [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).

The browser exporter uses OpenSKP. Its license is included in [export/OpenSKP-LICENSE.txt](export/OpenSKP-LICENSE.txt).
