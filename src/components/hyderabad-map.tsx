"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import BlurFade from "./magicui/blur-fade";

interface HyderabadMapProps {
  delay?: number;
}

type PlaceType = "historic" | "landmark" | "personal" | "food";

// Hyderabad landmarks plus the places that are mine
const locations: Record<string, { name: string; description: string; coordinates: [number, number]; type: PlaceType }> = {
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
  "Hussain Sagar": {
    name: "Hussain Sagar",
    description: "Heart-shaped lake at the center of the city, with the Buddha statue.",
    coordinates: [17.4239, 78.4738],
    type: "landmark",
  },
  "HITEC City": {
    name: "HITEC City",
    description: "The city's IT and tech hub.",
    coordinates: [17.447, 78.3778],
    type: "landmark",
  },
  "RMZ Spire": {
    name: "RMZ Spire",
    description: "Where I work, building SAP integrations at Innovapptive.",
    coordinates: [17.43298, 78.38448],
    type: "personal",
  },
  "Balapur Ganesh": {
    name: "Balapur Ganesh",
    description: "Home of the famous Ganesh Chaturthi laddu auction.",
    coordinates: [17.3085, 78.5053],
    type: "personal",
  },
  "CVR College of Engineering": {
    name: "CVR College of Engineering",
    description: "Where I did my B.Tech in Computer Science (2019–2023).",
    coordinates: [17.19656, 78.59863],
    type: "personal",
  },
  "Nimrah Cafe": {
    name: "Nimrah Cafe",
    description: "Irani chai and Osmania biscuits right next to Charminar.",
    coordinates: [17.36139, 78.47429],
    type: "food",
  },
  "Cafe Bahar": {
    name: "Cafe Bahar",
    description: "My favourite biryani, at Basheerbagh. Serving since 1973.",
    coordinates: [17.3998, 78.4779],
    type: "food",
  },
  "Grand Hotel": {
    name: "Grand Hotel",
    description: "Abids landmark since 1935, one of the city's oldest biryani spots.",
    coordinates: [17.38874, 78.47727],
    type: "food",
  },
  "Meridian": {
    name: "Meridian",
    description: "Panjagutta favourite for biryani and mirchi ka salan.",
    coordinates: [17.42096, 78.45513],
    type: "food",
  },
};

const TYPE_STYLES: Record<PlaceType, { color: string; label: string }> = {
  historic: { color: "#8eb1c2", label: "Historic" },
  landmark: { color: "#a7c8d4", label: "Landmarks" },
  personal: { color: "#4f7a8c", label: "My places" },
  food: { color: "#c9a46b", label: "Food" },
};

// Frame every pin, wherever the list puts them
const bounds = L.latLngBounds(Object.values(locations).map((l) => l.coordinates));

// Custom markers using the site's brand color
const createMarkerIcon = (type: PlaceType) => {
  const color = TYPE_STYLES[type].color;
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
              bounds={bounds}
              boundsOptions={{ padding: [30, 30] }}
              maxZoom={18}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
                maxNativeZoom={16}
                maxZoom={18}
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={18}
              />
              {Object.entries(locations).map(([key, location]) => (
                <Marker
                  key={key}
                  position={location.coordinates}
                  icon={createMarkerIcon(location.type)}
                >
                  <Popup className="custom-popup">
                    <div className="font-semibold text-primary">{location.name}</div>
                    <div className="text-sm text-muted-foreground">{location.description}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {Object.values(TYPE_STYLES).map(({ color, label }) => (
              <div key={label} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-muted-foreground whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

export default HyderabadMap;
