"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import BlurFade from "./magicui/blur-fade";

interface HyderabadMapProps {
  delay?: number;
}

// Starter set of well-known Hyderabad landmarks with real coordinates.
// Edit this list to your own real favorite spots.
const locations = {
  "Charminar": {
    name: "Charminar",
    description: "The city's iconic 16th-century monument and mosque.",
    coordinates: [17.3616, 78.4747],
    type: "historic",
  },
  "Golconda Fort": {
    name: "Golconda Fort",
    description: "16th-century fort complex, once famous for diamond trade.",
    coordinates: [17.3848, 78.4033],
    type: "historic",
  },
  "Chowmahalla Palace": {
    name: "Chowmahalla Palace",
    description: "Former seat of the Nizams of Hyderabad.",
    coordinates: [17.358, 78.4717],
    type: "historic",
  },
  "Hussain Sagar": {
    name: "Hussain Sagar",
    description: "Heart-shaped lake at the center of the city, with the Buddha statue.",
    coordinates: [17.4239, 78.4738],
    type: "urban",
  },
  "HITEC City": {
    name: "HITEC City",
    description: "The city's IT and tech hub.",
    coordinates: [17.447, 78.3778],
    type: "urban",
  },
  "Ramoji Film City": {
    name: "Ramoji Film City",
    description: "One of the world's largest film studio complexes.",
    coordinates: [17.3112, 78.6824],
    type: "urban",
  },
};

// Custom markers using the site's brand color
const createMarkerIcon = (type: "historic" | "urban") => {
  const color = type === "historic" ? "#8eb1c2" : "#a7c8d4";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"/>
      <circle fill="#fff" cx="12" cy="12" r="5"/>
    </svg>
  `;
  return new L.DivIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
};

export const HyderabadMap = ({ delay = 0 }: HyderabadMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <BlurFade delay={delay}>
        <div className="flex justify-center">
          <div className="h-96 flex items-center justify-center w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </BlurFade>
    );
  }

  return (
    <BlurFade delay={delay}>
      <div className="flex justify-center">
        <div className="flex flex-col items-center space-y-6 w-full">
          <div className="relative w-full h-96 rounded-xl overflow-hidden border border-border/30 shadow-lg">
            <MapContainer
              center={[17.39, 78.47]}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {Object.entries(locations).map(([key, location]) => (
                <Marker
                  key={key}
                  position={location.coordinates as [number, number]}
                  icon={createMarkerIcon(location.type as "historic" | "urban")}
                >
                  <Popup className="custom-popup">
                    <div className="font-semibold text-primary">{location.name}</div>
                    <div className="text-sm text-muted-foreground">{location.description}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#8eb1c2" }}></div>
              <span className="text-muted-foreground">Historic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#a7c8d4" }}></div>
              <span className="text-muted-foreground">Urban</span>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

export default HyderabadMap;
