import Leaflet from 'leaflet'
import { gulliesPopup } from './Popups'
import { gulliesStyle} from './Styles'

const Configuration = {
  Map: {
    StartingLatLng: [53.3915, -2.125143],
    StartingZoom: 12,
    FullscreenControl: true,
    DisplayLayerControls: true,
    DisplayGrayScale: true,
    DisplayStreets: true,
    EnableAddressSearch: true,
    EnableLocateControl: true,
    Class: 'govuk-grid-column-full smbc-map__container',
    MapClickMinZoom: 16
  },
  DynamicData: [
    {
      key: 'Gullies Layer',
      url:
        'https://spatial.stockport.gov.uk/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=highway_assets:gully_faults_test&outputFormat=application/json&bbox={0},EPSG:4326&srsName=EPSG:4326',
      layerOptions: {
        onEachFeature: gulliesPopup,
        maxZoom: 16,
        pointToLayer: (feature, latlng) => {
          return Leaflet.circleMarker (latlng, gulliesStyle (feature))
      }
    },
    displayOverlay: true,
    visibleByDefault: true
  },
    {
      key: 'os1250_line',
      url: 'https://spatial.stockport.gov.uk/geoserver/wms?',
      layerOptions: {
          maxZoom: 20,
          minZoom: 19,
          layers: 'base_maps:os1250_line',
          format: 'image/png',
          transparent: true
      },
      displayOverlay: false,
      visibleByDefault: true
  },
  {
      key: 'os1250_text',
      url: 'https://spatial.stockport.gov.uk/geoserver/wms?',
      layerOptions: {
          maxZoom: 20,
          minZoom: 19,
          layers: 'base_maps:os1250_text',
          format: 'image/png',
          transparent: true
      },
      displayOverlay: false,
      visibleByDefault: true
  }

  ],
  StaticData: [
    {
      key: 'boundary',
      url:
        'https://spatialgeojson.s3-eu-west-1.amazonaws.com/webmapping/boundary.geojson',
      layerOptions: {
        interactive: false,
        maxZoom: 9,
        style: {
          color: '#000',
          weight: 4,
          opacity: 1,
          fillColor: '#000',
          fillOpacity: 0
        }
      }
    }
  ]
}

export default Configuration
