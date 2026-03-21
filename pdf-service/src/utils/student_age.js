function student_age(dob, admissionDate) {
  if (!dob || !admissionDate) return null;

  const dobDate = dob instanceof Date ? dob : new Date(dob);
  const admission = admissionDate instanceof Date ? admissionDate : new Date(admissionDate);

  if (Number.isNaN(dobDate.getTime()) || Number.isNaN(admission.getTime())) return null;
  if (admission < dobDate) return null;

  let years = admission.getFullYear() - dobDate.getFullYear();
  let months = admission.getMonth() - dobDate.getMonth();
  let days = admission.getDate() - dobDate.getDate();

  if (days < 0) {
    const prevMonthDate = new Date(admission.getFullYear(), admission.getMonth(), 0);
    days += prevMonthDate.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { y: years, m: months, d: days };
}

module.exports = student_age;
module.exports.student_age = student_age;
module.exports.default = student_age;
