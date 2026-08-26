/**
 * Teams — localStorage
 */
let TEAMS_KEY = "duto_teams";

function loadTeams() {
  return loadData(TEAMS_KEY, []);
}

function saveTeams(teams) {
  saveData(TEAMS_KEY, teams);
}

function getCurrentUserId() {
  let user = loadData("duto_current_user", null);
  return user ? user.id : null;
}

function createTeam(name, description) {
  let teams = loadTeams();
  let userId = getCurrentUserId();
  let team = {
    id: makeId(),
    name: name,
    description: description || "",
    ownerId: userId,
    members: userId ? [userId] : [],
    createdAt: new Date().toISOString()
  };
  teams.push(team);
  saveTeams(teams);
  return team;
}

function deleteTeam(id) {
  saveTeams(
    loadTeams().filter(function (t) {
      return t.id !== id;
    })
  );
}

function getTeamById(id) {
  let teams = loadTeams();
  for (let i = 0; i < teams.length; i++) {
    if (teams[i].id === id) return teams[i];
  }
  return null;
}

function addTeamMember(teamId, userId) {
  let t = getTeamById(teamId);
  if (!t) return false;
  if (t.members.indexOf(userId) === -1) {
    t.members.push(userId);
    let teams = loadTeams();
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].id === teamId) {
        teams[i] = t;
        break;
      }
    }
    saveTeams(teams);
  }
  return true;
}

function findUserByEmailOrName(query) {
  let users = loadData("duto_users", []);
  let q = (query || "").toLowerCase().trim();
  for (let i = 0; i < users.length; i++) {
    if (
      (users[i].email && users[i].email.toLowerCase() === q) ||
      (users[i].fullName && users[i].fullName.toLowerCase().indexOf(q) !== -1)
    ) {
      return users[i];
    }
  }
  return null;
}
