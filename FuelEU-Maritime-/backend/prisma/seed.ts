// prisma/seed.ts
/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock KPI dataset into database");

  // Clear existing data to avoid duplicates (optional)
  await prisma.route.deleteMany();

  // Insert new mock routes
  await prisma.route.createMany({
    data: [
      {
        route_id: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghg_intensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        is_baseline: false,
      },
      {
        route_id: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghg_intensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        is_baseline: false,
      },
      {
        route_id: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghg_intensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        is_baseline: false,
      },
      {
        route_id: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghg_intensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        is_baseline: true, // ✅ set one route as baseline
      },
      {
        route_id: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghg_intensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        is_baseline: false,
      },
    ],
  });

  console.log("✅ Mock data seeded successfully!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Error seeding data:", err);
    await prisma.$disconnect();
    process.exit(1);
  });