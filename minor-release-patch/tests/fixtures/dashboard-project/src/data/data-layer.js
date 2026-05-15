// Monolithic data layer — all domain data flows through one module.
// Arch track target: split into user, team, org domain services.

async function fetchUserData(userId) {
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
}

async function fetchTeamMembers(teamId) {
  const res = await fetch(`/api/teams/${teamId}/members`);
  return res.json();
}

async function loadOrgSettings(orgId) {
  const res = await fetch(`/api/orgs/${orgId}/settings`);
  return res.json();
}

async function applyPermissionFilters(userId, resources) {
  const res = await fetch(`/api/permissions/filter`, {
    method: "POST",
    body: JSON.stringify({ userId, resources }),
  });
  return res.json();
}

module.exports = { fetchUserData, fetchTeamMembers, loadOrgSettings, applyPermissionFilters };
