import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import "./CustomSelect.css";

const CustomSelect = ({ value, onChange, options = [], className = "", placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    setIsOpen(false);
    if (onChange) {
      // Pass synthetic event for full backwards compatibility with native onChange handlers
      onChange({ target: { value: optionValue } });
    }
  };

  return (
    <div className={`custom-select-container ${className} ${isOpen ? "open" : ""}`} ref={containerRef}>
      <button
        type="button"
        className="custom-select-trigger button-ripple"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="selected-content">
          {selectedOption?.icon && <span className="option-icon">{selectedOption.icon}</span>}
          <span className="option-label">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <FaChevronDown className={`select-arrow ${isOpen ? "rotate" : ""}`} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          <ul className="select-options-list">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  className={`select-option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="option-item-left">
                    {option.icon && <span className="option-icon">{option.icon}</span>}
                    <span className="option-label">{option.label}</span>
                  </span>
                  {isSelected && <FaCheck className="check-icon" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
