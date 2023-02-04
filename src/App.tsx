import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl';
import axios from 'axios'

function App() {
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [showPrompt, setShowprompt] = useState(false);
  const [newName, setNewname] = useState('')
  const [featToChange, setfeatToChange] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: mapContainer.current as any,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lng, lat],
      zoom: zoom
    });
    map.current.doubleClickZoom.disable();
    map.current.on('load', () => {
      if (!map.current?.getSource('geojson-map')) {
        map.current?.addSource('geojson-map', {
          type: 'geojson',
          data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson',
          tolerance: 1.2
        });
      }
    });
  }, []);

  const uploadHandler = async (file: File) => {
    const source: maplibregl.GeoJSONSource = map.current?.getSource('geojson-map') as maplibregl.GeoJSONSource;

    const url = window.URL.createObjectURL(file)
    const res = await axios.get(url)
    source.setData(res.data);
    setData(res.data)

    if (!map.current?.getLayer('geojson-map-fill')) {
      map.current?.addLayer({
        id: "geojson-map-fill",
        type: "fill",
        source: 'geojson-map',
        paint: {
          "fill-opacity": 0.8,
          "fill-color": "#a88ef5",
          "fill-outline-color": "#20124d"
        },
      });
      map.current?.addLayer({
        id: "region-names",
        type: "symbol",
        source: "geojson-map",
        'layout': {
          'text-field': ['get', 'name_en'],
          'text-anchor': 'top'
        }
      })
      map.current.on('dblclick', 'geojson-map-fill', function(e) {
        setfeatToChange(e.features[0])
        setShowprompt(true)
        });
    }
  }

  const handleSubmit = async (e) => {
    setShowprompt(false)
    console.log(data)
    const newSource = data.features.map(feat => {
      if(feat.properties.name === featToChange.properties.name){
        feat.properties.name_en = newName
      }
      return feat
    })
    data.features = newSource
    setData(data)
    const source: maplibregl.GeoJSONSource = map.current?.getSource('geojson-map') as maplibregl.GeoJSONSource;
    source.setData(data)
    setNewname('')
  }

  const handleChange = (e) => {
    setNewname(e.target.value)
  }

  const Prompt = 
    <form onSubmit={(e)=>handleSubmit(e)}>
      <label>
        Enter new name:
        <input type="text" value={newName} onChange={(e)=>handleChange(e)} />
      </label>
      <input type="submit" value="Submit" />
    </form>

  return (
    <div>
      <input type="file" 
        id="myFile" 
        name="filename"  
        onChange={(e)=>uploadHandler(e.target.files![0])}
      />

      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>

      <div ref={mapContainer} className="map-container"></div>
      {showPrompt && Prompt}
    </div>
  )
}

export default App
