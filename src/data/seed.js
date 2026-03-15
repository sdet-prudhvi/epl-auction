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
    name: "GOWTHAM'S XI",
    code: "GXI",
    owner: "Draft team",
    logoPath: "/assets/branding/gowtham-logo.png",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "rahul-xis",
    name: "RAHUL'S XI",
    code: "RXI",
    owner: "Draft team",
    logoPath: "/assets/branding/rahul-logo.png",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "sunil-xis",
    name: "SUNIL'S XI",
    code: "SXI",
    owner: "Draft team",
    logoPath: "/assets/branding/sunil-logo.png",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
  {
    id: "acharya-xis",
    name: "ACHARYA'S XI",
    code: "AXI",
    owner: "Draft team",
    logoPath: "/assets/branding/acharya-logo.png",
    purseTotal: 96000,
    purseRemaining: 96000,
    filledSlots: 0,
  },
];

const branding = {
  leagueLogoPath: "/assets/branding/epl-logo.png",
  sponsors: [
    { id: "lfbc", name: "Live Free By Choice", logoPath: "/assets/sponsors/01_LFBC.png" },
    { id: "anu", name: "Anu Beauty Clinic", logoPath: "/assets/sponsors/02_ANU.png" },
    { id: "ami", name: "Amitha Developers", logoPath: "/assets/sponsors/03_AMI.png" },
    { id: "oka", name: "OKA Resorts", logoPath: "/assets/sponsors/04_OKA.png" },
    { id: "bot", name: "BOT9", logoPath: "/assets/sponsors/05_BOT.png" },
    { id: "smile", name: "Smile Care", logoPath: "/assets/sponsors/06_SMILE.png" },
    { id: "mm", name: "MM Fitness Zone", logoPath: "/assets/sponsors/07_MM.png" },
    { id: "kska", name: "KSKA", logoPath: "/assets/sponsors/08_KSKA.png" },
    { id: "mhmc", name: "My Health My Care", logoPath: "/assets/sponsors/09_MHMC.png" },
  ],
};

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

