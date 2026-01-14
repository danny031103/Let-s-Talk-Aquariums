/**
 * Hierarchical Categories System
 * 
 * Refined category structure starting with Saltwater/Freshwater selection:
 * - Step 1: User selects Saltwater or Freshwater
 * - Step 2: Display relevant options for that environment
 * - Step 3: Further subcategories appear dynamically
 */

export const CATEGORIES = {
  saltwater: {
    name: 'Saltwater',
    image: '/images/categories/saltwater/saltwater.jpeg',
    subcategories: {
      coral: {
        name: 'Coral',
        image: '/images/categories/coral/coral.jpeg',
        items: [
          { name: 'SPS Coral', image: '/images/categories/coral/sps.png' },
          { name: 'LPS Coral', image: '/images/categories/coral/lps.png' },
          { name: 'Soft Coral', image: '/images/categories/coral/soft.png' },
          { name: 'Anemone', image: '/images/categories/coral/anemone.png' },
        ]
      },
      macroalgae: {
        name: 'Macroalgae',
        image: '/images/categories/plants/plants.jpeg',
        items: [
          { name: 'Chaetomorpha', image: '/images/categories/plants/chaeto.png' },
          { name: 'Caulerpa', image: '/images/categories/plants/caulerpa.png' },
          { name: 'Halimeda', image: '/images/categories/plants/halimeda.png' },
        ]
      },
      reefTanks: {
        name: 'Reef Tanks',
        image: '/images/categories/coral/coralpic.jpeg',
        items: [
          { name: 'Nano Reef', image: '/images/categories/coral/nano.png' },
          { name: 'Large Reef', image: '/images/categories/coral/large.png' },
          { name: 'Mixed Reef', image: '/images/categories/coral/mixed.png' },
        ]
      },
      fish: {
        name: 'Fish (Saltwater)',
        image: '/images/categories/fish/saltwater/saltwaterfish.jpeg',
        items: [
          { name: 'Clownfish', image: '/images/categories/fish/saltwater/clownfish.png' },
          { name: 'Tang', image: '/images/categories/fish/saltwater/tang.png' },
          { name: 'Angelfish', image: '/images/categories/fish/saltwater/angelfish.png' },
          { name: 'Wrasse', image: '/images/categories/fish/saltwater/wrasse.png' },
        ]
      },
      stocking: {
        name: 'Stocking',
        image: '/images/categories/fish/stocking.png',
        items: [
          { name: 'Compatibility', image: '/images/categories/fish/compatibility.png' },
          { name: 'Biomass', image: '/images/categories/fish/biomass.png' },
          { name: 'Quarantine', image: '/images/categories/fish/quarantine.png' },
        ]
      },
      waterChemistry: {
        name: 'Water Chemistry',
        image: '/images/categories/chemistry.png',
        items: [
          { name: 'Salinity', image: '/images/categories/salinity.png' },
          { name: 'Calcium/Alkalinity', image: '/images/categories/calcium.png' },
          { name: 'Nitrates/Phosphates', image: '/images/categories/nutrients.png' },
        ]
      },
      shareStories: {
        name: 'Share Stories/Pictures',
        image: '/images/categories/photos.png',
        items: [
          { name: 'Tank Photos', image: '/images/categories/tank-photos.png' },
          { name: 'Success Stories', image: '/images/categories/success.png' },
        ]
      }
    }
  },
  freshwater: {
    name: 'Freshwater',
    image: '/images/categories/freshwater/freshwateraquarium.jpeg',
    subcategories: {
      plants: {
        name: 'Plants',
        image: '/images/categories/plants/plants.jpeg',
        items: [
          { name: 'Java Fern', image: '/images/categories/plants/java-fern.png' },
          { name: 'Anubias', image: '/images/categories/plants/anubias.png' },
          { name: 'Carpet Plants', image: '/images/categories/plants/carpet.png' },
          { name: 'Stem Plants', image: '/images/categories/plants/stem.png' },
        ]
      },
      fish: {
        name: 'Fish (Freshwater)',
        image: '/images/categories/fish/freshwater/freshwaterfish.jpeg',
        items: [
          { name: 'Betta', image: '/images/categories/fish/freshwater/betta.png' },
          { name: 'Tetra', image: '/images/categories/fish/freshwater/tetra.png' },
          { name: 'Cichlid', image: '/images/categories/fish/freshwater/cichlid.png' },
          { name: 'Guppy', image: '/images/categories/fish/freshwater/guppy.png' },
        ]
      },
      aquascapes: {
        name: 'Aquascapes',
        image: '/images/categories/freshwater/freshwateraquarium.jpeg',
        items: [
          { name: 'Nature Style', image: '/images/categories/nature-style.png' },
          { name: 'Dutch Style', image: '/images/categories/dutch-style.png' },
          { name: 'Iwagumi', image: '/images/categories/iwagumi.png' },
        ]
      },
      stocking: {
        name: 'Stocking',
        image: '/images/categories/fish/stocking.png',
        items: [
          { name: 'Compatibility', image: '/images/categories/fish/compatibility.png' },
          { name: 'Biomass', image: '/images/categories/fish/biomass.png' },
          { name: 'Quarantine', image: '/images/categories/fish/quarantine.png' },
        ]
      },
      waterChemistry: {
        name: 'Water Chemistry',
        image: '/images/categories/chemistry.png',
        items: [
          { name: 'pH Levels', image: '/images/categories/ph.png' },
          { name: 'Ammonia/Nitrite', image: '/images/categories/ammonia.png' },
          { name: 'Nitrates', image: '/images/categories/nitrates.png' },
        ]
      },
      shareStories: {
        name: 'Share Stories/Pictures',
        image: '/images/categories/photos.png',
        items: [
          { name: 'Tank Photos', image: '/images/categories/tank-photos.png' },
          { name: 'Success Stories', image: '/images/categories/success.png' },
        ]
      }
    }
  }
};

/**
 * Get category by key
 */
export const getCategory = (key) => {
  return CATEGORIES[key];
};

/**
 * Get all main category keys (Saltwater/Freshwater)
 */
export const getMainCategories = () => {
  return Object.keys(CATEGORIES);
};

/**
 * Get subcategories for a main category
 */
export const getSubcategories = (categoryKey) => {
  return CATEGORIES[categoryKey]?.subcategories || {};
};
