import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, ZoomControl } from "react-leaflet";
import L from "leaflet";
// Removing direct import of leaflet.css to avoid conflicts with Tailwind CSS v4
import { useState } from "react";

// Fix Leaflet icon issues
// This is needed because Leaflet's default marker icons rely on files in specific locations
// Alternatively, you can put these images in your public folder
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

export const GeographicMap = ({ data }) => {
	const [selectedProject, setSelectedProject] = useState(null);

	// Center of the map (default view)
	const center = [42.5, 23.5];
	const zoom = 4;

	// Generate markers from project data
	const markers = useMemo(() => {
		return data.map(project => {
			// Use location from data or fallback to default coordinates
			const location = project.location || getDefaultLocation(project.country);

			return {
				id: project.name,
				longitude: location[0],
				latitude: location[1],
				project: project
			};
		});
	}, [data]);

	// Custom marker icon based on project type
	const createCustomIcon = project => {
		return L.divIcon({
			className: "custom-icon",
			html: `<div class="${project.type.includes("Wind") ? "bg-blue-500" : "bg-amber-500"} w-6 h-6 rounded-full flex items-center justify-center">
				<span class="text-white text-xs font-bold">${project.capacity}</span>
			</div>`,
			iconSize: [24, 24],
			iconAnchor: [12, 24]
		});
	};

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full h-full">
			<MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }} zoomControl={false}>
				<ZoomControl position="topright" />

				<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

				{markers.map(marker => (
					<Marker
						key={marker.id}
						position={[marker.latitude, marker.longitude]}
						icon={createCustomIcon(marker.project)}
						eventHandlers={{
							click: () => {
								setSelectedProject(marker.project);
							}
						}}
					/>
				))}

				{selectedProject && (
					<LeafletPopup position={getProjectLocation(selectedProject).reverse()} onClose={() => setSelectedProject(null)}>
						<div className="p-2">
							<h3 className="font-bold text-sm">{selectedProject.name}</h3>
							<p className="text-xs text-gray-600">{selectedProject.type}</p>
							<div className="text-xs mt-1">
								<div className="grid grid-cols-2 gap-x-2">
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
function getDefaultLocation(country) {
	const countryCoordinates = {
		Romania: [26.1025, 44.4268],
		"N.Macedonia": [21.7453, 41.6086],
		Bulgaria: [23.3219, 42.6977],
		Serbia: [20.4582, 44.7866],
		Greece: [23.7275, 37.9838]
	};

	return countryCoordinates[country] || [23.5, 42.5]; // Default to central balkans
}

// Helper function to get project location
function getProjectLocation(project) {
	return project.location || getDefaultLocation(project.country);
}
