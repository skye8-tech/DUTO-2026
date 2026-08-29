/**
 * Invites — confirm before joining team or project
 */
const INVITES_KEY = "duto_invites";

function loadInvites() {
  return loadData(INVITES_KEY, []);
}

function saveInvites(invites) {
  saveData(INVITES_KEY, invites);
}

function createInvite(toUserId, type, targetId, targetName) {
  let me = getCurrentUser();
  if (!me) return null;
  let invites = loadInvites();
  // avoid duplicate pending
  for (let i = 0; i < invites.length; i++) {
    if (
      invites[i].status === "pending" &&
      invites[i].toUserId === toUserId &&
      invites[i].type === type &&
      invites[i].targetId === targetId
    ) {
      return invites[i];
    }
  }
  let invite = {
    id: makeId(),
    fromUserId: me.id,
    fromName: me.fullName,
    toUserId: toUserId,
    type: type, // "team" | "project"
    targetId: targetId,
    targetName: targetName || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  invites.push(invite);
  saveInvites(invites);
  if (typeof addNotification === "function") {
    addNotification(
      toUserId,
      "invite",
      me.fullName + " invited you to " + type + " “" + targetName + "”"
    );
  }
  return invite;
}

function getPendingInvitesForMe() {
  let me = getCurrentUser();
  if (!me) return [];
  let invites = loadInvites();
  let out = [];
  for (let i = 0; i < invites.length; i++) {
    if (invites[i].toUserId === me.id && invites[i].status === "pending") {
      out.push(invites[i]);
    }
  }
  return out;
}

function acceptInvite(inviteId) {
  let invites = loadInvites();
  let me = getCurrentUser();
  for (let i = 0; i < invites.length; i++) {
    if (invites[i].id === inviteId && invites[i].toUserId === me.id) {
      invites[i].status = "accepted";
      saveInvites(invites);
      if (invites[i].type === "team" && typeof addTeamMember === "function") {
        addTeamMember(invites[i].targetId, me.id);
      }
      if (invites[i].type === "project" && typeof addProjectMember === "function") {
        addProjectMember(invites[i].targetId, me.id);
      }
      return true;
    }
  }
  return false;
}

function declineInvite(inviteId) {
  let invites = loadInvites();
  let me = getCurrentUser();
  for (let i = 0; i < invites.length; i++) {
    if (invites[i].id === inviteId && invites[i].toUserId === me.id) {
      invites[i].status = "declined";
      saveInvites(invites);
      return true;
    }
  }
  return false;
}
