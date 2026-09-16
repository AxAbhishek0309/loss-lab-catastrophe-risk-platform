import csv
import random
import time
import numpy as np

start = time.time()

num_rows = 50000
print(f"Generating {num_rows:,} rows of catastrophe event data...")

np.random.seed(42)
random.seed(42)

perils_pool = [
    ("Tropical Cyclone", ["Hurricane", "Typhoon", "Cyclone"]),
    ("Earthquake", ["Earthquake", "Seismic Rupture", "Megathrust"]),
    ("Flood", ["Riverine Flood", "Flash Flood", "Inundation Outbreak"]),
    ("Wildfire", ["Wildfire Complex", "Bushfire Outbreak", "Firestorm"]),
    ("Severe Storm", ["Severe Convective Storm", "Tornado Outbreak", "Derecho"]),
    ("Winter Storm", ["Blizzard", "Freezing Incursion", "Ice Storm"]),
]

regions_pool = [
    ("North America", ["United States", "Canada", "Mexico"]),
    ("Asia-Pacific", ["Japan", "China", "Philippines", "Australia", "India", "Indonesia", "New Zealand", "Vietnam"]),
    ("Europe", ["Germany", "United Kingdom", "France", "Italy", "Spain", "Turkey", "Greece"]),
    ("Latin America", ["Brazil", "Chile", "Colombia", "Peru", "Argentina", "Honduras"]),
    ("Middle East & Africa", ["South Africa", "Morocco", "Egypt", "UAE", "Saudi Arabia"]),
]

names_first = [
    "Northridge", "Kobe", "Katrina", "Sandy", "Harvey", "Irma", "Maria", "Ian", "Helene", "Milton",
    "Otis", "Saola", "Haiyan", "Hagibis", "Dorian", "Ida", "Laura", "Bernd", "Uri", "Lothar",
    "Sichuan", "Tohoku", "Christchurch", "Gorkha", "Biobio", "Valdivia", "Tangshan", "Bhuj", "Izmit",
    "Cascadia", "San Andreas", "New Madrid", "Denali", "Hayward", "Alpine", "Calabrian", "Anatolian",
    "Pacific Rim", "Atlantic Basin", "Gulf Coast", "Rhine Basin", "Danube", "Chao Phraya", "Mississippi",
    "Sierra Nevada", "Camp Fire", "Black Summer", "Queensland", "Attica", "Piedmont", "Kyushu", "Okinawa"
]

# Generate random dates between 1980 and 2026
start_epoch = int(time.mktime(time.strptime("1980-01-01", "%Y-%m-%d")))
end_epoch = int(time.mktime(time.strptime("2026-09-01", "%Y-%m-%d")))

# Vectorized generation
# Economic loss: Generalized Pareto heavy-tail distribution (Millions USD)
# u = 5.0 ($5M), xi = 0.42, sigma = 120.0
xi = 0.42
sigma = 120.0
u = 5.0
unif = np.random.uniform(0.0001, 0.9995, size=num_rows)
raw_losses_m = u + (sigma / xi) * ((1.0 - unif) ** (-xi) - 1.0)
economic_losses = np.clip(np.round(raw_losses_m, 2), 2.5, 285000.0)

# Insured loss ratio between 15% and 75%
insured_ratios = np.random.uniform(0.15, 0.75, size=num_rows)
insured_losses = np.round(economic_losses * insured_ratios, 2)

# Random epochs
random_epochs = np.random.randint(start_epoch, end_epoch, size=num_rows)

# Lat / Lon arrays
lats = np.round(np.random.uniform(-55.0, 68.0, size=num_rows), 4)
lons = np.round(np.random.uniform(-160.0, 160.0, size=num_rows), 4)

rows = []
for i in range(num_rows):
    reg_tuple = regions_pool[i % len(regions_pool)]
    region_name = reg_tuple[0]
    country = random.choice(reg_tuple[1])

    peril_tuple = perils_pool[i % len(perils_pool)]
    peril_name = peril_tuple[0]
    sub_peril = random.choice(peril_tuple[1])

    evt_name = f"{sub_peril} {names_first[i % len(names_first)]} #{100 + (i // len(names_first))}"

    # Date
    tm = time.gmtime(int(random_epochs[i]))
    date_str = time.strftime("%Y-%m-%d", tm)
    year_val = tm.tm_year

    # Magnitude string
    if peril_name == "Earthquake":
        mag_val = round(5.0 + (i % 45) * 0.09, 1)
        magnitude_str = f"Mw {mag_val}"
    elif peril_name == "Tropical Cyclone":
        cat_num = 1 + (i % 5)
        wind_kmh = 120 + cat_num * 35
        magnitude_str = f"Cat {cat_num} ({wind_kmh} km/h)"
    elif peril_name == "Flood":
        magnitude_str = f"{25 * (1 + (i % 20))}-yr return"
    elif peril_name == "Wildfire":
        magnitude_str = f"{10 * (1 + (i % 50))}k hectares"
    else:
        magnitude_str = f"Intensity index {round(1.5 + (i % 80) * 0.1, 1)}"

    econ_loss = float(economic_losses[i])
    ins_loss = float(insured_losses[i])

    # Risk level
    if econ_loss >= 50000.0:
        risk_level = "Extreme"
    elif econ_loss >= 15000.0:
        risk_level = "Very High"
    elif econ_loss >= 3000.0:
        risk_level = "High"
    elif econ_loss >= 500.0:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Casualties: correlated with economic loss
    cas_factor = random.uniform(0.01, 1.2)
    casualties = int(np.clip(round((econ_loss ** 0.65) * cas_factor), 0, 185000))

    rows.append({
        "event_id": f"CAT-{year_val}-{i+1:05d}",
        "name": evt_name,
        "peril": peril_name,
        "country": country,
        "region": region_name,
        "date": date_str,
        "year": year_val,
        "magnitude": magnitude_str,
        "economic_loss_usd_m": econ_loss,
        "economic_loss_usd_b": round(econ_loss / 1000.0, 3),
        "insured_loss_usd_m": ins_loss,
        "insured_loss_usd_b": round(ins_loss / 1000.0, 3),
        "casualties": casualties,
        "risk_level": risk_level,
        "lat": float(lats[i]),
        "lon": float(lons[i])
    })

fieldnames = list(rows[0].keys())

print(f"Writing data/catastrophe_events.csv...")
with open("data/catastrophe_events.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Writing public/catastrophe_events.csv for direct client download...")
with open("public/catastrophe_events.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

elapsed = time.time() - start
print(f"Done! Successfully generated 50,000 rows in {elapsed:.2f} seconds.")