// nominationOrder defines the sequence players are called to the desk within each slot (1 = first, 4 = last)
const draftPlayers = [
  { name: "Dr.Anand Yadav",            roleKey: "all_rounder",   dedicatedSlotNumber: 11, nominationOrder: 3, photoPath: "/assets/players/dr-anand-yadav.jpg" },
  { name: "PD",                         roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 2, photoPath: "/assets/players/pd.jpg" },
  { name: "Kiran",                      roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 4, photoPath: "/assets/players/kiran.jpg" },
  { name: "Parasuram",                  roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 1, photoPath: "/assets/players/parasuram.jpg" },
  { name: "Santosh Yadhav",             roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 3, photoPath: "/assets/players/default.svg" },
  { name: "GOWTHAM GV",                 roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 4, photoPath: "/assets/players/gowtham-gv.jpg" },
  { name: "Raghu Ashrith S",            roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 1, photoPath: "/assets/players/raghu-ashrith-s.jpg" },
  { name: "VAKA SANTOSH KUMAR",         roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 1, photoPath: "/assets/players/vaka-santosh-kumar.jpg" },
  { name: "Hari Ram Prasad",            roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 4, photoPath: "/assets/players/hari-ram-prasad.jpg" },
  { name: "KUNA RAHUL KAMESWARA RAO",   roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 3, photoPath: "/assets/players/kuna-rahul-kameswara-rao.jpg" },
  { name: "Prudhvi Kunchangi",          roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 1, photoPath: "/assets/players/prudhvi-kunchangi.jpg" },
  { name: "Gangadhar rao",              roleKey: "batsman",        dedicatedSlotNumber: 6,  nominationOrder: 1, photoPath: "/assets/players/gangadhar-rao.jpg" },
  { name: "Rahul Krishna Madasu",       roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 4, photoPath: "/assets/players/rahul-krishna-madasu.jpg" },
  { name: "satish kumar bejawada",      roleKey: "all_rounder",   dedicatedSlotNumber: 6,  nominationOrder: 4, photoPath: "/assets/players/satish-kumar-bejawada.jpg" },
  { name: "Akaramani Makaraju Yadav",   roleKey: "all_rounder",   dedicatedSlotNumber: 6,  nominationOrder: 2, photoPath: "/assets/players/akaramani-makaraju-yadav.jpg" },
  { name: "PRANAY",                     roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 2, photoPath: "/assets/players/pranay.jpg" },
  { name: "OMMI SRINU",                 roleKey: "all_rounder",   dedicatedSlotNumber: 7,  nominationOrder: 1, photoPath: "/assets/players/ommi-srinu.jpg" },
  { name: "Poliraju",                   roleKey: "batsman",        dedicatedSlotNumber: 8,  nominationOrder: 4, photoPath: "/assets/players/poliraju.jpg" },
  { name: "Jaya Kumar",                 roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 2, photoPath: "/assets/players/jaya-kumar.jpg" },
  { name: "Pindra Prasanth Sai",        roleKey: "keeper_batsman", dedicatedSlotNumber: 2,  nominationOrder: 3, photoPath: "/assets/players/pindra-prasanth-sai.jpg" },
  { name: "Chandu pinninti",            roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 1, photoPath: "/assets/players/chandu-pinninti.jpg" },
  { name: "Kottana Sashi Kumar",        roleKey: "bowler",         dedicatedSlotNumber: 11, nominationOrder: 2, photoPath: "/assets/players/kottana-sashi-kumar.jpg" },
  { name: "SUNIL LAKKAKULA",            roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 3, photoPath: "/assets/players/sunil-lakkakula.jpg" },
  { name: "Naveen Koneti",              roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 4, photoPath: "/assets/players/naveen-koneti.jpg" },
  { name: "Majji Rambabu",              roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 2, photoPath: "/assets/players/majji-rambabu.jpg" },
  { name: "Palli sankar",               roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 4, photoPath: "/assets/players/palli-sankar.jpg" },
  { name: "Potnuru Raja",               roleKey: "all_rounder",   dedicatedSlotNumber: 12, nominationOrder: 3, photoPath: "/assets/players/potnuru-raja.jpg" },
  { name: "Punnam sri ram",             roleKey: "all_rounder",   dedicatedSlotNumber: 11, nominationOrder: 1, photoPath: "/assets/players/punnam-sri-ram.jpg" },
  { name: "Pavan Srinu",                roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 1, photoPath: "/assets/players/pavan-srinu.jpg" },
  { name: "Abhishek Duvvi",             roleKey: "batsman",        dedicatedSlotNumber: 6,  nominationOrder: 3, photoPath: "/assets/players/abhishek-duvvi.jpg" },
  { name: "Akash Kona",                 roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 3, photoPath: "/assets/players/akash-kona.jpg" },
  { name: "Aegi Niraj Kumar",           roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 2, photoPath: "/assets/players/aegi-niraj-kumar.jpg" },
  { name: "Santhosh Maddila",           roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 4, photoPath: "/assets/players/santhosh-maddila.jpg" },
  { name: "SANTOSH PILLA",              roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 2, photoPath: "/assets/players/santosh-pilla.jpg" },
  { name: "BNR",                        roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 3, photoPath: "/assets/players/bnr.jpg" },
  { name: "M Karthik",                  roleKey: "batsman",        dedicatedSlotNumber: 7,  nominationOrder: 2, photoPath: "/assets/players/m-karthik.jpg" },
  { name: "Vinod kumar",                roleKey: "batsman",        dedicatedSlotNumber: 7,  nominationOrder: 3, photoPath: "/assets/players/vinod-kumar.jpg" },
  { name: "Vinay k",                    roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 3, photoPath: "/assets/players/vinay-k.jpg" },
  { name: "Rds Charan",                 roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 2, photoPath: "/assets/players/rds-charan.jpg" },
  { name: "KORRAI MANIKANTA",           roleKey: "all_rounder",   dedicatedSlotNumber: 9,  nominationOrder: 2, photoPath: "/assets/players/korrai-manikanta.jpg" },
  { name: "Surisetty Raviteja",         roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 1, photoPath: "/assets/players/surisetty-raviteja.jpg" },
  { name: "PILLA ARUN KUMAR",           roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 1, photoPath: "/assets/players/pilla-arun-kumar.jpg" },
  { name: "GANGA YADAV",                roleKey: "all_rounder",   dedicatedSlotNumber: 7,  nominationOrder: 4, photoPath: "/assets/players/ganga-yadav.jpg" },
  { name: "Abhi Yadav",                 roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 1, photoPath: "/assets/players/abhi-yadav.jpg" },
  { name: "Rayavarapu Phanindra",       roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 4, photoPath: "/assets/players/rayavarapu-phanindra.jpg" },
  { name: "Allada Venkatesh",           roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 3, photoPath: "/assets/players/allada-venkatesh.jpg" },
  { name: "Dinesh",                     roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 2, photoPath: "/assets/players/default.svg" },
  { name: "Achari",                     roleKey: "bowler",         dedicatedSlotNumber: 11, nominationOrder: 4, photoPath: "/assets/players/default.svg" },
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
  nominationOrder: player.nominationOrder,
  photoPath: player.photoPath,
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

export { branding, createInitialState, ownerAssignments, players, slotTemplate, teams };
