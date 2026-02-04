/**
 * Map Integration Module
 * Uses Leaflet.js for interactive campus maps
 * RVCE Campus Coordinates: 12.9237° N, 77.4987° E
 */

class MapManager {
    constructor() {
        this.campusCenter = [12.9237, 77.4987]; // RVCE Campus
        this.defaultZoom = 17;
        this.maps = {};
        this.markers = {};
        this.selectedLocation = null;
    }

    /**
     * Initialize a map in a container
     */
    initMap(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Map container not found:', containerId);
            return null;
        }

        // Create map
        const map = L.map(containerId).setView(
            options.center || this.campusCenter,
            options.zoom || this.defaultZoom
        );

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Store map reference
        this.maps[containerId] = map;

        console.log('✅ Map initialized:', containerId);
        return map;
    }

    /**
     * Create a location picker map
     */
    createLocationPicker(containerId, onLocationSelect) {
        const map = this.initMap(containerId, { zoom: 16 });
        if (!map) return;

        let marker = null;

        // Add click handler
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;

            // Remove existing marker
            if (marker) {
                map.removeLayer(marker);
            }

            // Add new marker
            marker = L.marker([lat, lng], {
                draggable: true
            }).addTo(map);

            // Update selected location
            this.selectedLocation = { lat, lng };

            // Callback
            if (onLocationSelect) {
                onLocationSelect({ lat, lng });
            }

            // Make marker draggable
            marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                this.selectedLocation = { lat: position.lat, lng: position.lng };
                if (onLocationSelect) {
                    onLocationSelect({ lat: position.lat, lng: position.lng });
                }
            });
        });

        return map;
    }

    /**
     * Display a location on the map
     */
    showLocation(containerId, location, popupText = '') {
        const map = this.initMap(containerId);
        if (!map || !location) return;

        const { lat, lng } = location;

        // Add marker
        const marker = L.marker([lat, lng]).addTo(map);

        if (popupText) {
            marker.bindPopup(popupText).openPopup();
        }

        // Center map on location
        map.setView([lat, lng], this.defaultZoom);

        this.markers[containerId] = marker;
    }

    /**
     * Get location name from coordinates (reverse geocoding)
     */
    async getLocationName(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || 'Unknown Location';
        } catch (error) {
            console.error('Error getting location name:', error);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    /**
     * Format location for display
     */
    formatLocation(location) {
        if (!location) return 'No location specified';
        return `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }

    /**
     * Clear all markers from a map
     */
    clearMarkers(containerId) {
        const map = this.maps[containerId];
        if (!map) return;

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    /**
     * Destroy a map instance
     */
    destroyMap(containerId) {
        const map = this.maps[containerId];
        if (map) {
            map.remove();
            delete this.maps[containerId];
        }
    }
}

// Initialize map manager
const mapManager = new MapManager();

// Make globally accessible
window.mapManager = mapManager;

console.log('✓ Map Integration module loaded');
