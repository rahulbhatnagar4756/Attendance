import React from 'react';

const SalarySlipDropdown = ({ allSalariesData, onDateSelect }) => {
  const dateOptions = [];
  if(allSalariesData.length > 0){
    for(let salary of allSalariesData){
      dateOptions.push({
        value: `${salary.month},${salary.year}`,
        label: `${salary.month}, ${salary.year}`
      });
    }
  }

  const handleSelect = (e) => {
    const selectedDate = e.target.value;
    console.log(`Selected month: ${selectedDate}`);
    onDateSelect(selectedDate);
  };

  return (
    <div>
      <select
        className="form-control"
        required
        name="selectedDate"
        onInvalid={(e) => e.target.setCustomValidity('Please select a month and year')}
        onInput={(e) => e.target.setCustomValidity('')}
        onChange={handleSelect}
      >
        <option value="">Select Month, Year</option>
        {dateOptions.length > 0 && dateOptions.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SalarySlipDropdown;
