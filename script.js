//comment, I already know.

document.addEventListener('DOMContentLoaded', function() {

    //Tell the user we're stating
    console.log("Starting to create the map...");

    //CREATE THE MAP
    //L.map() creates a new map
    // 'map' is the ID of our div from HTML
    var map = L.map('map');

    // set the initial view (center and zoom level)
    //[latitude, longitude], zoom level
    map.setView([31.4432234, 34.360007], 11);

    // add a basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);


    //add a marker
    var marker = L.marker([31.4432234, 34.360007]).addTo(map);

    //add a popup marker
    marker.bindPopup("<b>Hello!</b><br>This is Gaza Strip, Palestine.");

    //Tell the user we're done
    console.log("Map Created Successfully!");
    console.log("Try clicking on the Marker!");
});