const MODERN_LEGAL = ["core", "expansion"]

const OUTLIERS = ["Modern Horizons 3", "Modern Horizons 2", "Assassin's Creed", "Modern Horizons", "The Lord of the Rings: Tales of Middle-earth"]

export async function fetchRecentSets(): Promise<string[]>{
    const response = await fetch('https://api.scryfall.com/sets', {
        next: { revalidate: 600 },
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sets = await response.json();
    const filteredSets = sets.data.filter((set: any) => {
        const setYear = parseInt(set.released_at.slice(0, 4));
        return setYear > 2008 && (MODERN_LEGAL.includes(set.set_type) || OUTLIERS.includes(set.name));
    });

    const setNames = filteredSets.map((set: any) => set.name);
    return setNames;
}
