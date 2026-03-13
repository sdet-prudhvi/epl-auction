#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/players"
mkdir -p "$DIR"
cd "$DIR"

download() {
  local slug="$1"
  local id="$2"
  curl -sL "https://drive.usercontent.google.com/download?id=${id}&export=download" -o "${slug}.jpg"
  local size
  size=$(wc -c < "${slug}.jpg")
  if [ "$size" -gt 1000 ]; then
    echo "OK  ${slug}.jpg  (${size} bytes)"
  else
    echo "FAIL  ${slug}.jpg  (${size} bytes - likely auth error)"
    rm -f "${slug}.jpg"
  fi
}

download "dr-anand-yadav"           "1LHU5hBEF8QT_6REGE7HDT700tDNaQmWk"
download "pd"                        "1jwx-mIk1-2D44apCfAs_X67xMzt8jIVP"
download "kiran"                     "1W1ZQ2SypWHvOmKiev4Vjsmwm11U8NG2l"
download "parasuram"                 "15UJejNuO9WYvvfa3syfwHkqlXWN_quMa"
download "gowtham-gv"               "1-ascFEECSmtwEdTttimmoKJccWmU93vQ"
download "raghu-ashrith-s"          "1S8tmpZUbmnfQTxeNKXPQ5udRKrE8jhbc"
download "vaka-santosh-kumar"       "1lmaA1xTDfrDBCyyA4jeWYVrK4Y7jzjae"
download "hari-ram-prasad"          "10IEqcHhR0BgzrhRZkskwyKJGQtFbUU5R"
download "kuna-rahul-kameswara-rao" "1BbEiAgokjLq3uoMOsm_2jLmBoD73krBv"
download "prudhvi-kunchangi"        "1OfmtX8UUUkBigTBzcvIuhIIZ3B5saKNS"
download "gangadhar-rao"            "1FRReixhjjvGZWwLYiN3evEp5I9ZimRBO"
download "rahul-krishna-madasu"     "1CYMzlWElUfqAbOVNWS8JpIToyLcGsPtG"
download "satish-kumar-bejawada"    "1GWXLL76axSsFLji2RieSD5wgVYDBtALP"
download "akaramani-makaraju-yadav" "1CJ39ybTkOrxoEME-rlR69feDw1ARvASJ"
download "pranay"                   "1TWF87M751Ykk_E7axbDfU-6x6FgCj5r8"
download "ommi-srinu"               "1t_CKeUUiOO_59kEhsAG0saOcYXEtiUHG"
download "poliraju"                 "1DlgIBnD9P2lXRMe8fFQ995M6lu8aQO4U"
download "jaya-kumar"               "1vlGdLZ4Be7mtewzEJ8jpvcWnCIodfkdd"
download "pindra-prasanth-sai"      "1D6JuyjT2xKic8qqNJ21resjAryfLF1-M"
download "chandu-pinninti"          "1rWfmdZMMr1muU7fGT4lV8-oiOZiUAEJb"
download "kottana-sashi-kumar"      "1z5SvPDsLF6DAgkS8uo_ND3XVBv1UUe4-"
download "sunil-lakkakula"          "1DtB5eXplHrm9FScvZJyD5sIkMvc337UI"
download "naveen-koneti"            "11aQBOXSRD-bfsbCDdw-B6ekJajlkHBkw"
download "majji-rambabu"            "1IuZwr-jCXvSzqIgnI0ChfMQn0Rz9_O2o"
download "palli-sankar"             "1qxINjzh8fbdmpktVUpzxERYMKaqcnjGv"
download "potnuru-raja"             "1YyJaI15Ce_QpzBtv39J_XV6l92VymBmW"
download "punnam-sri-ram"           "1I3LsgzOsMpktuOcXDanz96IIXxunXoGP"
download "pavan-srinu"              "14SJwnTIbVSogixQdLtrveIxjJ8NfqQqw"
download "abhishek-duvvi"           "1cgA4847J1KWXimZMAiuY7EbtRNT3Mt42"
download "akash-kona"               "1LiH0glQsKJtqiuLKW6zHNNE1IC7GEjZX"
download "aegi-niraj-kumar"         "1rb8Q2_cyjPEgb9xAbmtil2k1KgLWcI_p"
download "santhosh-maddila"         "1SWBwUCb-H9TlHun_C6dk_ux_jb7-feGr"
download "santosh-pilla"            "1IY_tUt13nknaz8bFEWD2F2nC-DIY2Zqa"
download "bnr"                      "1jEGSs6wwlpNE8bN9N0exX0o1ibTg4w5r"
download "m-karthik"                "1PMJyElGKSyVbmaUIeQFQqNey88p5SoR8"
download "vinod-kumar"              "1OfSljXSU6ofsJYob1UtPx3k5oyQwSYNZ"
download "vinay-k"                  "1QkWSyh6Jh7J7iV9Ff9199L5SIh7Hcybk"
download "rds-charan"               "1fMXOwAXEYe1OIMX8kFslqyU4cv0onHvl"
download "korrai-manikanta"         "1OrxwCIDmGCdsey6pYGf6f9UNsqhjqd53"
download "surisetty-raviteja"       "1T39XoHKqFBUGMnJzhWdG1wmaYPGc6Vxk"
download "pilla-arun-kumar"         "1HN1_pogCPQtrx-Qi1Xon_YEBfpsbtQ4C"
download "ganga-yadav"              "1O8enQqc7miflcPt5B2-8HhJjHBMEiwNL"
download "abhi-yadav"               "1UA4BZ-EU4-6pPgGt64--HZ-X-5xzkyqX"
download "rayavarapu-phanindra"     "1wCKgdE5EjBLIXKQG-J7YGytotJo9Qm93"
download "allada-venkatesh"         "1hH_izqp0U6lPSh436gaID2QA-ITV6rMQ"

echo ""
echo "Downloaded $(ls *.jpg 2>/dev/null | wc -l | tr -d ' ') photos to $DIR"
