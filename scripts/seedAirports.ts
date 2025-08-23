// ./scripts/seedAirports.ts

import { db } from "@/db";
import { airports } from "@/db/schema/airports";
import "dotenv/config";

const airportData = [
	// North America
	{
		code: "LAX",
		name: "Los Angeles International Airport",
		timezone: "America/Los_Angeles",
	},
	{
		code: "SFO",
		name: "San Francisco International Airport",
		timezone: "America/Los_Angeles",
	},
	{
		code: "SEA",
		name: "Seattle-Tacoma International Airport",
		timezone: "America/Los_Angeles",
	},
	{
		code: "DEN",
		name: "Denver International Airport",
		timezone: "America/Denver",
	},
	{
		code: "ORD",
		name: "O'Hare International Airport",
		timezone: "America/Chicago",
	},
	{
		code: "DFW",
		name: "Dallas/Fort Worth International Airport",
		timezone: "America/Chicago",
	},
	{
		code: "ATL",
		name: "Hartsfield-Jackson Atlanta International Airport",
		timezone: "America/New_York",
	},
	{
		code: "JFK",
		name: "John F. Kennedy International Airport",
		timezone: "America/New_York",
	},
	{
		code: "MIA",
		name: "Miami International Airport",
		timezone: "America/New_York",
	},
	{
		code: "YYZ",
		name: "Toronto Pearson International Airport",
		timezone: "America/Toronto",
	},
	{
		code: "YVR",
		name: "Vancouver International Airport",
		timezone: "America/Vancouver",
	},
	{
		code: "MEX",
		name: "Mexico City International Airport",
		timezone: "America/Mexico_City",
	},
	{
		code: "ANC",
		name: "Ted Stevens Anchorage International Airport",
		timezone: "America/Anchorage",
	},
	{
		code: "HNL",
		name: "Daniel K. Inouye International Airport",
		timezone: "Pacific/Honolulu",
	},

	// South America
	{
		code: "GRU",
		name: "São Paulo/Guarulhos International Airport",
		timezone: "America/Sao_Paulo",
	},
	{
		code: "GIG",
		name: "Rio de Janeiro/Galeão International Airport",
		timezone: "America/Sao_Paulo",
	},
	{
		code: "EZE",
		name: "Ministro Pistarini International Airport",
		timezone: "America/Argentina/Buenos_Aires",
	},
	{
		code: "SCL",
		name: "Arturo Merino Benítez International Airport",
		timezone: "America/Santiago",
	},
	{
		code: "LIM",
		name: "Jorge Chávez International Airport",
		timezone: "America/Lima",
	},
	{
		code: "BOG",
		name: "El Dorado International Airport",
		timezone: "America/Bogota",
	},

	// Europe
	{ code: "LHR", name: "Heathrow Airport", timezone: "Europe/London" },
	{ code: "LGW", name: "Gatwick Airport", timezone: "Europe/London" },
	{ code: "DUB", name: "Dublin Airport", timezone: "Europe/Dublin" },
	{
		code: "CDG",
		name: "Charles de Gaulle Airport",
		timezone: "Europe/Paris",
	},
	{
		code: "AMS",
		name: "Amsterdam Airport Schiphol",
		timezone: "Europe/Amsterdam",
	},
	{ code: "FRA", name: "Frankfurt Airport", timezone: "Europe/Berlin" },
	{ code: "MUC", name: "Munich Airport", timezone: "Europe/Berlin" },
	{ code: "ZRH", name: "Zurich Airport", timezone: "Europe/Zurich" },
	{ code: "GVA", name: "Geneva Airport", timezone: "Europe/Zurich" },
	{
		code: "FCO",
		name: "Leonardo da Vinci–Fiumicino Airport",
		timezone: "Europe/Rome",
	},
	{ code: "MXP", name: "Milan Malpensa Airport", timezone: "Europe/Rome" },
	{
		code: "MAD",
		name: "Adolfo Suárez Madrid-Barajas Airport",
		timezone: "Europe/Madrid",
	},
	{
		code: "BCN",
		name: "Josep Tarradellas Barcelona-El Prat Airport",
		timezone: "Europe/Madrid",
	},
	{ code: "LIS", name: "Lisbon Airport", timezone: "Europe/Lisbon" },
	{ code: "BRU", name: "Brussels Airport", timezone: "Europe/Brussels" },
	{
		code: "VIE",
		name: "Vienna International Airport",
		timezone: "Europe/Vienna",
	},
	{ code: "CPH", name: "Copenhagen Airport", timezone: "Europe/Copenhagen" },
	{ code: "OSL", name: "Oslo Airport, Gardermoen", timezone: "Europe/Oslo" },
	{
		code: "ARN",
		name: "Stockholm Arlanda Airport",
		timezone: "Europe/Stockholm",
	},
	{
		code: "HEL",
		name: "Helsinki-Vantaa Airport",
		timezone: "Europe/Helsinki",
	},
	{
		code: "ATH",
		name: "Athens International Airport",
		timezone: "Europe/Athens",
	},
	{ code: "IST", name: "Istanbul Airport", timezone: "Europe/Istanbul" },
	{
		code: "SVO",
		name: "Sheremetyevo International Airport",
		timezone: "Europe/Moscow",
	},
	{ code: "WAW", name: "Warsaw Chopin Airport", timezone: "Europe/Warsaw" },
	{
		code: "PRG",
		name: "Václav Havel Airport Prague",
		timezone: "Europe/Prague",
	},
	{
		code: "BUD",
		name: "Budapest Ferenc Liszt International Airport",
		timezone: "Europe/Budapest",
	},

	// Asia
	{
		code: "NRT",
		name: "Narita International Airport",
		timezone: "Asia/Tokyo",
	},
	{ code: "HND", name: "Haneda Airport", timezone: "Asia/Tokyo" },
	{
		code: "KIX",
		name: "Kansai International Airport",
		timezone: "Asia/Tokyo",
	},
	{
		code: "ICN",
		name: "Incheon International Airport",
		timezone: "Asia/Seoul",
	},
	{
		code: "PEK",
		name: "Beijing Capital International Airport",
		timezone: "Asia/Shanghai",
	},
	{
		code: "PVG",
		name: "Shanghai Pudong International Airport",
		timezone: "Asia/Shanghai",
	},
	{
		code: "CAN",
		name: "Guangzhou Baiyun International Airport",
		timezone: "Asia/Shanghai",
	},
	{
		code: "HKG",
		name: "Hong Kong International Airport",
		timezone: "Asia/Hong_Kong",
	},
	{
		code: "TPE",
		name: "Taiwan Taoyuan International Airport",
		timezone: "Asia/Taipei",
	},
	{
		code: "SIN",
		name: "Singapore Changi Airport",
		timezone: "Asia/Singapore",
	},
	{
		code: "KUL",
		name: "Kuala Lumpur International Airport",
		timezone: "Asia/Kuala_Lumpur",
	},
	{ code: "BKK", name: "Suvarnabhumi Airport", timezone: "Asia/Bangkok" },
	{
		code: "SGN",
		name: "Tan Son Nhat International Airport",
		timezone: "Asia/Ho_Chi_Minh",
	},
	{
		code: "HAN",
		name: "Noi Bai International Airport",
		timezone: "Asia/Ho_Chi_Minh",
	},
	{
		code: "MNL",
		name: "Ninoy Aquino International Airport",
		timezone: "Asia/Manila",
	},
	{
		code: "CGK",
		name: "Soekarno-Hatta International Airport",
		timezone: "Asia/Jakarta",
	},
	{
		code: "DEL",
		name: "Indira Gandhi International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "BOM",
		name: "Chhatrapati Shivaji Maharaj International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "BLR",
		name: "Kempegowda International Airport Bengaluru",
		timezone: "Asia/Kolkata",
	},
	{
		code: "HYD",
		name: "Rajiv Gandhi International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "CCU",
		name: "Netaji Subhas Chandra Bose International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "MAA",
		name: "Chennai International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "CCU",
		name: "Netaji Subhas Chandra Bose International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "AMD",
		name: "Sardar Vallabhbhai Patel International Airport (SVPIA)",
		timezone: "Asia/Kolkata",
	},
	{
		code: "PNQ",
		name: "Pune International Airport",
		timezone: "Asia/Kolkata",
	},
	{
		code: "DXB",
		name: "Dubai International Airport",
		timezone: "Asia/Dubai",
	},
	{
		code: "DOH",
		name: "Hamad International Airport",
		timezone: "Asia/Qatar",
	},
	{
		code: "AUH",
		name: "Abu Dhabi International Airport",
		timezone: "Asia/Dubai",
	},
	{
		code: "RUH",
		name: "King Khalid International Airport",
		timezone: "Asia/Riyadh",
	},
	{
		code: "JED",
		name: "King Abdulaziz International Airport",
		timezone: "Asia/Riyadh",
	},
	{ code: "TLV", name: "Ben Gurion Airport", timezone: "Asia/Jerusalem" },
	{
		code: "IKA",
		name: "Imam Khomeini International Airport",
		timezone: "Asia/Tehran",
	},
	{
		code: "ALA",
		name: "Almaty International Airport",
		timezone: "Asia/Almaty",
	},

	// Africa
	{
		code: "JNB",
		name: "O. R. Tambo International Airport",
		timezone: "Africa/Johannesburg",
	},
	{
		code: "CPT",
		name: "Cape Town International Airport",
		timezone: "Africa/Johannesburg",
	},
	{
		code: "LOS",
		name: "Murtala Muhammed International Airport",
		timezone: "Africa/Lagos",
	},
	{
		code: "CAI",
		name: "Cairo International Airport",
		timezone: "Africa/Cairo",
	},
	{
		code: "NBO",
		name: "Jomo Kenyatta International Airport",
		timezone: "Africa/Nairobi",
	},
	{
		code: "ADD",
		name: "Bole International Airport",
		timezone: "Africa/Addis_Ababa",
	},
	{
		code: "CMN",
		name: "Mohammed V International Airport",
		timezone: "Africa/Casablanca",
	},
	{
		code: "DKR",
		name: "Blaise Diagne International Airport",
		timezone: "Africa/Dakar",
	},

	// Oceania
	{
		code: "SYD",
		name: "Sydney Kingsford Smith Airport",
		timezone: "Australia/Sydney",
	},
	{ code: "MEL", name: "Melbourne Airport", timezone: "Australia/Melbourne" },
	{ code: "BNE", name: "Brisbane Airport", timezone: "Australia/Brisbane" },
	{ code: "PER", name: "Perth Airport", timezone: "Australia/Perth" },
	{ code: "AKL", name: "Auckland Airport", timezone: "Pacific/Auckland" },
	{
		code: "CHC",
		name: "Christchurch International Airport",
		timezone: "Pacific/Auckland",
	},
	{
		code: "NAN",
		name: "Nadi International Airport",
		timezone: "Pacific/Fiji",
	},
	{
		code: "PPT",
		name: "Faa'a International Airport",
		timezone: "Pacific/Tahiti",
	},

	// More timezone coverage
	{ code: "KEF", name: "Keflavík Airport", timezone: "Atlantic/Reykjavik" },
	{
		code: "SXM",
		name: "Princess Juliana International Airport",
		timezone: "America/Lower_Princes",
	},
	{ code: "GOH", name: "Nuuk Airport", timezone: "America/Nuuk" },
	{
		code: "USH",
		name: "Malvinas Argentinas International Airport",
		timezone: "America/Argentina/Ushuaia",
	},
	{
		code: "VVO",
		name: "Vladivostok International Airport",
		timezone: "Asia/Vladivostok",
	},
	{
		code: "IKT",
		name: "Irkutsk International Airport",
		timezone: "Asia/Irkutsk",
	},
	{ code: "YKS", name: "Yakutsk Airport", timezone: "Asia/Yakutsk" },
	{
		code: "TAS",
		name: "Tashkent International Airport",
		timezone: "Asia/Tashkent",
	},
	{
		code: "KTM",
		name: "Tribhuvan International Airport",
		timezone: "Asia/Kathmandu",
	},
	{
		code: "DAC",
		name: "Hazrat Shahjalal International Airport",
		timezone: "Asia/Dhaka",
	},
	{
		code: "RGN",
		name: "Yangon International Airport",
		timezone: "Asia/Yangon",
	},
	{
		code: "KHI",
		name: "Jinnah International Airport",
		timezone: "Asia/Karachi",
	},
	{
		code: "KBL",
		name: "Hamid Karzai International Airport",
		timezone: "Asia/Kabul",
	},
	{
		code: "MCT",
		name: "Muscat International Airport",
		timezone: "Asia/Muscat",
	},
	{
		code: "EVN",
		name: "Zvartnots International Airport",
		timezone: "Asia/Yerevan",
	},
	{
		code: "TBS",
		name: "Tbilisi International Airport",
		timezone: "Asia/Tbilisi",
	},
	{
		code: "GYD",
		name: "Heydar Aliyev International Airport",
		timezone: "Asia/Baku",
	},
	{
		code: "MRU",
		name: "Sir Seewoosagur Ramgoolam International Airport",
		timezone: "Indian/Mauritius",
	},
	{
		code: "SEZ",
		name: "Seychelles International Airport",
		timezone: "Indian/Mahe",
	},
	{
		code: "MLE",
		name: "Velana International Airport",
		timezone: "Indian/Maldives",
	},
	{
		code: "CMB",
		name: "Bandaranaike International Airport",
		timezone: "Asia/Colombo",
	},
	{
		code: "GUM",
		name: "Antonio B. Won Pat International Airport",
		timezone: "Pacific/Guam",
	},
	{ code: "MDY", name: "Henderson Field", timezone: "Pacific/Midway" },
	{ code: "CXI", name: "Kiritimati Airport", timezone: "Pacific/Kiritimati" }, // One of the most forward timezones
	{
		code: "IPC",
		name: "Mataveri International Airport",
		timezone: "Pacific/Easter",
	}, // Easter Island
];

export async function seedAirports() {
	console.log("✈️  Seeding airports...");

	const result = await db
		.insert(airports)
		.values(airportData)
		.onConflictDoNothing()
		.returning();

	console.log(`✅  Seeded ${result.length} new airports.`);
}
