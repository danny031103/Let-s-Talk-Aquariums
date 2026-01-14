/**
 * Category Images
 * 
 * Centralized image exports for categories.
 * These are imported as ES modules so Webpack bundles them.
 */

// Saltwater
import saltwaterImg from './saltwater/saltwater.jpeg';

// Freshwater
import freshwaterImg from './freshwater/freshwateraquarium.jpeg';

// Coral
import coralImg from './coral/coral.jpeg';
import coralpicImg from './coral/coralpic.jpeg';

// Plants
import plantsImg from './plants/plants.jpeg';

// Fish - Saltwater
import saltwaterFishImg from './fish/saltwater/saltwaterfish.jpeg';

// Fish - Freshwater
import freshwaterFishImg from './fish/freshwater/freshwaterfish.jpeg';

export const categoryImages = {
  saltwater: {
    main: saltwaterImg,
  },
  freshwater: {
    main: freshwaterImg,
  },
  coral: {
    main: coralImg,
    reef: coralpicImg,
  },
  plants: {
    main: plantsImg,
  },
  fish: {
    saltwater: saltwaterFishImg,
    freshwater: freshwaterFishImg,
  },
};

export default categoryImages;
