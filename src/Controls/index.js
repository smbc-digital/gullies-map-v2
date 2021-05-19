import { osOpen, greyscale, streetLayer } from '../Tiles'
import Leaflet from 'leaflet'
import fetch from 'cross-fetch'

const AddLayerControlsLayers = MapConfig => {
  const controlLayers = {}

  if (MapConfig.DisplayLayerControls) {
    controlLayers['Ordnance Survey'] = osOpen

    if (MapConfig.DisplayGrayScale) {
      controlLayers['Open Street Map'] = streetLayer
    }

    if (MapConfig.DisplayStreets) {
      controlLayers['Open Street Map Greyscale'] = greyscale
    }
  }

  if (Object.keys(controlLayers).length > 1) {
    return controlLayers
  }

  return {}
}

const AddWMSLayers = (Config, overlays, WMSLayerGroup, mapRef) => {
  if (Config.Map.DisplayLayerControls) {
    Object.keys(WMSLayerGroup).map((layer) => {
      const layerDetails = WMSLayerGroup[layer]
      var wmsLayer = new Leaflet.tileLayer.wms(layerDetails.url, layerDetails.layerOptions)
      if(layerDetails.displayOverlay){
        overlays[layer] = wmsLayer
      } else {
        wmsLayer.addTo(mapRef)
      }
    })
  } else {
    Object.keys(WMSLayerGroup).map((layer) => {
      const layerDetails = WMSLayerGroup[layer]
      var wmsLayer = new Leaflet.tileLayer.wms(layerDetails.url, layerDetails.layerOptions)
        wmsLayer.addTo(mapRef)
    })
  }
  return overlays
}

const AddLayerControlsOverlays = (Config, DynamicLayerGroup, WMSLayerGroup, mapRef) => {
  let overlays = {}
  if (Config.DynamicData.some(layer => layer.displayOverlay) && Config.Map.DisplayLayerControls) {
    Config.DynamicData.map(layer => {
      if (layer.displayOverlay) {
        overlays[layer.key] = DynamicLayerGroup[layer.key]
      }

      if (layer.visibleByDefault) {
        DynamicLayerGroup[layer.key].addTo(mapRef)
      }
    })
  } else {
    Config.DynamicData.map(layer => {
      DynamicLayerGroup[layer.key].addTo(mapRef)
    })
  }

  return AddWMSLayers(Config, overlays, WMSLayerGroup, mapRef)
}

const SearchControlOverlay = () => {
  const searchAddress = (rawPostcode, callResponse) => {
    const postcode = rawPostcode.toUpperCase().replace(/^(SK[0-9]{1,2})[ ]{0,1}([0-9]{1}[A-Z]{2})$/, '$1 $2')
    if(postcode.length < 6 || postcode.length > 8)
      return []
      
    const url = `https://spatial.stockport.gov.uk/geoserver/wfs?&service=wfs&version=1.0.0&request=getfeature&typename=address:llpg_points&Filter=%3CPropertyIsEqualTo%3E%3CPropertyName%3Epostcode%3C/PropertyName%3E%3CLiteral%3E${postcode}%3C/Literal%3E%3C/PropertyIsEqualTo%3E&outputformat=json`

    return fetch(url)
      .then(res => res.clone().json())
      .then(response => {
        callResponse(response.features.map(item => {
          const address = item.properties.address.replace(/\r\n/g, ', ').toUpperCase().trim()
          return { 'loc': item.geometry.coordinates.reverse(), 'title': address }
        }))
        }
      )
  }

  return new Leaflet.Control.Search({ 
    sourceData: searchAddress,
    position: 'bottomleft',
    filterData: (_, val2) => val2,
    textPlaceholder: 'Search by postcode',
    zoom: 19,
    marker: false,
    autoResize: false
  })
}

export { AddLayerControlsLayers, AddLayerControlsOverlays, SearchControlOverlay }
