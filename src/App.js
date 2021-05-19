import React, { useRef, useEffect, useState } from 'react'
import Leaflet from 'leaflet'
import { fetchWithTimeout } from './Helpers'
import { gulliesPopup } from './Popups'
import Config from './Configuration.js'
import { osOpen } from './Tiles'
import {
  AddLayerControlsLayers,
  AddLayerControlsOverlays,
  SearchControlOverlay
} from './Controls'
import leafletPip from '@mapbox/leaflet-pip'
import locate from 'leaflet.locatecontrol' // eslint-disable-line no-unused-vars
import 'font-awesome/css/font-awesome.min.css'

function App() {
  const mapRef = useRef()

  const StaticLayerGroup = {}
  const WMSLayerGroup = {}
  const DynamicLayerGroup = Config.DynamicData.reduce(
    (accumulator, currentValue) => {
      accumulator[currentValue.key] = new Leaflet.FeatureGroup()
      return accumulator
    },
    {}
  )

  useEffect(() => {
    mapRef.current = Leaflet.map('map', {
      preferCanvas: true,
      minZoom: 12,
      layers: [osOpen]
    }).setView(
      Config.Map.StartingLatLng || [53.413519, -2.085143],
      Config.Map.StartingZoom || 12
    )

    mapRef.current.attributionControl.addAttribution('© Crown copyright and database rights 2021 Ordnance Survey 100019571. © OpenStreetMap contributors')

    setSearchControl()
    setStaticLayers()
    setDynamicLayers()
    setLayerControls()
    setLocateControl()
    setFullscreenControl()
  }, [])

  const setSearchControl = () => {
    if (Config.Map.EnableAddressSearch) {
      mapRef.current.addControl(SearchControlOverlay())
      document.querySelector('#searchtext18').addEventListener('keypress', searchInputHandler)
    }
  }

  const searchInputHandler = (event) => {
    if(event.key === 'Enter'){
      event.preventDefault()
    }
  }

  const setStaticLayers = async () => {
    const layers = {}
    await Promise.all(
      Config.StaticData.map(async layer => {
        const newLayer = await fetchData(layer.url, layer.layerOptions)
        layers[layer.key] = newLayer
      })
    )

    Config.StaticData.map(layer => {
      if (layers[layer.key] !== null) {
        StaticLayerGroup[layer.key] = new Leaflet.FeatureGroup()
        StaticLayerGroup[layer.key]
          .addLayer(layers[layer.key])
          .addTo(mapRef.current)
      }
    })
  }

  const setDynamicLayers = async () => {
    const layers = {}
    await Promise.all(
      Config.DynamicData.map(async layer => {
        if (layer.url.endsWith('wms?')) {
          WMSLayerGroup[layer.key] = layer
        } else {
          const url = layer.url.replace(
            '{0}',
            mapRef.current.getBounds().toBBoxString()
          )
          const newLayer = await fetchData(url, layer.layerOptions)
          layers[layer.key] = newLayer
        }
      })
    )

    Object.keys(DynamicLayerGroup).map(layer => {
      DynamicLayerGroup[layer].clearLayers()
      if (layers[layer] !== undefined && layers[layer] !== null) {
        DynamicLayerGroup[layer].addLayer(layers[layer])
      }
    })
  }

  const setLayerControls = () => {
    const controlLayers = AddLayerControlsLayers(Config.Map)
    const overlays = AddLayerControlsOverlays(
      Config,
      DynamicLayerGroup,
      WMSLayerGroup,
      mapRef.current
    )

    if (Config.Map.DisplayLayerControls) {
      Leaflet.control.layers(controlLayers, overlays).addTo(mapRef.current)
    }
  }

  const setLocateControl = () => {
    if (Config.Map.EnableLocateControl) {
      Leaflet.control
        .locate({
          icon: 'fa fa-location-arrow',
          strings: {
            title: 'Show your location'
          },
          showPopup: false
        })
        .addTo(mapRef.current)
    }
  }

  const setFullscreenControl = () => {
    if (Config.Map.EnableLocateControl) {
      Leaflet.control
        .fullscreen({
          position: 'topright',
          class: 'hide-on-mobile'
        })
        .addTo(mapRef.current)

      const fullscreenButton = document.getElementsByClassName(
        'leaflet-control-fullscreen'
      )
      fullscreenButton[0].classList.add('hide-on-mobile')
    }
  }

  useEffect(() => {
    mapRef.current.addEventListener('moveend', setDynamicLayers)

    return () => mapRef.current.removeEventListener('moveend', setDynamicLayers)
  }, [])

  useEffect(() => {
    mapRef.current.on('click', (e) => onMapClick(e))
  }, [mapRef])

  const onMapClick = async (event) => {
    if (mapRef.current.getZoom() > Config.Map.MapClickMinZoom) {
      var polygonsFoundInMap = leafletPip.pointInLayer(event.latlng, mapRef.current)

      if (polygonsFoundInMap.length > 0)
        Leaflet.popup()
          .setLatLng(event.latlng)
          .setContent(await gulliesPopup(event.latlng))
          .openOn(mapRef.current)
    }
  }

  const onMapLoad = async () => {
    var initalData = document.getElementById('map_current_value')
    if (initalData !== null) {
      var data = JSON.parse(initalData.value)
      if (data.lat !== undefined && data.lng !== undefined) {
        var lntLng = { lat: data.lat, lng: data.lng }
        mapRef.current.setView([data.lat, data.lng], 18)
        Leaflet.popup()
          .setLatLng(lntLng)
          .setContent(await gulliesPopup(lntLng))
          .openOn(mapRef.current)
      }
    }
  }

  useEffect(() => {
    onMapLoad()
  }, [mapRef])

  const [onClickLatLng, setOnClickLatLng] = useState()
  useEffect(() => {
    if (!onClickLatLng) return

    const polygonsFoundInMap = leafletPip.pointInLayer(
      onClickLatLng,
      mapRef.current
    )

    const layerContentInMap = polygonsFoundInMap
      .filter(_ => _.feature && _._popup && _._popup._content)
      .reduce((acc, curr, index, src) => {
        return `${acc} ${curr._popup._content} ${
          index != src.length - 1 ? '<hr/>' : ''
          }`
      }, '')

    /** opens new popup with new content and binds to map, this is instead of using
     * mapRef.current._popup.setConent as the popup is bound to the layer and not
     * the map and will therefore close when you move the map */
    if (layerContentInMap) {
      Leaflet.popup()
        .setLatLng(onClickLatLng)
        .setContent(layerContentInMap)
        .openOn(mapRef.current)
    } else {
      Leaflet.popup()
        .setLatLng(onClickLatLng)
        .setContent(mapRef.current._popup._content)
        .openOn(mapRef.current)
    }

    panMap(onClickLatLng)
  }, [onClickLatLng])

  const panMap = latLng => {
    var px = mapRef.current.project(latLng)
    px.y -= mapRef.current._popup._container.clientHeight / 2
    mapRef.current.panTo(mapRef.current.unproject(px), { animate: true })
  }

  const onPopupOpenHandler = event => setOnClickLatLng(event.popup._latlng)

  useEffect(() => {
    mapRef.current.addEventListener('popupopen', onPopupOpenHandler)

    return () =>
      mapRef.current.removeEventListener('popupopen', onPopupOpenHandler)
  }, [])

  const fetchData = async (url, layerOptions) => {
    if (mapRef.current.getZoom() > layerOptions.maxZoom) {
      const response = await fetchWithTimeout(url)
      const body = await response.json()
      return Leaflet.geoJson(body, layerOptions)
    }
    return null
  }

  return <div id='map' className={Config.Map.Class} />
}

export default App
