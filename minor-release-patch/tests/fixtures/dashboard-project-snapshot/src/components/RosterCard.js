// Roster card component — renders a single team member.
// Design track target: fix excessive padding / whitespace.

const { fetchUserData } = require("../data/data-layer");

async function renderRosterCards(teamMembers) {
  const cards = await Promise.all(
    teamMembers.map(async (member) => {
      const user = await fetchUserData(member.id); // called per-card — perf hotspot
      return `<div class="roster-card">${user.name}</div>`;
    })
  );
  return cards.join("\n");
}

module.exports = { renderRosterCards };
