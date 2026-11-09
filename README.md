# YCS Sketchup

A browser-based terrain modeler for Mindanao, Philippines. Paste Google Earth coordinates in decimal degrees or DMS, choose the site width, inspect the terrain, and download a native SketchUp model.

[Open YCS Sketchup](https://lightants.github.io/ca-sketchup/)

## Terrain layers and site photos

Satellite imagery covers the selected square centered on the entered coordinates. Click **Satellite** to apply edited coordinates and site extent. The default 10 m Sentinel-2 texture is included in SketchUp exports. **Satellite image quality** accepts a MapTiler browser key for higher-resolution viewing where available.

For your own image, generate terrain at the site coordinates, then use **Optional photo overlay → Choose photo** (JPG, PNG or WebP, up to 25 MB). A north-up aerial image works best. Use Plan view and **Align photo** to rotate, scale and shift the image in metres. The photo stays in your browser until you export it embedded in the SketchUp file. Refreshing or changing sites clears the photo. A single photo does not measure ground elevation.

The sample sites use modified Copernicus Sentinel-2 L2A imagery from 2026. [Acquisition dates and source scenes](data/imagery/catalog.js). Other locations use [EOxCloudless](https://cloudless.eox.at/) by EOX IT Services GmbH, containing modified Copernicus Sentinel data 2016 under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Imagery is cropped and reprojected. Street map data is credited to [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Run locally

Run `python3 -m http.server 8000` in this directory and open `http://localhost:8000/`. GitHub Pages publishes the static files from the root of this branch.

## Elevation data

The viewer reports the elevation source, nominal spacing and vertical reference used for each model. The three sample sites include extracts from Copernicus GLO-30. Other locations can load Mapzen Terrain Tiles, with bundled Copernicus GLO-90 regional coverage as a fallback. Elevations support preliminary planning. Construction grades and boundaries require field measurements.

Produced using Copernicus WorldDEM-30 and WorldDEM-90 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA. All rights reserved. [Copernicus elevation data](https://registry.opendata.aws/copernicus-dem/) · [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).

The browser exporter uses OpenSKP. Its license is included in [export/OpenSKP-LICENSE.txt](export/OpenSKP-LICENSE.txt).
