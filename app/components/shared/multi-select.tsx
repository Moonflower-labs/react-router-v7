import { Category } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

interface MultiSelectProps {
  options: string[];
  name: string;
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
  onOptionsChange?: () => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = React.memo(({ name, options, selectedOptions, setSelectedOptions, onOptionsChange }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleSelectOption = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option) // Deselect
      : [...selectedOptions, option]; // Select

    setSelectedOptions(newSelectedOptions);
    onOptionsChange ? onOptionsChange() : null;
  };

  const handleRemoveOption = (option: string) => {
    setSelectedOptions(selectedOptions.filter(o => o !== option)); // Remove selected option
    onOptionsChange ? onOptionsChange() : null;
  };

  const filteredOptions = options.filter(option => option.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 mb-3">
      <div
        className={`flex flex-wrap border border-gray-300 rounded-lg p-2 cursor-pointer shadow ${isDropdownOpen ? "border-primary" : ""}`}
        onClick={toggleDropdown}
        tabIndex={0}>
        {selectedOptions.map(option => (
          <div key={option} className="flex items-center bg-success/20 rounded-full px-2 py-1 m-1">
            {option}
            <button
              type="button"
              className="ml-2 text-primary"
              onClick={e => {
                e.stopPropagation();
                handleRemoveOption(option);
              }}>
              &times;
            </button>
          </div>
        ))}

        <input
          type="text"
          placeholder={!selectedOptions.length ? "Selecciona opciones..." : ""}
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="flex-grow border-none outline-none bg-base-100"
        />
      </div>

      <AnimatePresence mode="wait">
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ opacity: { duration: 0 }, height: { duration: 0.4 } }}
            className="overflow-hidden mt-1 w-full rounded-lg border border-neutral-content bg-base-100 shadow-lg z-10">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option}
                  className={"flex gap-3 items-center justify-between cursor-pointer px-4 py-2 hover:bg-base-200"}
                  onClick={() => handleSelectOption(option)}>
                  {option}
                  {selectedOptions.includes(option) && <FaCheck className="text-info" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hidden Select for form submission, useful if you want to use standard form inputs */}
      <select
        multiple
        name={name}
        className="hidden" // Hide the actual select element
        value={selectedOptions}
        onChange={() => {}}>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});

interface MultiSelectIdProps {
  options: Category[];
  name: string;
  selectedOptions: Category[];
  setSelectedOptions: (options: Category[]) => void;
  onOptionsChange?: () => void;
}

export const MultiSelectId: React.FC<MultiSelectIdProps> = React.memo(({ name, options, selectedOptions, setSelectedOptions, onOptionsChange }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  // const isSelected = selectedOptions.some(option => (option.id === id))

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleSelectOption = (option: Category) => {
    const newSelectedOptions = selectedOptions.some(o => o.id === option.id)
      ? selectedOptions.filter(o => o.id !== option.id) // Deselect
      : [...selectedOptions, option]; // Select

    setSelectedOptions(newSelectedOptions);
    onOptionsChange ? onOptionsChange() : null;
  };

  const handleRemoveOption = (optionId: string) => {
    setSelectedOptions(selectedOptions.filter(o => o.id !== optionId)); // Remove selected option
    onOptionsChange ? onOptionsChange() : null;
  };

  const filteredOptions = options.filter(option => option.name.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 mb-3">
      <div
        className={`flex flex-wrap border border-gray-300 rounded-lg p-2 cursor-pointer shadow ${isDropdownOpen ? "border-primary" : ""}`}
        onClick={toggleDropdown}
        tabIndex={0}>
        {selectedOptions.map(option => (
          <div key={option.id} className="flex items-center bg-success/20 rounded-full px-2 py-1 m-1">
            {option.name}
            <button
              type="button"
              className="ml-2 text-primary"
              onClick={e => {
                e.stopPropagation();
                handleRemoveOption(option.id);
              }}>
              &times;
            </button>
          </div>
        ))}

        <input
          type="text"
          placeholder={!selectedOptions.length ? "Selecciona opciones..." : ""}
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="flex-grow border-none outline-none bg-base-100"
        />
      </div>

      <AnimatePresence mode="wait">
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ opacity: { duration: 0 }, height: { duration: 0.4 } }}
            className="overflow-hidden mt-1 w-full rounded-lg border border-neutral-content bg-base-100 shadow-lg z-10">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className={"flex gap-3 items-center justify-between cursor-pointer px-4 py-2 hover:bg-base-200"}
                  onClick={() => handleSelectOption(option)}>
                  {option.name}
                  {selectedOptions.some(o => o.id === option.id) && <FaCheck className="text-info" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hidden Select for form submission, useful if you want to use standard form inputs */}
      <select
        multiple
        name={name}
        className="hidden" // Hide the actual select element
        value={selectedOptions.map(o => o.id)}
        onChange={() => {}}>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
});
