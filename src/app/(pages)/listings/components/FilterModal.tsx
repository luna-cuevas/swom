"use client";
import { useState, useEffect } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    mainOrSecond: string;
    amenities: {
      [key: string]: boolean;
    };
  };
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  setCurrentPage: (page: number) => void;
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        className="flex w-full items-center justify-between py-5 text-left group transition-colors"
        onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base font-medium text-gray-800 group-hover:text-[#172544]">
          {title}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-all duration-300 group-hover:text-[#172544] ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}>
        <div className="pb-5 pt-2">{children}</div>
      </div>
    </div>
  );
};

const FilterButton = ({
  selected,
  onClick,
  children,
  small = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`${
      small ? "px-3 py-1.5" : "px-4 py-2.5"
    } rounded-lg text-sm font-medium transition-all duration-200 ${
      selected
        ? "bg-[#172544] text-white shadow-md hover:bg-[#0f1a2e]"
        : "bg-white text-gray-700 border border-gray-200 hover:border-[#172544] hover:text-[#172544]"
    }`}>
    {children}
  </button>
);

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  clearFilters,
  hasActiveFilters,
  setCurrentPage,
}: FilterModalProps) {
  // Add temporary state for filters
  const [tempFilters, setTempFilters] = useState(filters);
  const [hasChanges, setHasChanges] = useState(false);

  // Update temp filters when main filters change
  useEffect(() => {
    setTempFilters(filters);
    setHasChanges(false);
  }, [filters]);

  // Update temp filters and mark as changed
  const updateTempFilters = (newFilters: typeof filters) => {
    setTempFilters(newFilters);
    setHasChanges(true);
  };

  // Apply filters and close modal
  const handleSave = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    setHasChanges(false);
    onClose();
  };

  // Handle closing without saving
  const handleClose = () => {
    setTempFilters(filters);
    setHasChanges(false);
    onClose();
  };

  // Handle clearing filters
  const handleClear = () => {
    clearFilters();
    setCurrentPage(1);
    setHasChanges(false);
    onClose();
  };

  return (
    <>
      {/* Overlay with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000000] transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white shadow-2xl z-[100000000] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              <Accordion title="Property Details">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <FilterButton
                      selected={tempFilters.propertyType === "apartment"}
                      onClick={() =>
                        updateTempFilters({
                          ...tempFilters,
                          propertyType:
                            tempFilters.propertyType === "apartment"
                              ? ""
                              : "apartment",
                        })
                      }>
                      Apartment
                    </FilterButton>
                    <FilterButton
                      selected={tempFilters.propertyType === "house"}
                      onClick={() =>
                        updateTempFilters({
                          ...tempFilters,
                          propertyType:
                            tempFilters.propertyType === "house" ? "" : "house",
                        })
                      }>
                      House
                    </FilterButton>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FilterButton
                      selected={tempFilters.mainOrSecond === "main"}
                      onClick={() =>
                        updateTempFilters({
                          ...tempFilters,
                          mainOrSecond:
                            tempFilters.mainOrSecond === "main" ? "" : "main",
                        })
                      }>
                      Main Home
                    </FilterButton>
                    <FilterButton
                      selected={tempFilters.mainOrSecond === "second"}
                      onClick={() =>
                        updateTempFilters({
                          ...tempFilters,
                          mainOrSecond:
                            tempFilters.mainOrSecond === "second"
                              ? ""
                              : "second",
                        })
                      }>
                      Second Home
                    </FilterButton>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Rooms">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-3">
                      Bedrooms
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, "5+"].map((num) => (
                        <FilterButton
                          key={num}
                          selected={tempFilters.bedrooms === num.toString()}
                          onClick={() =>
                            updateTempFilters({
                              ...tempFilters,
                              bedrooms:
                                tempFilters.bedrooms === num.toString()
                                  ? ""
                                  : num.toString(),
                            })
                          }
                          small>
                          {num}
                        </FilterButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-3">
                      Bathrooms
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, "4+"].map((num) => (
                        <FilterButton
                          key={num}
                          selected={tempFilters.bathrooms === num.toString()}
                          onClick={() =>
                            updateTempFilters({
                              ...tempFilters,
                              bathrooms:
                                tempFilters.bathrooms === num.toString()
                                  ? ""
                                  : num.toString(),
                            })
                          }
                          small>
                          {num}
                        </FilterButton>
                      ))}
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Amenities">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(tempFilters.amenities).map(
                    ([amenity, isSelected]) => (
                      <FilterButton
                        key={amenity}
                        selected={isSelected}
                        onClick={() =>
                          updateTempFilters({
                            ...tempFilters,
                            amenities: {
                              ...tempFilters.amenities,
                              [amenity]: !isSelected,
                            },
                          })
                        }
                        small>
                        {amenity.split("_").join(" ")}
                      </FilterButton>
                    )
                  )}
                </div>
              </Accordion>
            </div>
          </div>

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-gray-300 transition-colors">
                Clear All
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  hasChanges
                    ? "bg-[#172544] text-white hover:bg-[#0f1a2e]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
