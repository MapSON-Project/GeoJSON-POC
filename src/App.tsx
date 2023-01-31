import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXBhdWwyMSIsImEiOiJjbGRraDAxaHkxN2t0M3ZzMjJ0bDE2NGx2In0.hlp2WtXrcEDMrdazXclEDQ';

function App() {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
    });
  }, []);

  //Might have to change this, try with a valid geojson file
  const uploadHandler = (file: File) => {
    map.current?.addSource('geojson_map', {
      type: 'geojson',
      data: ''
    });

    file.text().then((string) => {
      console.log(string);

      map.current?.getSource('geojson_map').setData({
        type: 'geojson',
        data: JSON.parse(string)
      });
    });
  }

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
    </div>
  )
}

export default App
