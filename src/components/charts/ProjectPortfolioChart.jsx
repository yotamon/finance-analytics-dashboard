import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ProjectPortfolioChart({ data }) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="capacity" name="Capacity" type="number" unit=" MW" label={{ value: "Capacity (MW)", position: "insideBottomRight", offset: -5 }} />
				<YAxis dataKey="investmentCost" name="Investment" unit="M" label={{ value: "Investment (€M)", angle: -90, position: "insideLeft" }} />
				<ZAxis dataKey="irr" name="IRR" range={[60, 400]} unit="%" />
				<Tooltip
					cursor={{ strokeDasharray: "3 3" }}
					formatter={(value, name) => {
						if (name === "IRR") return [`${(value * 100).toFixed(1)}%`, "IRR"];
						if (name === "Investment") return [`€${value}M`, name];
						return [value + " MW", name];
					}}
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							const project = payload[0].payload;
							return (
								<div className="bg-white p-2 border rounded shadow-sm">
									<p className="font-medium text-sm">{project.name}</p>
									<p className="text-xs text-gray-600">
										{project.type} | {project.country}
									</p>
									<div className="text-xs mt-2">
										<div>Capacity: {project.capacity} MW</div>
										<div>Investment: €{project.investmentCost}M</div>
										<div>IRR: {(project.irr * 100).toFixed(1)}%</div>
									</div>
								</div>
							);
						}
						return null;
					}}
				/>
				<Legend />
				<Scatter name="Wind Projects" data={data.filter(p => p.type.includes("Wind"))} fill="#3b82f6" shape="circle" />
				<Scatter name="Solar Projects" data={data.filter(p => p.type.includes("Solar"))} fill="#f59e0b" shape="circle" />
			</ScatterChart>
		</ResponsiveContainer>
	);
}
