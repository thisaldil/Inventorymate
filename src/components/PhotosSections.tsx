import { useEffect, useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MAKES = [
  "TOYOTA","NISSAN","MAZDA","MITSUBISHI","HONDA","SUZUKI","SUBARU","ISUZU",
  "DAIHATSU","MITSUOKA","LEXUS","ALFAROMEO","ASTON MARTIN","AUDI","BENTLEY",
  "BMW","BMW ALPINA","CADILLAC","CHEVROLET","CHRYSLER","CITROEN","DAIMLER",
  "DODGE","FERRARI","FIAT","FORD","FRUEHAUF","GM","GMC","HINO","HITACHI",
  "HUMMER","HYUNDAI","ISEKI","JAGUAR","JEEP","KAWASAKI","KOMATSU","KUBOTA",
  "LAMBORGHINI","LANCIA","LAND ROVER","LINCOLN","LOTUS","MASERATI",
  "MERCEDES BENZ","MINI","MORGAN","PEUGEOT","PONTIAC","PORSCHE","RENAULT",
  "ROLLS ROYCE","ROVER","SAAB","SMART","TADANO","TCM","TESLA","TRAILER",
  "VOLKSWAGEN","VOLVO","WINNEBAGO","YAMAHA","YANMAR","OTHERS",
];

const MODELS_BY_MAKE = {
  TOYOTA: ["Corolla","Camry","Yaris","Aqua","Vitz","RAV4","Harrier","Land Cruiser","Prado","Hilux","Hiace","Crown","Premio","Allion","Axio"],
  NISSAN: ["Note","March","Serena","X-Trail","Skyline","Fuga","Elgrand","Juke","Dayz","Tiida","Bluebird Sylphy","NV350 Caravan"],
  MAZDA: ["Demio (2)","Axela (3)","Atenza (6)","CX-3","CX-5","CX-8","Roadster (MX-5)","Bongo"],
  MITSUBISHI: ["Outlander","RVR","Pajero","Delica D:5","EK Wagon","Lancer","Mirage"],
  HONDA: ["Fit (Jazz)","Civic","Accord","Vezel (HR-V)","CR-V","N-BOX","Freed","Stepwgn"],
  SUZUKI: ["Swift","Alto","Wagon R","Hustler","Spacia","Jimny","Every"],
  SUBARU: ["Impreza","Legacy","Forester","XV","Levorg","Outback","WRX"],
  ISUZU: ["Elf","Forward","Giga","D-MAX","MU-X"],
  DAIHATSU: ["Mira","Tanto","Move","Hijet","Rocky","Copen"],
  MITSUOKA: ["Viewt","Himiko","Galue"],
  LEXUS: ["IS","ES","GS","LS","CT","RX","NX","UX","LX","GX"],
  ALFAROMEO: ["Giulietta","Giulia","Stelvio","MiTo"],
  "ASTON MARTIN": ["Vantage","DB9","DB11","Rapide"],
  AUDI: ["A3","A4","A6","A8","Q2","Q3","Q5","Q7","TT"],
  BENTLEY: ["Continental GT","Flying Spur","Bentayga"],
  BMW: ["1 Series","3 Series","5 Series","7 Series","X1","X3","X5","i3","i8"],
  "BMW ALPINA": ["B3","B5","B7","D3"],
  CADILLAC: ["CTS","ATS","Escalade","XT5"],
  CHEVROLET: ["Camaro","Corvette","Cruze","Trailblazer"],
  CHRYSLER: ["300","Pacifica","PT Cruiser"],
  CITROEN: ["C3","C4","C5","Berlingo","DS3"],
  DAIMLER: ["XJ","Super V8"],
  DODGE: ["Charger","Challenger","Durango","Ram"],
  FERRARI: ["458","488","California","F8","Portofino"],
  FIAT: ["500","Panda","Punto","500X"],
  FORD: ["Focus","Fiesta","Mustang","Explorer","Ranger"],
  FRUEHAUF: ["Trailer"],
  GM: ["Sierra","Silverado"],
  GMC: ["Sierra","Yukon","Acadia","Terrain"],
  HINO: ["Dutro","Ranger","Profia"],
  HITACHI: ["Excavator","Wheel Loader"],
  HUMMER: ["H1","H2","H3"],
  HYUNDAI: ["i10","i20","Elantra","Sonata","Tucson","Santa Fe"],
  ISEKI: ["Tractor","Combine"],
  JAGUAR: ["XE","XF","XJ","F-PACE","E-PACE","F-TYPE"],
  JEEP: ["Wrangler","Cherokee","Grand Cherokee","Renegade","Compass"],
  KAWASAKI: ["Ninja 250","Ninja 400","Z1000","Versys"],
  KOMATSU: ["Excavator","Forklift","Bulldozer"],
  KUBOTA: ["Tractor","Combine","Excavator"],
  LAMBORGHINI: ["Huracán","Aventador","Urus","Gallardo"],
  LANCIA: ["Ypsilon","Delta","Thema"],
  "LAND ROVER": ["Defender","Discovery","Range Rover","Range Rover Sport","Evoque","Velar"],
  LINCOLN: ["MKZ","Navigator","Aviator","Continental"],
  LOTUS: ["Elise","Exige","Evora","Emira"],
  MASERATI: ["Ghibli","Quattroporte","Levante","GranTurismo"],
  "MERCEDES BENZ": ["A-Class","C-Class","E-Class","S-Class","GLA","GLC","GLE","GLS","V-Class"],
  MINI: ["One","Cooper","Clubman","Countryman"],
  MORGAN: ["4/4","Plus 4","Plus 8"],
  PEUGEOT: ["208","308","508","2008","3008","5008"],
  PONTIAC: ["G6","G8","Firebird","Trans Am"],
  PORSCHE: ["911","Cayman","Boxster","Panamera","Macan","Cayenne","Taycan"],
  RENAULT: ["Clio","Megane","Talisman","Captur","Kadjar"],
  "ROLLS ROYCE": ["Phantom","Ghost","Wraith","Dawn","Cullinan"],
  ROVER: ["25","45","75","Mini (classic)"],
  SAAB: ["9-3","9-5","900"],
  SMART: ["fortwo","forfour"],
  TADANO: ["Rough Terrain Crane","All Terrain Crane"],
  TCM: ["Forklift","Reach Truck"],
  TESLA: ["Model S","Model 3","Model X","Model Y","Cybertruck"],
  TRAILER: ["Flatbed","Box","Reefer"],
  VOLKSWAGEN: ["Polo","Golf","Passat","Tiguan","Touareg","Transporter"],
  VOLVO: ["S60","S90","V60","V90","XC40","XC60","XC90"],
  WINNEBAGO: ["Brave","Travato","View"],
  YAMAHA: ["YZF-R3","MT-07","MT-09","NMAX"],
  YANMAR: ["Tractor","Combine Harvester"],
  OTHERS: ["Other"],
};

// Comprehensive spare parts by category
const SPARE_PARTS_CATEGORIES = {
  "Engine & Drivetrain": [
    { name: "Engine Assembly (Complete)", partNo: "ENG-001", status: "In Stock" },
    { name: "Engine Block", partNo: "ENG-002", status: "In Stock" },
    { name: "Cylinder Head", partNo: "ENG-003", status: "In Stock" },
    { name: "Cylinder Head Gasket", partNo: "ENG-004", status: "In Stock" },
    { name: "Camshaft", partNo: "ENG-005", status: "In Stock" },
    { name: "Camshaft Bearing", partNo: "ENG-006", status: "In Stock" },
    { name: "Crankshaft", partNo: "ENG-007", status: "Limited" },
    { name: "Crankshaft Bearing (Main)", partNo: "ENG-008", status: "In Stock" },
    { name: "Crankshaft Bearing (Rod)", partNo: "ENG-009", status: "In Stock" },
    { name: "Piston", partNo: "ENG-010", status: "In Stock" },
    { name: "Piston Ring Set", partNo: "ENG-011", status: "In Stock" },
    { name: "Piston Pin / Gudgeon Pin", partNo: "ENG-012", status: "In Stock" },
    { name: "Connecting Rod", partNo: "ENG-013", status: "In Stock" },
    { name: "Connecting Rod Bearing", partNo: "ENG-014", status: "In Stock" },
    { name: "Timing Belt", partNo: "ENG-015", status: "In Stock" },
    { name: "Timing Chain", partNo: "ENG-016", status: "In Stock" },
    { name: "Timing Tensioner", partNo: "ENG-017", status: "In Stock" },
    { name: "Timing Idler Pulley", partNo: "ENG-018", status: "In Stock" },
    { name: "Valve (Intake)", partNo: "ENG-019", status: "In Stock" },
    { name: "Valve (Exhaust)", partNo: "ENG-020", status: "In Stock" },
    { name: "Valve Spring", partNo: "ENG-021", status: "In Stock" },
    { name: "Valve Stem Seal", partNo: "ENG-022", status: "In Stock" },
    { name: "Valve Lifter / Tappet", partNo: "ENG-023", status: "In Stock" },
    { name: "Rocker Arm", partNo: "ENG-024", status: "In Stock" },
    { name: "Rocker Arm Shaft", partNo: "ENG-025", status: "Limited" },
    { name: "Push Rod", partNo: "ENG-026", status: "In Stock" },
    { name: "Oil Pan / Sump", partNo: "ENG-027", status: "In Stock" },
    { name: "Oil Pump", partNo: "ENG-028", status: "In Stock" },
    { name: "Oil Pump Pickup Tube", partNo: "ENG-029", status: "In Stock" },
    { name: "Balancer / Harmonic Damper", partNo: "ENG-030", status: "In Stock" },
    { name: "Flywheel", partNo: "ENG-031", status: "In Stock" },
    { name: "Flex Plate", partNo: "ENG-032", status: "In Stock" },
    { name: "Engine Mount (Left)", partNo: "ENG-033", status: "In Stock" },
    { name: "Engine Mount (Right)", partNo: "ENG-034", status: "In Stock" },
    { name: "Transmission Mount", partNo: "ENG-035", status: "In Stock" },
  ],
  "Transmission & Gearbox": [
    { name: "Manual Transmission Assembly", partNo: "TRN-001", status: "Limited" },
    { name: "Automatic Transmission Assembly", partNo: "TRN-002", status: "Limited" },
    { name: "CVT Assembly", partNo: "TRN-003", status: "On Order" },
    { name: "Clutch Disc", partNo: "TRN-004", status: "In Stock" },
    { name: "Clutch Pressure Plate", partNo: "TRN-005", status: "In Stock" },
    { name: "Clutch Release Bearing", partNo: "TRN-006", status: "In Stock" },
    { name: "Clutch Master Cylinder", partNo: "TRN-007", status: "In Stock" },
    { name: "Clutch Slave Cylinder", partNo: "TRN-008", status: "In Stock" },
    { name: "Gear Shift Fork", partNo: "TRN-009", status: "In Stock" },
    { name: "Synchronizer Ring", partNo: "TRN-010", status: "In Stock" },
    { name: "Gear Set (1st/2nd)", partNo: "TRN-011", status: "Limited" },
    { name: "Gear Set (3rd/4th)", partNo: "TRN-012", status: "Limited" },
    { name: "Output Shaft", partNo: "TRN-013", status: "In Stock" },
    { name: "Input Shaft", partNo: "TRN-014", status: "In Stock" },
    { name: "Transmission Filter", partNo: "TRN-015", status: "In Stock" },
    { name: "Torque Converter", partNo: "TRN-016", status: "Limited" },
    { name: "Driveshaft (Front)", partNo: "TRN-017", status: "In Stock" },
    { name: "Driveshaft (Rear)", partNo: "TRN-018", status: "In Stock" },
    { name: "CV Joint (Inner)", partNo: "TRN-019", status: "In Stock" },
    { name: "CV Joint (Outer)", partNo: "TRN-020", status: "In Stock" },
    { name: "CV Boot Kit", partNo: "TRN-021", status: "In Stock" },
    { name: "Differential Assembly (Front)", partNo: "TRN-022", status: "Limited" },
    { name: "Differential Assembly (Rear)", partNo: "TRN-023", status: "Limited" },
    { name: "Differential Bearing", partNo: "TRN-024", status: "In Stock" },
    { name: "Axle Shaft (Left)", partNo: "TRN-025", status: "In Stock" },
    { name: "Axle Shaft (Right)", partNo: "TRN-026", status: "In Stock" },
    { name: "Transfer Case Assembly", partNo: "TRN-027", status: "Limited" },
    { name: "Propeller Shaft", partNo: "TRN-028", status: "In Stock" },
    { name: "Universal Joint (U-Joint)", partNo: "TRN-029", status: "In Stock" },
  ],
  "Brakes": [
    { name: "Front Brake Disc / Rotor", partNo: "BRK-001", status: "In Stock" },
    { name: "Rear Brake Disc / Rotor", partNo: "BRK-002", status: "In Stock" },
    { name: "Front Brake Pad Set", partNo: "BRK-003", status: "In Stock" },
    { name: "Rear Brake Pad Set", partNo: "BRK-004", status: "In Stock" },
    { name: "Front Brake Drum", partNo: "BRK-005", status: "In Stock" },
    { name: "Rear Brake Drum", partNo: "BRK-006", status: "In Stock" },
    { name: "Brake Shoe Set (Front)", partNo: "BRK-007", status: "In Stock" },
    { name: "Brake Shoe Set (Rear)", partNo: "BRK-008", status: "In Stock" },
    { name: "Brake Caliper (Front Left)", partNo: "BRK-009", status: "In Stock" },
    { name: "Brake Caliper (Front Right)", partNo: "BRK-010", status: "In Stock" },
    { name: "Brake Caliper (Rear Left)", partNo: "BRK-011", status: "In Stock" },
    { name: "Brake Caliper (Rear Right)", partNo: "BRK-012", status: "In Stock" },
    { name: "Brake Master Cylinder", partNo: "BRK-013", status: "In Stock" },
    { name: "Brake Wheel Cylinder", partNo: "BRK-014", status: "In Stock" },
    { name: "Brake Booster / Servo", partNo: "BRK-015", status: "In Stock" },
    { name: "ABS Module / ECU", partNo: "BRK-016", status: "Limited" },
    { name: "ABS Wheel Speed Sensor (Front)", partNo: "BRK-017", status: "In Stock" },
    { name: "ABS Wheel Speed Sensor (Rear)", partNo: "BRK-018", status: "In Stock" },
    { name: "Brake Hose (Front)", partNo: "BRK-019", status: "In Stock" },
    { name: "Brake Hose (Rear)", partNo: "BRK-020", status: "In Stock" },
    { name: "Brake Line / Pipe Set", partNo: "BRK-021", status: "In Stock" },
    { name: "Brake Fluid Reservoir", partNo: "BRK-022", status: "In Stock" },
    { name: "Parking Brake Cable", partNo: "BRK-023", status: "In Stock" },
    { name: "Caliper Repair Kit", partNo: "BRK-024", status: "In Stock" },
  ],
  "Suspension & Steering": [
    { name: "Front Shock Absorber (Left)", partNo: "SUS-001", status: "In Stock" },
    { name: "Front Shock Absorber (Right)", partNo: "SUS-002", status: "In Stock" },
    { name: "Rear Shock Absorber (Left)", partNo: "SUS-003", status: "In Stock" },
    { name: "Rear Shock Absorber (Right)", partNo: "SUS-004", status: "In Stock" },
    { name: "Front Coil Spring (Left)", partNo: "SUS-005", status: "In Stock" },
    { name: "Front Coil Spring (Right)", partNo: "SUS-006", status: "In Stock" },
    { name: "Rear Coil Spring (Left)", partNo: "SUS-007", status: "In Stock" },
    { name: "Rear Coil Spring (Right)", partNo: "SUS-008", status: "In Stock" },
    { name: "Leaf Spring (Rear)", partNo: "SUS-009", status: "In Stock" },
    { name: "Leaf Spring Bushing", partNo: "SUS-010", status: "In Stock" },
    { name: "Strut Assembly (Front Left)", partNo: "SUS-011", status: "In Stock" },
    { name: "Strut Assembly (Front Right)", partNo: "SUS-012", status: "In Stock" },
    { name: "Strut Mount", partNo: "SUS-013", status: "In Stock" },
    { name: "Strut Bearing", partNo: "SUS-014", status: "In Stock" },
    { name: "Upper Control Arm (Left)", partNo: "SUS-015", status: "In Stock" },
    { name: "Upper Control Arm (Right)", partNo: "SUS-016", status: "In Stock" },
    { name: "Lower Control Arm (Left)", partNo: "SUS-017", status: "In Stock" },
    { name: "Lower Control Arm (Right)", partNo: "SUS-018", status: "In Stock" },
    { name: "Control Arm Bushing", partNo: "SUS-019", status: "In Stock" },
    { name: "Ball Joint (Upper)", partNo: "SUS-020", status: "In Stock" },
    { name: "Ball Joint (Lower)", partNo: "SUS-021", status: "In Stock" },
    { name: "Tie Rod End (Inner)", partNo: "SUS-022", status: "In Stock" },
    { name: "Tie Rod End (Outer)", partNo: "SUS-023", status: "In Stock" },
    { name: "Stabilizer Bar / Sway Bar", partNo: "SUS-024", status: "In Stock" },
    { name: "Stabilizer Bar Link", partNo: "SUS-025", status: "In Stock" },
    { name: "Stabilizer Bar Bushing", partNo: "SUS-026", status: "In Stock" },
    { name: "Knuckle / Spindle (Front Left)", partNo: "SUS-027", status: "Limited" },
    { name: "Knuckle / Spindle (Front Right)", partNo: "SUS-028", status: "Limited" },
    { name: "Wheel Hub Assembly (Front)", partNo: "SUS-029", status: "In Stock" },
    { name: "Wheel Hub Assembly (Rear)", partNo: "SUS-030", status: "In Stock" },
    { name: "Wheel Bearing (Front)", partNo: "SUS-031", status: "In Stock" },
    { name: "Wheel Bearing (Rear)", partNo: "SUS-032", status: "In Stock" },
    { name: "Steering Rack & Pinion", partNo: "SUS-033", status: "Limited" },
    { name: "Power Steering Pump", partNo: "SUS-034", status: "In Stock" },
    { name: "Power Steering Hose (High Pressure)", partNo: "SUS-035", status: "In Stock" },
    { name: "Power Steering Hose (Return)", partNo: "SUS-036", status: "In Stock" },
    { name: "Steering Column", partNo: "SUS-037", status: "Limited" },
    { name: "Steering Intermediate Shaft", partNo: "SUS-038", status: "In Stock" },
    { name: "Steering Gear Box", partNo: "SUS-039", status: "Limited" },
    { name: "Torsion Bar", partNo: "SUS-040", status: "In Stock" },
    { name: "Bump Stop / Jounce Bumper", partNo: "SUS-041", status: "In Stock" },
    { name: "Subframe / Crossmember", partNo: "SUS-042", status: "Limited" },
  ],
  "Electrical & Ignition": [
    { name: "Alternator", partNo: "ELC-001", status: "In Stock" },
    { name: "Starter Motor", partNo: "ELC-002", status: "In Stock" },
    { name: "Battery (12V)", partNo: "ELC-003", status: "In Stock" },
    { name: "Battery (Hybrid / HV)", partNo: "ELC-004", status: "Limited" },
    { name: "Ignition Coil", partNo: "ELC-005", status: "In Stock" },
    { name: "Spark Plug", partNo: "ELC-006", status: "In Stock" },
    { name: "Distributor Cap", partNo: "ELC-007", status: "In Stock" },
    { name: "Rotor Button", partNo: "ELC-008", status: "In Stock" },
    { name: "Ignition Control Module", partNo: "ELC-009", status: "In Stock" },
    { name: "Crankshaft Position Sensor", partNo: "ELC-010", status: "In Stock" },
    { name: "Camshaft Position Sensor", partNo: "ELC-011", status: "In Stock" },
    { name: "Throttle Position Sensor (TPS)", partNo: "ELC-012", status: "In Stock" },
    { name: "Manifold Absolute Pressure Sensor (MAP)", partNo: "ELC-013", status: "In Stock" },
    { name: "Mass Air Flow Sensor (MAF)", partNo: "ELC-014", status: "In Stock" },
    { name: "Oxygen / Lambda Sensor (Upstream)", partNo: "ELC-015", status: "In Stock" },
    { name: "Oxygen / Lambda Sensor (Downstream)", partNo: "ELC-016", status: "In Stock" },
    { name: "Knock Sensor", partNo: "ELC-017", status: "In Stock" },
    { name: "Coolant Temperature Sensor", partNo: "ELC-018", status: "In Stock" },
    { name: "Oil Pressure Sensor / Switch", partNo: "ELC-019", status: "In Stock" },
    { name: "Vehicle Speed Sensor (VSS)", partNo: "ELC-020", status: "In Stock" },
    { name: "ECU / Engine Control Module", partNo: "ELC-021", status: "Limited" },
    { name: "TCM / Transmission Control Module", partNo: "ELC-022", status: "Limited" },
    { name: "ABS Control Module", partNo: "ELC-023", status: "Limited" },
    { name: "Body Control Module (BCM)", partNo: "ELC-024", status: "Limited" },
    { name: "Fuse Box (Engine Bay)", partNo: "ELC-025", status: "In Stock" },
    { name: "Fuse Box (Interior)", partNo: "ELC-026", status: "In Stock" },
    { name: "Relay (Starter)", partNo: "ELC-027", status: "In Stock" },
    { name: "Relay (Fuel Pump)", partNo: "ELC-028", status: "In Stock" },
    { name: "Wiring Harness (Engine)", partNo: "ELC-029", status: "Limited" },
    { name: "Wiring Harness (Body)", partNo: "ELC-030", status: "Limited" },
    { name: "Glow Plug (Diesel)", partNo: "ELC-031", status: "In Stock" },
    { name: "Glow Plug Controller", partNo: "ELC-032", status: "In Stock" },
  ],
  "Fuel & Intake": [
    { name: "Fuel Pump (In-Tank)", partNo: "FUL-001", status: "In Stock" },
    { name: "Fuel Pump (External)", partNo: "FUL-002", status: "In Stock" },
    { name: "Fuel Injector", partNo: "FUL-003", status: "In Stock" },
    { name: "Fuel Pressure Regulator", partNo: "FUL-004", status: "In Stock" },
    { name: "Fuel Rail", partNo: "FUL-005", status: "In Stock" },
    { name: "Fuel Tank", partNo: "FUL-006", status: "Limited" },
    { name: "Fuel Tank Sending Unit", partNo: "FUL-007", status: "In Stock" },
    { name: "Fuel Filler Neck", partNo: "FUL-008", status: "In Stock" },
    { name: "Fuel Filter", partNo: "FUL-009", status: "In Stock" },
    { name: "Fuel Vapor Canister (EVAP)", partNo: "FUL-010", status: "In Stock" },
    { name: "EVAP Purge Valve (Solenoid)", partNo: "FUL-011", status: "In Stock" },
    { name: "Throttle Body", partNo: "FUL-012", status: "In Stock" },
    { name: "Idle Air Control Valve (IACV)", partNo: "FUL-013", status: "In Stock" },
    { name: "Air Filter", partNo: "FUL-014", status: "In Stock" },
    { name: "Air Intake Duct / Hose", partNo: "FUL-015", status: "In Stock" },
    { name: "Intake Manifold", partNo: "FUL-016", status: "In Stock" },
    { name: "Intake Manifold Gasket", partNo: "FUL-017", status: "In Stock" },
    { name: "Carburetor", partNo: "FUL-018", status: "In Stock" },
    { name: "Turbocharger", partNo: "FUL-019", status: "Limited" },
    { name: "Intercooler", partNo: "FUL-020", status: "Limited" },
    { name: "Intercooler Hose Kit", partNo: "FUL-021", status: "In Stock" },
    { name: "Supercharger", partNo: "FUL-022", status: "On Order" },
    { name: "Blow-Off Valve", partNo: "FUL-023", status: "In Stock" },
    { name: "Wastegate", partNo: "FUL-024", status: "In Stock" },
  ],
  "Cooling System": [
    { name: "Radiator", partNo: "COL-001", status: "In Stock" },
    { name: "Radiator Cap", partNo: "COL-002", status: "In Stock" },
    { name: "Radiator Hose (Upper)", partNo: "COL-003", status: "In Stock" },
    { name: "Radiator Hose (Lower)", partNo: "COL-004", status: "In Stock" },
    { name: "Coolant Reservoir / Overflow Tank", partNo: "COL-005", status: "In Stock" },
    { name: "Water Pump", partNo: "COL-006", status: "In Stock" },
    { name: "Thermostat", partNo: "COL-007", status: "In Stock" },
    { name: "Thermostat Housing", partNo: "COL-008", status: "In Stock" },
    { name: "Cooling Fan (Electric)", partNo: "COL-009", status: "In Stock" },
    { name: "Cooling Fan Motor", partNo: "COL-010", status: "In Stock" },
    { name: "Fan Clutch", partNo: "COL-011", status: "In Stock" },
    { name: "Fan Blade", partNo: "COL-012", status: "In Stock" },
    { name: "Fan Shroud", partNo: "COL-013", status: "In Stock" },
    { name: "Heater Core", partNo: "COL-014", status: "Limited" },
    { name: "Heater Hose (Supply)", partNo: "COL-015", status: "In Stock" },
    { name: "Heater Hose (Return)", partNo: "COL-016", status: "In Stock" },
    { name: "Heater Control Valve", partNo: "COL-017", status: "In Stock" },
    { name: "EGR Cooler", partNo: "COL-018", status: "In Stock" },
  ],
  "Exhaust System": [
    { name: "Exhaust Manifold", partNo: "EXH-001", status: "In Stock" },
    { name: "Exhaust Manifold Gasket", partNo: "EXH-002", status: "In Stock" },
    { name: "Catalytic Converter", partNo: "EXH-003", status: "In Stock" },
    { name: "Muffler / Silencer", partNo: "EXH-004", status: "In Stock" },
    { name: "Exhaust Pipe (Front)", partNo: "EXH-005", status: "In Stock" },
    { name: "Exhaust Pipe (Centre)", partNo: "EXH-006", status: "In Stock" },
    { name: "Exhaust Pipe (Rear)", partNo: "EXH-007", status: "In Stock" },
    { name: "Exhaust Flange", partNo: "EXH-008", status: "In Stock" },
    { name: "Exhaust Clamp", partNo: "EXH-009", status: "In Stock" },
    { name: "Exhaust Gasket Set", partNo: "EXH-010", status: "In Stock" },
    { name: "Flexible Exhaust Pipe / Bellow", partNo: "EXH-011", status: "In Stock" },
    { name: "Exhaust Hanger / Rubber Mount", partNo: "EXH-012", status: "In Stock" },
    { name: "DPF (Diesel Particulate Filter)", partNo: "EXH-013", status: "Limited" },
    { name: "EGR Valve", partNo: "EXH-014", status: "In Stock" },
    { name: "EGR Pipe", partNo: "EXH-015", status: "In Stock" },
    { name: "O2 Sensor Bung / Plug", partNo: "EXH-016", status: "In Stock" },
  ],
  "Body & Exterior": [
    { name: "Front Bumper Assembly", partNo: "BDY-001", status: "In Stock" },
    { name: "Rear Bumper Assembly", partNo: "BDY-002", status: "In Stock" },
    { name: "Front Fender (Left)", partNo: "BDY-003", status: "In Stock" },
    { name: "Front Fender (Right)", partNo: "BDY-004", status: "In Stock" },
    { name: "Rear Fender / Quarter Panel (Left)", partNo: "BDY-005", status: "In Stock" },
    { name: "Rear Fender / Quarter Panel (Right)", partNo: "BDY-006", status: "In Stock" },
    { name: "Hood / Bonnet", partNo: "BDY-007", status: "In Stock" },
    { name: "Hood Latch", partNo: "BDY-008", status: "In Stock" },
    { name: "Hood Hinge (Left)", partNo: "BDY-009", status: "In Stock" },
    { name: "Hood Hinge (Right)", partNo: "BDY-010", status: "In Stock" },
    { name: "Hood Gas Strut / Prop Rod", partNo: "BDY-011", status: "In Stock" },
    { name: "Trunk Lid / Boot Lid", partNo: "BDY-012", status: "In Stock" },
    { name: "Trunk Latch", partNo: "BDY-013", status: "In Stock" },
    { name: "Trunk Gas Strut (Left)", partNo: "BDY-014", status: "In Stock" },
    { name: "Trunk Gas Strut (Right)", partNo: "BDY-015", status: "In Stock" },
    { name: "Front Door (Left)", partNo: "BDY-016", status: "Limited" },
    { name: "Front Door (Right)", partNo: "BDY-017", status: "Limited" },
    { name: "Rear Door (Left)", partNo: "BDY-018", status: "Limited" },
    { name: "Rear Door (Right)", partNo: "BDY-019", status: "Limited" },
    { name: "Door Handle (Exterior, Front Left)", partNo: "BDY-020", status: "In Stock" },
    { name: "Door Handle (Exterior, Front Right)", partNo: "BDY-021", status: "In Stock" },
    { name: "Door Handle (Interior)", partNo: "BDY-022", status: "In Stock" },
    { name: "Door Hinge (Upper)", partNo: "BDY-023", status: "In Stock" },
    { name: "Door Hinge (Lower)", partNo: "BDY-024", status: "In Stock" },
    { name: "Door Lock Actuator (Front Left)", partNo: "BDY-025", status: "In Stock" },
    { name: "Door Lock Actuator (Front Right)", partNo: "BDY-026", status: "In Stock" },
    { name: "Door Window Glass (Front Left)", partNo: "BDY-027", status: "Limited" },
    { name: "Door Window Glass (Front Right)", partNo: "BDY-028", status: "Limited" },
    { name: "Window Regulator (Front Left)", partNo: "BDY-029", status: "In Stock" },
    { name: "Window Regulator (Front Right)", partNo: "BDY-030", status: "In Stock" },
    { name: "Window Regulator Motor", partNo: "BDY-031", status: "In Stock" },
    { name: "Windshield / Windscreen", partNo: "BDY-032", status: "Limited" },
    { name: "Rear Window Glass", partNo: "BDY-033", status: "Limited" },
    { name: "Side Mirror (Left)", partNo: "BDY-034", status: "In Stock" },
    { name: "Side Mirror (Right)", partNo: "BDY-035", status: "In Stock" },
    { name: "Side Mirror Glass (Left)", partNo: "BDY-036", status: "In Stock" },
    { name: "Side Mirror Glass (Right)", partNo: "BDY-037", status: "In Stock" },
    { name: "Grille (Front)", partNo: "BDY-038", status: "In Stock" },
    { name: "Headlamp Washer Nozzle", partNo: "BDY-039", status: "In Stock" },
    { name: "Windshield Wiper Blade (Front)", partNo: "BDY-040", status: "In Stock" },
    { name: "Windshield Wiper Blade (Rear)", partNo: "BDY-041", status: "In Stock" },
    { name: "Wiper Motor (Front)", partNo: "BDY-042", status: "In Stock" },
    { name: "Wiper Motor (Rear)", partNo: "BDY-043", status: "In Stock" },
    { name: "Wiper Linkage", partNo: "BDY-044", status: "In Stock" },
    { name: "Washer Fluid Pump", partNo: "BDY-045", status: "In Stock" },
    { name: "Washer Fluid Reservoir", partNo: "BDY-046", status: "In Stock" },
    { name: "Roof Panel", partNo: "BDY-047", status: "On Order" },
    { name: "Sunroof Assembly", partNo: "BDY-048", status: "Limited" },
    { name: "Sunroof Glass", partNo: "BDY-049", status: "Limited" },
  ],
  "Lighting": [
    { name: "Headlight Assembly (Left)", partNo: "LGT-001", status: "In Stock" },
    { name: "Headlight Assembly (Right)", partNo: "LGT-002", status: "In Stock" },
    { name: "Headlight Bulb (H4)", partNo: "LGT-003", status: "In Stock" },
    { name: "Headlight Bulb (H7)", partNo: "LGT-004", status: "In Stock" },
    { name: "Headlight Bulb (HID/Xenon D2S)", partNo: "LGT-005", status: "In Stock" },
    { name: "Headlight LED Module", partNo: "LGT-006", status: "In Stock" },
    { name: "Headlight Ballast (HID)", partNo: "LGT-007", status: "In Stock" },
    { name: "Daytime Running Light (DRL)", partNo: "LGT-008", status: "In Stock" },
    { name: "Fog Light (Front Left)", partNo: "LGT-009", status: "In Stock" },
    { name: "Fog Light (Front Right)", partNo: "LGT-010", status: "In Stock" },
    { name: "Fog Light (Rear)", partNo: "LGT-011", status: "In Stock" },
    { name: "Tail Light Assembly (Left)", partNo: "LGT-012", status: "In Stock" },
    { name: "Tail Light Assembly (Right)", partNo: "LGT-013", status: "In Stock" },
    { name: "Turn Signal / Indicator (Front Left)", partNo: "LGT-014", status: "In Stock" },
    { name: "Turn Signal / Indicator (Front Right)", partNo: "LGT-015", status: "In Stock" },
    { name: "Turn Signal / Indicator (Rear Left)", partNo: "LGT-016", status: "In Stock" },
    { name: "Turn Signal / Indicator (Rear Right)", partNo: "LGT-017", status: "In Stock" },
    { name: "Side Marker Light", partNo: "LGT-018", status: "In Stock" },
    { name: "Reverse Light", partNo: "LGT-019", status: "In Stock" },
    { name: "Number Plate Light", partNo: "LGT-020", status: "In Stock" },
    { name: "Interior Dome Light", partNo: "LGT-021", status: "In Stock" },
    { name: "Flasher / Turn Signal Relay", partNo: "LGT-022", status: "In Stock" },
  ],
  "Interior & Comfort": [
    { name: "Dashboard / Instrument Panel", partNo: "INT-001", status: "Limited" },
    { name: "Instrument Cluster / Speedometer", partNo: "INT-002", status: "Limited" },
    { name: "Steering Wheel", partNo: "INT-003", status: "In Stock" },
    { name: "Airbag (Driver)", partNo: "INT-004", status: "Limited" },
    { name: "Airbag (Passenger)", partNo: "INT-005", status: "Limited" },
    { name: "Airbag (Side Curtain)", partNo: "INT-006", status: "Limited" },
    { name: "Airbag Control Module (ACU)", partNo: "INT-007", status: "Limited" },
    { name: "Seat (Front Left)", partNo: "INT-008", status: "In Stock" },
    { name: "Seat (Front Right)", partNo: "INT-009", status: "In Stock" },
    { name: "Seat (Rear)", partNo: "INT-010", status: "In Stock" },
    { name: "Seat Belt (Front Left)", partNo: "INT-011", status: "In Stock" },
    { name: "Seat Belt (Front Right)", partNo: "INT-012", status: "In Stock" },
    { name: "Seat Belt (Rear)", partNo: "INT-013", status: "In Stock" },
    { name: "Seat Belt Pretensioner", partNo: "INT-014", status: "In Stock" },
    { name: "Center Console", partNo: "INT-015", status: "In Stock" },
    { name: "Gear Shift Knob", partNo: "INT-016", status: "In Stock" },
    { name: "Gear Shift Boot", partNo: "INT-017", status: "In Stock" },
    { name: "Handbrake / Parking Brake Lever", partNo: "INT-018", status: "In Stock" },
    { name: "Floor Mat Set", partNo: "INT-019", status: "In Stock" },
    { name: "Door Trim Panel (Front Left)", partNo: "INT-020", status: "In Stock" },
    { name: "Door Trim Panel (Front Right)", partNo: "INT-021", status: "In Stock" },
    { name: "Sun Visor (Left)", partNo: "INT-022", status: "In Stock" },
    { name: "Sun Visor (Right)", partNo: "INT-023", status: "In Stock" },
    { name: "Rear View Mirror (Interior)", partNo: "INT-024", status: "In Stock" },
    { name: "A/C Compressor", partNo: "INT-025", status: "In Stock" },
    { name: "A/C Condenser", partNo: "INT-026", status: "In Stock" },
    { name: "A/C Evaporator", partNo: "INT-027", status: "Limited" },
    { name: "A/C Expansion Valve", partNo: "INT-028", status: "In Stock" },
    { name: "A/C Receiver Dryer", partNo: "INT-029", status: "In Stock" },
    { name: "A/C Blower Motor", partNo: "INT-030", status: "In Stock" },
    { name: "A/C Blower Resistor", partNo: "INT-031", status: "In Stock" },
    { name: "Heater Blower Fan", partNo: "INT-032", status: "In Stock" },
    { name: "HVAC Control Unit", partNo: "INT-033", status: "Limited" },
  ],
  "Wheels & Tyres": [
    { name: "Steel Wheel Rim (15\")", partNo: "WHL-001", status: "In Stock" },
    { name: "Alloy Wheel (16\")", partNo: "WHL-002", status: "In Stock" },
    { name: "Alloy Wheel (17\")", partNo: "WHL-003", status: "In Stock" },
    { name: "Alloy Wheel (18\")", partNo: "WHL-004", status: "In Stock" },
    { name: "Spare Tyre (Full Size)", partNo: "WHL-005", status: "In Stock" },
    { name: "Spare Tyre (Compact/Space Saver)", partNo: "WHL-006", status: "In Stock" },
    { name: "Tyre (195/65R15)", partNo: "WHL-007", status: "In Stock" },
    { name: "Tyre (205/55R16)", partNo: "WHL-008", status: "In Stock" },
    { name: "Tyre (225/45R17)", partNo: "WHL-009", status: "In Stock" },
    { name: "Tyre (255/50R19 4WD)", partNo: "WHL-010", status: "In Stock" },
    { name: "Wheel Nut Set", partNo: "WHL-011", status: "In Stock" },
    { name: "Wheel Stud", partNo: "WHL-012", status: "In Stock" },
    { name: "Center Cap / Hub Cap", partNo: "WHL-013", status: "In Stock" },
    { name: "TPMS Sensor (Tyre Pressure)", partNo: "WHL-014", status: "In Stock" },
    { name: "Valve Stem", partNo: "WHL-015", status: "In Stock" },
  ],
  "Filters & Service Items": [
    { name: "Engine Oil Filter", partNo: "FLT-001", status: "In Stock" },
    { name: "Air Filter (Panel)", partNo: "FLT-002", status: "In Stock" },
    { name: "Cabin / Pollen Filter", partNo: "FLT-003", status: "In Stock" },
    { name: "Fuel Filter (Inline)", partNo: "FLT-004", status: "In Stock" },
    { name: "Transmission Oil Filter", partNo: "FLT-005", status: "In Stock" },
    { name: "Power Steering Filter", partNo: "FLT-006", status: "In Stock" },
    { name: "Diesel Fuel Filter (Water Separator)", partNo: "FLT-007", status: "In Stock" },
    { name: "PCV Valve", partNo: "FLT-008", status: "In Stock" },
    { name: "Breather Hose / PCV Hose", partNo: "FLT-009", status: "In Stock" },
    { name: "Engine Oil (per litre)", partNo: "FLT-010", status: "In Stock" },
    { name: "Transmission Fluid (ATF)", partNo: "FLT-011", status: "In Stock" },
    { name: "Gear Oil (MTF)", partNo: "FLT-012", status: "In Stock" },
    { name: "Brake Fluid (DOT4)", partNo: "FLT-013", status: "In Stock" },
    { name: "Coolant / Antifreeze", partNo: "FLT-014", status: "In Stock" },
    { name: "Power Steering Fluid", partNo: "FLT-015", status: "In Stock" },
  ],
  "Gaskets & Seals": [
    { name: "Full Engine Gasket Set", partNo: "GSK-001", status: "In Stock" },
    { name: "Head Gasket", partNo: "GSK-002", status: "In Stock" },
    { name: "Valve Cover Gasket", partNo: "GSK-003", status: "In Stock" },
    { name: "Intake Manifold Gasket", partNo: "GSK-004", status: "In Stock" },
    { name: "Exhaust Manifold Gasket", partNo: "GSK-005", status: "In Stock" },
    { name: "Oil Pan Gasket", partNo: "GSK-006", status: "In Stock" },
    { name: "Oil Seal (Crankshaft Front)", partNo: "GSK-007", status: "In Stock" },
    { name: "Oil Seal (Crankshaft Rear)", partNo: "GSK-008", status: "In Stock" },
    { name: "Oil Seal (Camshaft)", partNo: "GSK-009", status: "In Stock" },
    { name: "Transmission Oil Seal (Input)", partNo: "GSK-010", status: "In Stock" },
    { name: "Transmission Oil Seal (Output)", partNo: "GSK-011", status: "In Stock" },
    { name: "Axle Shaft Oil Seal", partNo: "GSK-012", status: "In Stock" },
    { name: "Differential Pinion Seal", partNo: "GSK-013", status: "In Stock" },
    { name: "Water Pump Gasket", partNo: "GSK-014", status: "In Stock" },
    { name: "Thermostat Gasket", partNo: "GSK-015", status: "In Stock" },
    { name: "O-Ring Set", partNo: "GSK-016", status: "In Stock" },
  ],
};

const STATUS_COLORS = {
  "In Stock": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Limited":  "bg-amber-500/20  text-amber-400  border-amber-500/30",
  "Low Stock":  "bg-amber-500/20  text-amber-400  border-amber-500/30",
  "On Order": "bg-blue-500/20   text-blue-400   border-blue-500/30",
  "Out of Stock": "bg-red-500/20 text-red-400   border-red-500/30",
  "Out Of Stock": "bg-red-500/20 text-red-400   border-red-500/30",
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type SparePartApiItem = {
  _id: string;
  partNumber: string;
  partName: string;
  category: string;
  subCategory?: string;
  brand?: string;
  quantity?: number;
  status?: string;
};

type SparePartDisplayItem = {
  id: string;
  name: string;
  partNo: string;
  category: string;
  subCategory?: string;
  brand?: string;
  quantity: number;
  status: string;
};

function normalizeStatus(status?: string, quantity = 0) {
  if (status) return status;
  return quantity > 0 ? 'In Stock' : 'Out Of Stock';
}

async function fetchPublicSpareParts() {
  const params = new URLSearchParams({ page: '1', limit: '500', sort: 'category' });
  const response = await fetch(`${API_BASE}/spare-parts?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? []).map((part: SparePartApiItem) => ({
    id: part._id,
    name: part.partName,
    partNo: part.partNumber,
    category: part.category || 'Uncategorized',
    subCategory: part.subCategory,
    brand: part.brand,
    quantity: part.quantity ?? 0,
    status: normalizeStatus(part.status, part.quantity ?? 0),
  })) as SparePartDisplayItem[];
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function PhotosSections() {
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchPart, setSearchPart] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [allParts, setAllParts] = useState<SparePartDisplayItem[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const [partsError, setPartsError] = useState("");

  useEffect(() => {
    let ignore = false;

    setPartsLoading(true);
    setPartsError("");

    fetchPublicSpareParts()
      .then((parts) => {
        if (ignore) return;
        setAllParts(parts);
        setExpandedCats((prev) => {
          const next = { ...prev };
          parts.forEach((part) => {
            if (next[part.category] === undefined) next[part.category] = false;
          });
          return next;
        });
      })
      .catch((error: any) => {
        if (!ignore) setPartsError(error.message || "Unable to load spare parts.");
      })
      .finally(() => {
        if (!ignore) setPartsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(allParts.map((part) => part.category))).sort()];

  const filteredParts = allParts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !searchPart ||
      p.name.toLowerCase().includes(searchPart.toLowerCase()) ||
      p.partNo.toLowerCase().includes(searchPart.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(searchPart.toLowerCase());
    return matchCat && matchSearch;
  });

  const groupedFiltered = filteredParts.reduce((acc, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, SparePartDisplayItem[]>);

  const toggleCat = (cat: string) => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  const models = selectedMake ? (MODELS_BY_MAKE as Record<string, string[]>)[selectedMake] || [] : [];

  return (
    <section id="spare-parts" className="py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-8">
          <p className="text-xs tracking-widest text-white/30 uppercase mb-2">Inventory System</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">Spare Parts <span className="text-amber-400">Availability</span></h2>
          <p className="text-white/50 max-w-xl text-sm">
            {allParts.length.toLocaleString()} parts across {Math.max(categories.length - 1, 0)} categories for {MAKES.length} vehicle brands
          </p>
        </div>

        {/* Vehicle selector */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
            <h3 className="text-base font-semibold text-white">Select Vehicle</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1 uppercase">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("");
                }}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-ulss-gold"
              >
                <option value="">— Select Make —</option>
                {MAKES.map((m) => (
                  <option key={m} value={m} className="bg-[#0b0b0b] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1 uppercase">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedMake}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-ulss-gold disabled:opacity-40"
              >
                <option value="">— Select Model —</option>
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#0b0b0b] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMake && (
            <div className="mt-4">
              <span className="text-xs text-white/30 mr-2">Showing parts for:</span>
              <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs rounded-full font-medium">
                {selectedMake}{selectedModel ? ` · ${selectedModel}` : ' · All Models'}
              </span>
            </div>
          )}
        </div>

        {/* Search & stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search part name or part number…"
              value={searchPart}
              onChange={(e) => setSearchPart(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-ulss-gold"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-sm shrink-0">
            <span className="text-amber-400 font-bold text-lg">{filteredParts.length}</span>
            <span className="text-white/30 text-sm">{partsLoading ? 'loading parts' : 'parts found'}</span>
          </div>
        </div>

        {partsError && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {partsError}
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                activeCategory === cat ? 'bg-white text-ulss-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? `All (${allParts.length})` : cat}
            </button>
          ))}
        </div>

        {/* Parts list */}
        <div className="space-y-4">
          {Object.entries(groupedFiltered).map(([category, parts]) => {
            const isExpanded = !!expandedCats[category];
            return (
              <div key={category} className="bg-white/[0.02] border border-white/8 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCat(category)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="font-bold text-white">{category}</span>
                    <span className="px-2 py-0.5 bg-white/8 rounded-full text-white/40 text-xs">{parts.length} parts</span>
                  </div>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-12 gap-2 px-2 py-2 mb-2 text-white/30 text-xs uppercase">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Part Name</div>
                      <div className="col-span-3">Part No.</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-3">Status</div>
                    </div>

                    <div className="space-y-1">
                      {parts.map((part: any, idx: number) => {
                        const statusKey = (part.status as keyof typeof STATUS_COLORS) || 'In Stock';
                        const statusClass = STATUS_COLORS[statusKey] || STATUS_COLORS['In Stock'];
                        return (
	                        <div key={part.id} className="grid grid-cols-12 gap-2 px-2 py-2 rounded-lg items-center">
	                          <div className="col-span-1 text-white/40 text-xs">{String(idx + 1).padStart(2, '0')}</div>
	                          <div className="col-span-4 text-white/80 text-sm truncate">{part.name}</div>
	                          <div className="col-span-3 text-white/40 text-xs">{part.partNo}</div>
                            <div className="col-span-1 text-white/50 text-xs">{part.quantity}</div>
	                          <div className="col-span-3">
	                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
	                              {part.status}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {partsLoading && (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg">Loading spare parts...</p>
            </div>
          )}

          {!partsLoading && Object.keys(groupedFiltered).length === 0 && (
            <div className="text-center py-16 text-white/20">
              <p className="text-lg">No parts found for your search.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-white/5">
          {Object.entries(STATUS_COLORS).map(([status, cls]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${cls}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
