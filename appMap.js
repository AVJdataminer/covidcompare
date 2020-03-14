let API_KEY_MAPBOX = 'pk.eyJ1IjoicmJyYWNjbyIsImEiOiJjazZ6Z3c1c2IwbnNkM21tdmg0eGhmeWJkIn0.IfYSBvXVOMUlmKm8zm-XZA'
// let dataCovidState = getJSON('data/dataCovidState.json', data => dataCovidState = data);
let [lat, long] = [37.8, -96]
let zoomLevel = 5
//'mapbox/satellite-v9'
let tileProvider = 'mapbox/streets-v11'
let map = L.map('map').setView([lat, long], zoomLevel);
mergeCovidStateData()
calcRiskAllStates()
let mapAttribution = `<a href="https://www.defineamerican.com" target="_blank">Define American</a> |
                    'Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, 
                    <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, Imagery © 
                    <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>'`

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: mapAttribution,
    maxZoom: 18,
    id: tileProvider,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY_MAPBOX,
}).addTo(map);

let centroids = getCountyCentroids()

function countyStyle(feature) {
    return {
        fillColor: getCountyColor(feature.properties),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var countyLayer = L.geoJson(countyData, 
    { 
        style:countyStyle, 
        onEachFeature:onEachCounty
    }).addTo(map);

var stateLayer  = L.geoJson(statesData, 
    { 
        style:stateStyle, 
        onEachFeature:onEachState
    }).addTo(map);

var overlayMaps = {
    "Counties": countyLayer,
    "States": stateLayer,
}

L.control.layers(overlayMaps).addTo(map);

var info = L.control();
function highlightCounty(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.updateCounty(layer.feature.properties);
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.updateState();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.updateState = function (props) {
    let title = props ? `<h3>${props.name}</h3>`:`<h3>Hover over a state</h3>`
    let body = props ? 
        `<b>Covid19 Cases</b><br/>
        ${props.CASES} cases<br/>
        ${props.population} people<br/>
        ${(props.CASES/(props.population/100000)).toFixed(2)} cases per 100000<br/>
        <b>Hospital Access</b><br>
        ${props.beds} hospital beds<br/>
        ${(props.beds/(props.population/100000)).toFixed(2)} beds per 100000<br/>
        <b>Relative Risk<br/></b>
        Local Risk: ${(100000*props.LOCALRISK).toFixed(3)}<br/>
        Nearby Risk: ${(100000*props.NEIGHBORRISK).toFixed(3)}<br/>
        Total Risk: ${(100000*props.TOTALRISK).toFixed(3)}<br/>
        <br>
        `
        : "<br/>"
        
    this._div.innerHTML = title + body

};

info.updateCounty = function (props) {
    cases = dataCovid[props.GEO_ID] || 0
    this._div.innerHTML = '<h4>Covid19 by County</h4>' +  (props ?
        `<b>${props.NAME} County </b><br />${props.POP} people<br/>${cases} cases`
        : 'Hover over a county');
};

info.addTo(map);



// for(let hospital of dataHospitals){
//     var circle = L.circle([hospital.Y, hospital.X], {
//         color: 'green',
//         fillColor: '#0f3',
//         fillOpacity: 0.5,
//         radius: 1
//     }).addTo(map);
// }