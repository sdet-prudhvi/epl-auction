const slotTemplate = [
  { slotNumber: 1, label: "Position 1", role: "Batting Slot" },
  { slotNumber: 2, label: "Position 2", role: "Batting Slot" },
  { slotNumber: 3, label: "Position 3", role: "Batting Slot" },
  { slotNumber: 4, label: "Position 4", role: "Wicketkeeper Slot" },
  { slotNumber: 5, label: "Position 5", role: "Batting Slot" },
  { slotNumber: 6, label: "Position 6", role: "Batting Slot" },
  { slotNumber: 7, label: "Position 7", role: "All-Rounder Slot" },
  { slotNumber: 8, label: "Position 8", role: "All-Rounder Slot" },
  { slotNumber: 9, label: "Position 9", role: "Bowling Slot" },
  { slotNumber: 10, label: "Position 10", role: "Bowling Slot" },
  { slotNumber: 11, label: "Position 11", role: "Bowling Slot" },
  { slotNumber: 12, label: "Position 12", role: "Bowling Slot" },
];

const teams = [
  {
    id: "gowtham-xis",
    name: "Gowtham XI's",
    code: "GXI",
    owner: "Draft team",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "rahul-xis",
    name: "Rahul XI's",
    code: "RXI",
    owner: "Draft team",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "sunil-xis",
    name: "Sunil XI's",
    code: "SXI",
    owner: "Draft team",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "acharya-xis",
    name: "Acharya XI'S",
    code: "AXI",
    owner: "Draft team",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
];

const ownerAssignments = [
  {
    playerName: "GOWTHAM GV",
    teamId: "gowtham-xis",
    slotNumber: 10,
  },
  {
    playerName: "SUNIL LAKKAKULA",
    teamId: "sunil-xis",
    slotNumber: 10,
  },
  {
    playerName: "Rahul Krishna Madasu",
    teamId: "rahul-xis",
    slotNumber: 2,
  },
  {
    playerName: "Achari",
    teamId: "acharya-xis",
    slotNumber: 11,
  },
];

const roleConfig = {
  batsman: {
    roleLabel: "Batsman",
  },
  keeper_batsman: {
    roleLabel: "Keeper Batsman",
  },
  all_rounder: {
    roleLabel: "All Rounder",
  },
  bowler: {
    roleLabel: "Bowler",
  },
};

const draftPlayers = [
  { name: "Dr.Anand Yadav", roleKey: "all_rounder", dedicatedSlotNumber: 11 },
  { name: "PD", roleKey: "batsman", dedicatedSlotNumber: 3 },
  { name: "Kiran", roleKey: "batsman", dedicatedSlotNumber: 1 },
  { name: "Parasuram", roleKey: "batsman", dedicatedSlotNumber: 5 },
  { name: "Varunkrishnareddy", roleKey: "all_rounder", dedicatedSlotNumber: 8 },
  { name: "GOWTHAM GV", roleKey: "bowler", dedicatedSlotNumber: 10 },
  { name: "Raghu Ashrith S", roleKey: "bowler", dedicatedSlotNumber: 10 },
  { name: "VAKA SANTOSH KUMAR", roleKey: "batsman", dedicatedSlotNumber: 2 },
  { name: "Hari Ram Prasad", roleKey: "batsman", dedicatedSlotNumber: 5 },
  { name: "KUNA RAHUL KAMESWARA RAO", roleKey: "keeper_batsman", dedicatedSlotNumber: 4 },
  { name: "Prudhvi Kunchangi", roleKey: "all_rounder", dedicatedSlotNumber: 8 },
  { name: "Gangadhar rao", roleKey: "batsman", dedicatedSlotNumber: 6 },
  { name: "Rahul Krishna Madasu", roleKey: "batsman", dedicatedSlotNumber: 2 },
  { name: "satish kumar bejawada", roleKey: "all_rounder", dedicatedSlotNumber: 6 },
  { name: "Akaramani Makaraju Yadav", roleKey: "all_rounder", dedicatedSlotNumber: 6 },
  { name: "PRANAY", roleKey: "batsman", dedicatedSlotNumber: 2 },
  { name: "OMMI SRINU", roleKey: "all_rounder", dedicatedSlotNumber: 7 },
  { name: "Poliraju", roleKey: "batsman", dedicatedSlotNumber: 8 },
  { name: "Jaya Kumar", roleKey: "keeper_batsman", dedicatedSlotNumber: 4 },
  { name: "Pindra Prasanth Sai", roleKey: "keeper_batsman", dedicatedSlotNumber: 2 },
  { name: "Chandu pinninti", roleKey: "batsman", dedicatedSlotNumber: 1 },
  { name: "Kottana Sashi Kumar", roleKey: "bowler", dedicatedSlotNumber: 11 },
  { name: "SUNIL LAKKAKULA", roleKey: "bowler", dedicatedSlotNumber: 10 },
  { name: "Naveen Koneti", roleKey: "keeper_batsman", dedicatedSlotNumber: 4 },
  { name: "Majji Rambabu", roleKey: "all_rounder", dedicatedSlotNumber: 8 },
  { name: "Palli sankar", roleKey: "bowler", dedicatedSlotNumber: 9 },
  { name: "Potnuru Raja", roleKey: "all_rounder", dedicatedSlotNumber: 12 },
  { name: "Punnam sri ram", roleKey: "all_rounder", dedicatedSlotNumber: 11 },
  { name: "Pavan Srinu", roleKey: "batsman", dedicatedSlotNumber: 3 },
  { name: "Abhishek Duvvi", roleKey: "batsman", dedicatedSlotNumber: 6 },
  { name: "Akash Kona", roleKey: "batsman", dedicatedSlotNumber: 1 },
  { name: "Aegi Niraj Kumar", roleKey: "batsman", dedicatedSlotNumber: 5 },
  { name: "Santhosh Maddila", roleKey: "batsman", dedicatedSlotNumber: 3 },
  { name: "SANTOSH PILLA", roleKey: "bowler", dedicatedSlotNumber: 10 },
  { name: "BNR", roleKey: "bowler", dedicatedSlotNumber: 9 },
  { name: "M Karthik", roleKey: "batsman", dedicatedSlotNumber: 7 },
  { name: "Vinod kumar", roleKey: "batsman", dedicatedSlotNumber: 7 },
  { name: "Vinay k", roleKey: "batsman", dedicatedSlotNumber: 5 },
  { name: "Rds Charan", roleKey: "bowler", dedicatedSlotNumber: 12 },
  { name: "KORRAI MANIKANTA", roleKey: "all_rounder", dedicatedSlotNumber: 9 },
  { name: "Surisetty Raviteja", roleKey: "bowler", dedicatedSlotNumber: 12 },
  { name: "PILLA ARUN KUMAR", roleKey: "bowler", dedicatedSlotNumber: 9 },
  { name: "GANGA YADAV", roleKey: "all_rounder", dedicatedSlotNumber: 7 },
  { name: "Abhi Yadav", roleKey: "keeper_batsman", dedicatedSlotNumber: 4 },
  { name: "Rayavarapu Phanindra", roleKey: "bowler", dedicatedSlotNumber: 12 },
  { name: "Allada Venkatesh", roleKey: "batsman", dedicatedSlotNumber: 3 },
  { name: "Dinesh", roleKey: "batsman", dedicatedSlotNumber: 1 },
  { name: "Achari", roleKey: "bowler", dedicatedSlotNumber: 11 },
];

const players = draftPlayers.map((player, index) => ({
  id: `player-${String(index + 1).padStart(2, "0")}`,
  name: player.name,
  roleKey: player.roleKey,
  roleLabel: roleConfig[player.roleKey].roleLabel,
  eligibleSlotNumbers: [player.dedicatedSlotNumber],
  eligibilityLabel: `Position ${player.dedicatedSlotNumber}`,
  basePrice: 3000,
  status: "Pending",
  soldToTeamId: null,
  soldAmount: null,
  assignedSlotNumber: null,
  dedicatedSlotNumber: player.dedicatedSlotNumber,
  isPlaceholder: Boolean(player.isPlaceholder),
}));

function createInitialState() {
  return {
    leagueName: "Equality Premier League",
    seasonName: "Season 1",
    teamCount: teams.length,
    targetPlayerCount: 48,
    lockedPlayerCount: ownerAssignments.length,
    liveAuctionPlayerCount: players.length - ownerAssignments.length,
    importedPlayerCount: players.filter((player) => !player.isPlaceholder).length,
    totalPlayers: players.length,
    squadSize: slotTemplate.length,
    currentSlotNumber: 1,
    selectedPlayerId: null,
    currentBid: 0,
    leadingTeamId: null,
    isLive: false,
    saleHistory: [],
    activityLog: [
      "Draft player workbook imported for smoke testing.",
      "Players are now locked to dedicated positions from the workbook instead of role-based slot groups.",
      "Four owner-players are pre-assigned to their own teams as locked roster slots before the live auction begins.",
      "Each team starts at 1/12 filled, purse stays at 96,000, and only 44 live picks remain on the floor.",
      "Two draft names were added outside the sheet to keep the smoke roster moving while the final EPL list is still being finalized.",
      "Base price is set to 3,000 and each team purse is set to 96,000 points.",
      "All names and dedicated slot assignments are still provisional until the final EPL list is confirmed.",
    ],
  };
}

export { createInitialState, ownerAssignments, players, slotTemplate, teams };
