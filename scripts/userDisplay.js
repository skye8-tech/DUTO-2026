/** Show only full names for members (no email, no @username in lists) */
function getUserDisplayName(userId) {
  if (typeof findUserById !== "function") return "Member";
  let u = findUserById(userId);
  if (!u) return "Member";
  return u.fullName || "Member";
}

function formatMemberNames(idList) {
  if (!idList || !idList.length) return "No members";
  let names = [];
  for (let i = 0; i < idList.length; i++) {
    names.push(getUserDisplayName(idList[i]));
  }
  return names.join(", ");
}
