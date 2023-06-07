
// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  //Declare variable earthquakes 
  var earthquakes = new L.LayerGroup();

  // Only one base layer can be shown at a time.
    var baseMaps = {
      Street: street,
      Topography: topo
  };


    // Overlays that can be toggled on or off
    var overlayMaps = {
       Earthquakes: earthquakes
    };

    // Create a map object, and set the default layers.
    var myMap = L.map("map", {
       center: [37.09, -95.71],
       zoom: 7,
       layers: [street, earthquakes]
    });

    
  // Pass our map layers into our layer control.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 
    // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);

  function createFeatures( earthquakeData) {
    
     function getRadius( Magnitude) 
     {
       if ( Magnitude == 0 )
       {
          return 1
       }  
        
       return Magnitude * 4;
     }
    
     function getColor( depth) 
     {
        switch (true) 
        {
            
            case depth > 90:
              return "#ff4d4d";
              
            case depth > 70:
              return "#ff9933";

            case depth > 50:
                return "#ffd11a";

            case depth > 30:
                return "#ffdd99";

            case depth > 10:
                return "#ccff66";
            
            default:
                return "#b3ffb3"
        }
    }


    function styleInfo(feature)
    {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "black",
            radius: getRadius(feature.properties.mag),
            weight: 0.5
        }
    }
    
    L.geoJSON(earthquakeData,
      {
        pointToLayer: function(feature, latlng)
        {
            return L.circleMarker(latlng);
        },

        style: styleInfo,
    
        // Binding a popup
        onEachFeature: function (feature, layer) 
        {
          layer.bindPopup("Magnitude: " + feature.properties.mag + "<br />Location: " + feature.properties.place + "<br />Depth: " + feature.geometry.coordinates[2]);
        }
      }).addTo(earthquakes);
    
    // add to myMap
    earthquakes.addTo(myMap);
   
    //Create a legend that will provide context for your map data (correlation between and depth of earthquake)
    
    let legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function() 
    {
      div = L.DomUtil.create('div', 'info legend'),
      depth = [-10, 10, 30, 50, 70, 90];
      labels = [];
      legendHead = "<h4 style='text-align: center'>Earthquake Depth </h4>"
      div.innerHTML = legendHead
      for (let i = 0; i < depth.length; i++)
      {
        labels.push('<ul style="background-color:' + getColor(depth[i] + 1) + '"> <span>' + depth[i] +
       (depth[i + 1] ? ' &ndash;' + depth[i + 1] + '' : '+') + '</span> </ul>');
      }
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };
    
    // Adding the legend to the map
    legend.addTo(myMap);
   }
  });