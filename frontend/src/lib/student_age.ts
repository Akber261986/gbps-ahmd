// Generate student age from date of birth and admission date
export type AgeBreakdown = {
  y: number; // years
  m: number; // months
  d: number; // days
};

export default function calculateAgeAtAdmission(
  dob: Date | string | null | undefined,
  admissionDate: Date | string | null | undefined
): AgeBreakdown | null {
  if (!dob || !admissionDate) return null;

  const dobDate = dob instanceof Date ? dob : new Date(dob);
  const admission =
    admissionDate instanceof Date ? admissionDate : new Date(admissionDate);

  if (isNaN(dobDate.getTime()) || isNaN(admission.getTime())) return null;

  let years = admission.getFullYear() - dobDate.getFullYear();
  let months = admission.getMonth() - dobDate.getMonth();
  let days = admission.getDate() - dobDate.getDate();

  // Adjust days and months if negative
  if (days < 0) {
    // Go to previous month
    const prevMonthDate = new Date(admission.getFullYear(), admission.getMonth(), 0);
    const daysInPrevMonth = prevMonthDate.getDate();

    days += daysInPrevMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    y: years,
    m: months,
    d: days,
  };
}
