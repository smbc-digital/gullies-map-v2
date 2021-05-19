import Leaflet from 'leaflet'
import mapboxGL from 'mapbox-gl-leaflet' // eslint-disable-line no-unused-vars

const token = 'pk.eyJ1IjoiZ2lzLXN0b2NrcG9ydCIsImEiOiJja2lwdTFjYnEwN2xjMzFueWhuenlhYzJjIn0.WZXIykehWUdb30e2i9XHtg'

const greyscale = Leaflet.mapboxGL({
  style: 'mapbox://styles/gis-stockport/ck5gr2oav0utc1ipbdkcjnjop',
  accessToken: token,
  id: 'mapbox.light',
  maxZoom: 20
})

const osOpen = Leaflet.mapboxGL({
  style: 'mapbox://styles/gis-stockport/ck5mfgm1s38fb1jn4shus1hbd',
  accessToken: token,
  id: 'mapbox.os_open',
  maxZoom: 20
})

const streetLayer = Leaflet.mapboxGL({
  style: 'mapbox://styles/gis-stockport/ck5gqn69l0lok1inthicf4cnz',
  accessToken: token,
  id: 'mapbox.streets',
  maxZoom: 20
})

export { greyscale, osOpen, streetLayer }
