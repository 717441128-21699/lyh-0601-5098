function generateOrderNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PT${year}${month}${day}${random}`;
}

function generateTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function checkMemberLevel(totalCourses, totalSpent) {
  if (totalCourses >= 20 || totalSpent >= 5000) {
    return 'gold';
  } else if (totalCourses >= 10 || totalSpent >= 2000) {
    return 'silver';
  }
  return 'normal';
}

function calculateUpgradeProgress(currentLevel, totalCourses, totalSpent) {
  const levels = [
    { level: 'normal', coursesNeeded: 10, amountNeeded: 2000, next: 'silver' },
    { level: 'silver', coursesNeeded: 20, amountNeeded: 5000, next: 'gold' },
    { level: 'gold', coursesNeeded: Infinity, amountNeeded: Infinity, next: undefined }
  ];

  const current = levels.find(l => l.level === currentLevel);
  if (!current || !current.next) {
    return {
      currentLevel,
      nextLevel: undefined,
      coursesNeeded: 0,
      coursesCompleted: totalCourses,
      amountNeeded: 0,
      amountSpent: totalSpent,
      progressPercent: 100
    };
  }

  const courseProgress = Math.min(100, (totalCourses / current.coursesNeeded) * 100);
  const amountProgress = Math.min(100, (totalSpent / current.amountNeeded) * 100);

  return {
    currentLevel,
    nextLevel: current.next,
    coursesNeeded: current.coursesNeeded,
    coursesCompleted: totalCourses,
    amountNeeded: current.amountNeeded,
    amountSpent: totalSpent,
    progressPercent: Math.round(Math.max(courseProgress, amountProgress))
  };
}

module.exports = {
  generateOrderNo,
  generateTicketCode,
  calculateDistance,
  formatDate,
  checkMemberLevel,
  calculateUpgradeProgress
};
