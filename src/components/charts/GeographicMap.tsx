import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Box, Typography } from "@mui/material";
import { useI18n } from "../../context/I18nContext";
import { safelyAccessNestedProperty } from "../../utils/data-validation";
// Removing direct import of leaflet.css to avoid conflicts with Tailwind CSS v4

// Define interfaces for the component
interface Project {
  name: string;
  type: string;
  country: string;
  status: string;
  capacity: number;
  investmentCost: number;
  irr: number;
  location?: [number, number]; // [longitude, latitude]
  [key: string]: any;
}

interface GeographicMapProps {
  data: Project[];
}

interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  project: Project;
}

// Country coordinates mapping
interface CountryCoordinates {
  [country: string]: [number, number]; // [longitude, latitude]
}

// Fix Leaflet icon issues
// This is needed because Leaflet's default marker icons rely on files in specific locations
// Using type assertion to fix the _getIconUrl property error
if (L.Icon.Default.prototype) {
  // @ts-ignore - Leaflet typings don't include _getIconUrl but it exists at runtime
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

export const GeographicMap: React.FC<GeographicMapProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useI18n();

  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">{t("charts.noDataAvailable")}</Typography>
      </Box>
    );
  }

  // Center of the map (default view)
  const center: [number, number] = [42.5, 23.5];
  const zoom = 4;

  // Generate markers from project data
  const markers = useMemo<MapMarker[]>(() => {
    return data.map((project) => {
      // Use location from data or fallback to default coordinates
      const location = project.location || getDefaultLocation(project.country);

      return {
        id: project.name,
        longitude: location[0],
        latitude: location[1],
        project: project,
      };
    });
  }, [data]);

  // Custom marker icon based on project type
  const createCustomIcon = (project: Project): L.DivIcon => {
    const hasWindType = safelyAccessNestedProperty(project, "type", "").includes("Wind");
    const bgColorClass = hasWindType ? "bg-blue-500" : "bg-amber-500";
    const capacity = safelyAccessNestedProperty(project, "capacity", 0);

    return L.divIcon({
      className: "custom-icon",
      html: `<div class="${bgColorClass} w-6 h-6 rounded-full flex items-center justify-center">
        <span class="text-white text-xs font-bold">${capacity}</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers
          .filter(
            (marker) =>
              marker &&
              marker.latitude !== undefined &&
              marker.longitude !== undefined &&
              marker.project
          )
          .map((marker, index: number) => (
            <Marker
              key={marker.id || `marker-${index}`}
              position={[marker.latitude, marker.longitude]}
              icon={createCustomIcon(marker.project)}
              eventHandlers={{
                click: () => {
                  setSelectedProject(marker.project);
                },
              }}
            />
          ))}

        {selectedProject && (
          <LeafletPopup
            position={getProjectLocation(selectedProject).reverse() as [number, number]}
            // Using eventHandlers instead of onClose for react-leaflet v3+
            eventHandlers={{
              remove: () => setSelectedProject(null),
            }}
          >
            <div className="p-2">
              <h3 className="text-sm font-bold">{selectedProject.name}</h3>
              <p className="text-xs text-gray-600">{selectedProject.type}</p>
              <div className="mt-1 text-xs">
                <div className="gap-x-2 grid grid-cols-2">
                  <span className="text-gray-500">Capacity:</span>
                  <span>{selectedProject.capacity} MW</span>

                  <span className="text-gray-500">Investment:</span>
                  <span>€{selectedProject.investmentCost}M</span>

                  <span className="text-gray-500">IRR:</span>
                  <span>{Math.round(selectedProject.irr * 100)}%</span>

                  <span className="text-gray-500">Status:</span>
                  <span>{selectedProject.status}</span>
                </div>
              </div>
            </div>
          </LeafletPopup>
        )}
      </MapContainer>
    </motion.div>
  );
};

// Helper function to get default coordinates based on country
function getDefaultLocation(country: string): [number, number] {
  const countryCoordinates: CountryCoordinates = {
    Romania: [26.1025, 44.4268],
    "N.Macedonia": [21.7453, 41.6086],
    Bulgaria: [23.3219, 42.6977],
    Serbia: [20.4582, 44.7866],
    Greece: [23.7275, 37.9838],
  };

  return countryCoordinates[country] || [23.5, 42.5]; // Default to central balkans
}

// Helper function to get project location
function getProjectLocation(project: Project): [number, number] {
  return project.location || getDefaultLocation(project.country);
}
