"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = calculateAgeAtAdmission;
function calculateAgeAtAdmission(dob, admissionDate) {
    if (!dob || !admissionDate)
        return null;
    var dobDate = dob instanceof Date ? dob : new Date(dob);
    var admission = admissionDate instanceof Date ? admissionDate : new Date(admissionDate);
    if (isNaN(dobDate.getTime()) || isNaN(admission.getTime()))
        return null;
    var years = admission.getFullYear() - dobDate.getFullYear();
    var months = admission.getMonth() - dobDate.getMonth();
    var days = admission.getDate() - dobDate.getDate();
    // Adjust days and months if negative
    if (days < 0) {
        // Go to previous month
        var prevMonthDate = new Date(admission.getFullYear(), admission.getMonth(), 0);
        var daysInPrevMonth = prevMonthDate.getDate();
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
