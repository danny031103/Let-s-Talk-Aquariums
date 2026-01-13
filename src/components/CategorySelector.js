/**
 * CategorySelector Component
 * 
 * Hierarchical category selection with refined logic:
 * - Step 1: User selects Saltwater or Freshwater
 * - Step 2: Display relevant options for that environment
 * - Step 3: Further subcategories appear dynamically
 */

import React, { useState } from 'react';
import { CATEGORIES } from '../utils/categories';

const CategorySelector = ({ onCategorySelect, selectedCategory = null }) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState(selectedCategory?.main || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(selectedCategory?.sub || null);

  const handleMainCategorySelect = (categoryKey) => {
    setSelectedMainCategory(categoryKey);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryKey) => {
    setSelectedSubcategory(subcategoryKey);
    const category = CATEGORIES[selectedMainCategory];
    const subcategory = category.subcategories[subcategoryKey];
    if (onCategorySelect) {
      onCategorySelect({
        main: selectedMainCategory,
        sub: subcategoryKey,
        name: `${category.name} - ${subcategory.name}`,
        image: subcategory.image
      });
    }
  };

  const handleItemSelect = (item) => {
    if (onCategorySelect) {
      onCategorySelect({
        main: selectedMainCategory,
        sub: selectedSubcategory,
        item: item.name,
        name: item.name,
        image: item.image
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Main Categories (Saltwater/Freshwater) */}
      <div>
        <h3 className="text-sm font-semibold text-gray-100 mb-4">Select Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleMainCategorySelect(key)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${selectedMainCategory === key
                  ? 'border-ocean-500 bg-ocean-600/20'
                  : 'border-dark-600 bg-dark-700/50 hover:border-ocean-500/50 hover:bg-dark-700'
                }
              `}
            >
              <div className="h-32 rounded-lg overflow-hidden bg-dark-900 border border-dark-600 mb-3">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className={`font-medium ${selectedMainCategory === key ? 'text-ocean-400' : 'text-gray-100'}`}>
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Subcategories based on selected environment */}
      {selectedMainCategory && CATEGORIES[selectedMainCategory]?.subcategories && (
        <div>
          <h3 className="text-sm font-semibold text-gray-100 mb-4">
            Select {CATEGORIES[selectedMainCategory].name} Topic
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(CATEGORIES[selectedMainCategory].subcategories).map(([key, subcategory]) => (
              <button
                key={key}
                onClick={() => handleSubcategorySelect(key)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedSubcategory === key
                    ? 'border-ocean-500 bg-ocean-600/20'
                    : 'border-dark-600 bg-dark-700/50 hover:border-ocean-500/50 hover:bg-dark-700'
                  }
                `}
              >
                <div className="h-24 rounded-lg overflow-hidden bg-dark-900 border border-dark-600 mb-3">
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className={`font-medium text-sm ${selectedSubcategory === key ? 'text-ocean-400' : 'text-gray-100'}`}>
                  {subcategory.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Items within Subcategory */}
      {selectedMainCategory && selectedSubcategory && 
       CATEGORIES[selectedMainCategory]?.subcategories[selectedSubcategory]?.items && (
        <div>
          <h3 className="text-sm font-semibold text-gray-100 mb-4">
            Select Specific {CATEGORIES[selectedMainCategory].subcategories[selectedSubcategory].name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES[selectedMainCategory].subcategories[selectedSubcategory].items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemSelect(item)}
                className="p-3 rounded-lg border border-dark-600 bg-dark-700/50 hover:border-ocean-500/50 hover:bg-dark-700 transition-all text-left"
              >
                <div className="h-20 rounded-lg overflow-hidden bg-dark-900 border border-dark-600 mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-100">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
