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
  { name: "Dr.Anand Yadav",            roleKey: "all_rounder",   dedicatedSlotNumber: 11, nominationOrder: 3, photoPath: "/assets/players/dr-anand-yadav.jpg",           cricHeroesUrl: "https://cricheroes.com/player-profile/7036913/Dr.Anand-Yadav" },
  { name: "PD",                         roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 2, photoPath: "/assets/players/pd.jpg",                          cricHeroesUrl: "https://cricheroes.com/player-profile/23110707/PD" },
  { name: "Kiran",                      roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 4, photoPath: "/assets/players/kiran.jpg",                       cricHeroesUrl: "https://cricheroes.com/player-profile/9346463/Kiran-Majji" },
  { name: "Parasuram",                  roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 1, photoPath: "/assets/players/parasuram.jpg",                   cricHeroesUrl: "https://cricheroes.com/player-profile/18098347/Parasuram" },
  { name: "Santosh Yadhav",             roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 3, photoPath: "/assets/players/default.svg",                     cricHeroesUrl: "https://cricheroes.com/player-profile/33674407/Santosh-Yadav" },
  { name: "GOWTHAM GV",                 roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 4, photoPath: "/assets/players/gowtham-gv.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/28190772/Gowtham-GV" },
  { name: "Raghu Ashrith S",            roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 1, photoPath: "/assets/players/raghu-ashrith-s.jpg",             cricHeroesUrl: "https://cricheroes.com/player-profile/7393664/Raghu-Ashrith" },
  { name: "VAKA SANTOSH KUMAR",         roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 1, photoPath: "/assets/players/vaka-santosh-kumar.jpg",          cricHeroesUrl: "https://cricheroes.com/player-profile/6816239/Vaka-Santhosh-OG" },
  { name: "Hari Ram Prasad",            roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 4, photoPath: "/assets/players/hari-ram-prasad.jpg",             cricHeroesUrl: "https://cricheroes.com/player-profile/4247159/Hari-Ram-Prasad" },
  { name: "KUNA RAHUL KAMESWARA RAO",   roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 3, photoPath: "/assets/players/kuna-rahul-kameswara-rao.jpg",   cricHeroesUrl: "https://cricheroes.com/player-profile/43792316/Rahul" },
  { name: "Prudhvi Kunchangi",          roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 1, photoPath: "/assets/players/prudhvi-kunchangi.jpg",           cricHeroesUrl: "https://cricheroes.com/player-profile/7818132/Prudhvi-Kunchangi" },
  { name: "Gangadhar rao",              roleKey: "batsman",        dedicatedSlotNumber: 6,  nominationOrder: 1, photoPath: "/assets/players/gangadhar-rao.jpg",               cricHeroesUrl: "https://cricheroes.com/player-profile/8560258/V.Gangadhar-rao-Yadav" },
  { name: "Rahul Krishna Madasu",       roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 4, photoPath: "/assets/players/rahul-krishna-madasu.jpg",        cricHeroesUrl: "https://cricheroes.com/player-profile/13081635/Rahul-K-Madasu" },
  { name: "satish kumar bejawada",      roleKey: "all_rounder",   dedicatedSlotNumber: 6,  nominationOrder: 4, photoPath: "/assets/players/satish-kumar-bejawada.jpg",       cricHeroesUrl: "https://cricheroes.com/player-profile/16545825/Satish" },
  { name: "Akaramani Makaraju Yadav",   roleKey: "all_rounder",   dedicatedSlotNumber: 6,  nominationOrder: 2, photoPath: "/assets/players/akaramani-makaraju-yadav.jpg",    cricHeroesUrl: "https://cricheroes.com/player-profile/37732946/MAKARAJU-Akramani" },
  { name: "PRANAY",                     roleKey: "batsman",        dedicatedSlotNumber: 2,  nominationOrder: 2, photoPath: "/assets/players/pranay.jpg",                      cricHeroesUrl: "https://cricheroes.com/player-profile/27030456/Pranay" },
  { name: "OMMI SRINU",                 roleKey: "all_rounder",   dedicatedSlotNumber: 7,  nominationOrder: 1, photoPath: "/assets/players/ommi-srinu.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/15776871/OMMI-SRINU" },
  { name: "Poliraju",                   roleKey: "batsman",        dedicatedSlotNumber: 8,  nominationOrder: 4, photoPath: "/assets/players/poliraju.jpg",                    cricHeroesUrl: "https://cricheroes.com/player-profile/18853028/Poli-Raju" },
  { name: "Jaya Kumar",                 roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 2, photoPath: "/assets/players/jaya-kumar.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/7846733/Jaya-Kumar" },
  { name: "Pindra Prasanth Sai",        roleKey: "keeper_batsman", dedicatedSlotNumber: 2,  nominationOrder: 3, photoPath: "/assets/players/pindra-prasanth-sai.jpg",         cricHeroesUrl: "https://cricheroes.com/player-profile/18120343/Prasanth-Sai" },
  { name: "Chandu pinninti",            roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 1, photoPath: "/assets/players/chandu-pinninti.jpg",             cricHeroesUrl: "https://cricheroes.com/player-profile/8838726/Chandu-Pinninti" },
  { name: "Kottana Sashi Kumar",        roleKey: "bowler",         dedicatedSlotNumber: 11, nominationOrder: 2, photoPath: "/assets/players/kottana-sashi-kumar.jpg",         cricHeroesUrl: "https://cricheroes.com/player-profile/24775335/Sashi-Kumar" },
  { name: "SUNIL LAKKAKULA",            roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 3, photoPath: "/assets/players/sunil-lakkakula.jpg",             cricHeroesUrl: "https://cricheroes.com/player-profile/8582445/Sunil-Lakkakula" },
  { name: "Naveen Koneti",              roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 4, photoPath: "/assets/players/naveen-koneti.jpg",               cricHeroesUrl: "https://cricheroes.com/player-profile/22972017/Naveen-Koneti" },
  { name: "Majji Rambabu",              roleKey: "all_rounder",   dedicatedSlotNumber: 8,  nominationOrder: 2, photoPath: "/assets/players/majji-rambabu.jpg",               cricHeroesUrl: "https://cricheroes.com/player-profile/8838731/Rambabu-Majji" },
  { name: "Palli sankar",               roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 4, photoPath: "/assets/players/palli-sankar.jpg",                cricHeroesUrl: "https://cricheroes.com/player-profile/44100424/PALLI-SANKAR" },
  { name: "Potnuru Raja",               roleKey: "all_rounder",   dedicatedSlotNumber: 12, nominationOrder: 3, photoPath: "/assets/players/potnuru-raja.jpg",                cricHeroesUrl: "https://cricheroes.com/player-profile/7094218/Raja" },
  { name: "Punnam sri ram",             roleKey: "all_rounder",   dedicatedSlotNumber: 11, nominationOrder: 1, photoPath: "/assets/players/punnam-sri-ram.jpg",              cricHeroesUrl: "https://cricheroes.com/player-profile/11734980/SriRam-Punnam" },
  { name: "Pavan Srinu",                roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 1, photoPath: "/assets/players/pavan-srinu.jpg",                 cricHeroesUrl: "https://cricheroes.com/player-profile/3093972/Pavan-Srinu" },
  { name: "Abhishek Duvvi",             roleKey: "batsman",        dedicatedSlotNumber: 6,  nominationOrder: 3, photoPath: "/assets/players/abhishek-duvvi.jpg",              cricHeroesUrl: "https://cricheroes.com/player-profile/8839029/Abhishek.D" },
  { name: "Akash Kona",                 roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 3, photoPath: "/assets/players/akash-kona.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/8753300/Akash-Kona" },
  { name: "Aegi Niraj Kumar",           roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 2, photoPath: "/assets/players/aegi-niraj-kumar.jpg",            cricHeroesUrl: "https://cricheroes.com/player-profile/31036980/A-Niraj-Kumar" },
  { name: "Santhosh Maddila",           roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 4, photoPath: "/assets/players/santhosh-maddila.jpg",            cricHeroesUrl: "https://cricheroes.com/player-profile/19744255/Santhosh-Maddila" },
  { name: "SANTOSH PILLA",              roleKey: "bowler",         dedicatedSlotNumber: 10, nominationOrder: 2, photoPath: "/assets/players/santosh-pilla.jpg",               cricHeroesUrl: "https://cricheroes.com/player-profile/22817368/Santosh-Pilla" },
  { name: "BNR",                        roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 3, photoPath: "/assets/players/bnr.jpg",                         cricHeroesUrl: "https://cricheroes.com/player-profile/36597678/NB-78" },
  { name: "M Karthik",                  roleKey: "batsman",        dedicatedSlotNumber: 7,  nominationOrder: 2, photoPath: "/assets/players/m-karthik.jpg",                   cricHeroesUrl: "https://cricheroes.com/player-profile/33800706/Karthik" },
  { name: "Vinod kumar",                roleKey: "batsman",        dedicatedSlotNumber: 7,  nominationOrder: 3, photoPath: "/assets/players/vinod-kumar.jpg",                 cricHeroesUrl: "https://cricheroes.com/player-profile/7002546/Vinod" },
  { name: "Vinay k",                    roleKey: "batsman",        dedicatedSlotNumber: 5,  nominationOrder: 3, photoPath: "/assets/players/vinay-k.jpg",                     cricHeroesUrl: "https://cricheroes.com/player-profile/36376711/Vinay-Kapu" },
  { name: "Rds Charan",                 roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 2, photoPath: "/assets/players/rds-charan.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/3302336/Rds-Charan-Sharma" },
  { name: "KORRAI MANIKANTA",           roleKey: "all_rounder",   dedicatedSlotNumber: 9,  nominationOrder: 2, photoPath: "/assets/players/korrai-manikanta.jpg",            cricHeroesUrl: "https://cricheroes.com/player-profile/11057008/Manikanta" },
  { name: "Surisetty Raviteja",         roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 1, photoPath: "/assets/players/surisetty-raviteja.jpg",          cricHeroesUrl: null },
  { name: "PILLA ARUN KUMAR",           roleKey: "bowler",         dedicatedSlotNumber: 9,  nominationOrder: 1, photoPath: "/assets/players/pilla-arun-kumar.jpg",            cricHeroesUrl: "https://cricheroes.com/player-profile/7496853/Arun" },
  { name: "GANGA YADAV",                roleKey: "all_rounder",   dedicatedSlotNumber: 7,  nominationOrder: 4, photoPath: "/assets/players/ganga-yadav.jpg",                 cricHeroesUrl: "https://cricheroes.com/player-profile/12332858/Ganga-Yadav" },
  { name: "Abhi Yadav",                 roleKey: "keeper_batsman", dedicatedSlotNumber: 4,  nominationOrder: 1, photoPath: "/assets/players/abhi-yadav.jpg",                  cricHeroesUrl: "https://cricheroes.com/player-profile/6862442/ABHI-YADAV" },
  { name: "Rayavarapu Phanindra",       roleKey: "bowler",         dedicatedSlotNumber: 12, nominationOrder: 4, photoPath: "/assets/players/rayavarapu-phanindra.jpg",        cricHeroesUrl: null },
  { name: "Allada Venkatesh",           roleKey: "batsman",        dedicatedSlotNumber: 3,  nominationOrder: 3, photoPath: "/assets/players/allada-venkatesh.jpg",            cricHeroesUrl: "https://cricheroes.com/player-profile/16307685/Venkatesh-Allada" },
  { name: "Dinesh",                     roleKey: "batsman",        dedicatedSlotNumber: 1,  nominationOrder: 2, photoPath: "/assets/players/default.svg",                     cricHeroesUrl: "https://cricheroes.com/player-profile/2165956/Dinesh-Dinu" },
  { name: "Achari",                     roleKey: "bowler",         dedicatedSlotNumber: 11, nominationOrder: 4, photoPath: "/assets/players/default.svg",                     cricHeroesUrl: "https://cricheroes.com/player-profile/11270330/Achari-Sp" },
];

const players = draftPlayers.map((player, index) => ({
  id: `player-${String(index + 1).padStart(2, "0")}`,
  name: player.name,
  roleKey: player.roleKey,
  roleLabel: roleConfig[player.roleKey].roleLabel,
  eligibleSlotNumbers: [player.dedicatedSlotNumber],
  eligibilityLabel: `Position ${player.dedicatedSlotNumber}`,
  basePrice: 2000,
  status: "Pending",
  soldToTeamId: null,
  soldAmount: null,
  assignedSlotNumber: null,
  dedicatedSlotNumber: player.dedicatedSlotNumber,
  nominationOrder: player.nominationOrder,
  photoPath: player.photoPath,
  cricHeroesUrl: player.cricHeroesUrl || null,
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
