// Set Mapbox access token
mapboxgl.accessToken = mapToken;

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // Ensure there's a <div id="map"></div> in your HTML
  style: "mapbox://styles/mapbox/streets-v12", // Choose a style for the map
  center: listing.geometry.coordinates, // Coordinates for New Delhi, India [lng, lat]
  zoom: 9, // Set the zoom level
});

const marker = new mapboxgl.Marker({ color: "red" }) 
  .setLngLat(listing.geometry.coordinates) // Ensure listing.geometry.coordinates is an array [lng, lat]
  .setPopup( 
    new mapboxgl.Popup({ offset: 25 }).setHTML( 
      `<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>` 
    ) 
  )
  .addTo(map);

