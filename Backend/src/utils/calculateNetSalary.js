const claculateNetSalary = (salary) => {
  let totalEarnings = 0;
  let totalDeductions = 0;
  const earningKeys = ['basic', 'hra', 'cca', 'medical', 'transport', 'employer_pf', 'performance_incentive']; // Update with your specific earning keys
  const deductionKeys = ['pf_deduction', 'esi_deduction', 'professional_tax', 'medical_insurance', 'income_tax', 'leave_deduction']; // Update with your specific deduction keys

  // Calculate total earnings
  for (const key of earningKeys) {
    if (salary[key] !== null && salary[key] !== undefined) {
      totalEarnings += salary[key];
    }
  }

  // Calculate total deductions
  for (const key of deductionKeys) {
    if (salary[key] !== null && salary[key] !== undefined) {
      totalDeductions += salary[key];
    }
  }

  if (totalEarnings === 0 && totalDeductions === 0) {
    return false;
  } else {
    // Calculate and return net salary
    const netSalary = totalEarnings - totalDeductions;
    return netSalary;
  }
};

const convertToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num < 20) {
    return ones[num];
  }
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }
  if (num < 1000) {
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertToWords(num % 100) : '');
  }
  if (num < 100000) {
    return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertToWords(num % 1000) : '');
  }
  if (num < 10000000) {
    return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convertToWords(num % 100000) : '');
  }
  return convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convertToWords(num % 10000000) : '');
};


module.exports = {
  claculateNetSalary,
  convertToWords
};
