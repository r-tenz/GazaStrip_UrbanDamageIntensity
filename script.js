const POINT_COLOR = '#ff4d00'; 
const GLOW_COLOR = '#ffca3a'; 


const GOVERNORATES = {
    'north-gaza': { 
        name: 'North Gaza', 
        center: [31.55, 34.50], 
        zoom: 12,
        stat: '25.61% of total damage',
        desc: 'Sustained significant structural impact'
    },
    'gaza': { 
        name: 'Gaza City', 
        center: [31.50, 34.45], 
        zoom: 12,
        stat: '31.87% of total damage',
        desc: 'Highest level of detected impact'
    },
    'deir-al-balah': { 
        name: 'Deir al-Balah', 
        center: [31.42, 34.35], 
        zoom: 12,
        stat: '8.69% of total damage',
        desc: 'Moderate concentration of structural damage'
    },
    'khan-yunis': { 
        name: 'Khan Yunis', 
        center: [31.34, 34.30], 
        zoom: 12,
        stat: '31.73% of total damage',
        desc: 'Significant damage recorded in urban centers'
    },
    'rafah': { 
        name: 'Rafah', 
        center: [31.28, 34.25], 
        zoom: 12,
        stat: '2.10% of total damage',
        desc: 'Lowest proportion of total assessment'
    }
};



let map, damageLayer, boundaryLayer, annotationLayer;
let activePopup = null; 


document.addEventListener('DOMContentLoaded', async () => {
    try {
        initMap();
        setupUIListeners();
        await loadData();
    } catch (err) { 
        console.error("Map Initialization Error:", err); 
    } finally { 
        hideLoader(); 
    }
});



function initMap() {
    map = L.map('map', { 
        zoomControl: false, 
        attributionControl: false, 
        preferCanvas: true 
    }).setView([31.4, 34.4], 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    damageLayer = L.layerGroup().addTo(map);
    boundaryLayer = L.layerGroup().addTo(map);
    annotationLayer = L.layerGroup().addTo(map);

    const style = document.createElement('style');
    style.textContent = `
        .leaflet-zoom-animated canvas { 
            filter: drop-shadow(0 0 2.5px ${GLOW_COLOR}); 
        }
    
        .editorial-popup .leaflet-popup-content-wrapper {
            background: rgba(15, 15, 15, 0.95);
            color: #ddd;
            border-left: 3px solid ${POINT_COLOR};
            border-radius: 4px;
            padding: 5px;
            backdrop-filter: blur(8px);
        }
        .editorial-popup .leaflet-popup-tip { background: rgba(15, 15, 15, 0.95); }
        .pop-title { color: white; font-weight: bold; font-size: 14px; display: block; margin-bottom: 4px; }
        .pop-stat { color: ${POINT_COLOR}; font-weight: bold; }
        .pop-desc { font-size: 11px; line-height: 1.3; display: block; }
    `;
    document.head.appendChild(style);
}




function showGovernorateLabel(id) {
    const gov = GOVERNORATES[id];
    if (!gov) return;

    if (activePopup) map.closePopup(activePopup);

    const content = `
        <div class="editorial-box">
            <span class="pop-title">${gov.name}</span>
            <span class="pop-desc">${gov.desc}</span>
            <span class="pop-stat">${gov.stat}</span>
        </div>
    `;

    activePopup = L.popup({
        offset: [0, -10],
        closeButton: false,
        className: 'editorial-popup'
    })
    .setLatLng(gov.center)
    .setContent(content)
    .openOn(map);
}

function renderBoundaries(geojsonData) {
    L.geoJSON(geojsonData, {
        style: {
            color: 'rgba(255, 255, 255, 0.9)', 
            weight: 2, 
            fillOpacity: 0.1, 
            dashArray: '5, 5'
        },
        onEachFeature: (feature, layer) => {
            layer.on('mouseover', function() {
                this.setStyle({ fillOpacity: 0.2, color: '#fff' });
                const name = (feature.properties.ADM1_EN || "").toLowerCase().replace(/\s+/g, '-');
                showGovernorateLabel(name);
            });

            layer.on('mouseout', function() {
                this.setStyle({ fillOpacity: 0.1, color: 'rgba(255, 255, 255, 0.9)' });
                if (activePopup) map.closePopup(activePopup);
            });
        }
    }).addTo(boundaryLayer);
}

function renderPoints(data) {
    damageLayer.clearLayers();
    L.geoJSON(data, {
        pointToLayer: (f, ll) => L.circleMarker(ll, {
            radius: 1.2, 
            fillColor: POINT_COLOR, 
            color: POINT_COLOR, 
            weight: 0, 
            fillOpacity: 0.9, 
            interactive: false 
        })
    }).addTo(damageLayer);
}

async function loadData() {
    try {
        const [pRes, bRes] = await Promise.all([
            fetch('data/Points_Gaza_Damage.geojson').catch(() => null),
            fetch('data/Gaza_Admin.geojson').catch(() => null)
        ]);
        
        if (bRes && bRes.ok) renderBoundaries(await bRes.json());
        
        if (pRes && pRes.ok) {
            renderPoints(await pRes.json());
            document.getElementById('pointsCount').textContent = "88,869";
        }
    } catch (e) { 
        console.error(e); 
        document.getElementById('pointsCount').textContent = "88,869";
    }
}

function setupUIListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.governorate;
            const gov = GOVERNORATES[id];
            
            if (gov) {
                map.flyTo(gov.center, gov.zoom, { duration: 1.5 });
                setTimeout(() => showGovernorateLabel(id), 1200); 
                
                document.getElementById('currentView').textContent = gov.name;
                document.getElementById('pointsCount').textContent = "88,869";
                
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        map.flyTo([31.4, 34.4], 11);
        if (activePopup) map.closePopup(activePopup);
        document.getElementById('pointsCount').textContent = "88,869";
        document.getElementById('currentView').textContent = "All Gaza";
    });
}

function hideLoader() {
    const l = document.getElementById('loading');
    if (l) { 
        l.style.opacity = '0'; 
        setTimeout(() => l.style.display = 'none', 500); 
    }
}