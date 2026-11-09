# YCS Sketchup

A browser-based terrain modeler for Mindanao, Philippines. Paste Google Earth coordinates in decimal degrees or DMS, choose the site width, inspect the terrain, and download a native SketchUp model.

[Open YCS Sketchup](https://lightants.github.io/ca-sketchup/)

## Generate a 3D parcel from Google Earth

Open **Survey from Google Earth** in the workspace. Upload a screenshot to detect its yellow parcel outline and read the measurements displayed in the Earth panel. Check the outline or trace it manually. Screenshot processing runs on your device.

For a tilted view, import the matching single-polygon KML/KMZ from Google Earth, or enter geographic coordinates for four marked corners. A KML/KMZ also works on its own. For a north-up overhead view, you can instead estimate placement using the area and the coordinates at the marked crosshair. Select **Generate parcel in 3D** to sample the site's elevation grid, clip it to the boundary, and inspect or download the parcel. The viewer reports horizontal area and perimeter plus minimum, area-weighted median, and maximum elevations. Original screenshot readings are shown separately for comparison.

## Terrain layers and site photos

Select **Satellite** beside **3D view** to explore detailed aerial imagery and elevation around the site in the embedded Esri World Imagery scene. **Open in Google Earth** opens the same location and a tilted camera view in Earth. Both need an internet connection. The high-resolution scene is for viewing. To include an image in a SketchUp export, choose **Terrain layer → Satellite · exportable (10 m)** or align your own photo. **Street map** shows roads and place names.

For your own image, generate terrain at the site coordinates, then use **Optional photo overlay → Choose photo** (JPG, PNG or WebP, up to 25 MB). A north-up aerial image works best. Use Plan view and **Align photo** to rotate, scale and shift the image in metres. The photo stays in your browser until you export it embedded in the SketchUp file. Refreshing or changing sites clears the photo. A single photo does not measure ground elevation.

Satellite: [EOxCloudless](https://cloudless.eox.at/) by EOX IT Services GmbH, contains modified Copernicus Sentinel data 2016, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), cropped and reprojected for the model. Street map: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Run locally

Run `python3 -m http.server 8000` in this directory and open `http://localhost:8000/`. GitHub Pages publishes the static files from the root of this branch.

## Elevation data

The viewer reports the elevation source, nominal spacing and vertical reference used for each model. The three sample sites include extracts from Copernicus GLO-30. Other locations can load Mapzen Terrain Tiles, with bundled Copernicus GLO-90 regional coverage as a fallback. Elevations support preliminary planning. Construction grades and boundaries require field measurements.

Produced using Copernicus WorldDEM-30 and WorldDEM-90 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA. All rights reserved. [Copernicus elevation data](https://registry.opendata.aws/copernicus-dem/) · [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).

The browser exporter uses OpenSKP. Its license is included in [export/OpenSKP-LICENSE.txt](export/OpenSKP-LICENSE.txt).
