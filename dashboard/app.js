const faunadb = require('faunadb')
const moment = require('moment')

q = faunadb.query;
DATABASE_URL = '54.245.218.63'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443', timeout: 500});

var hero_map = new Map([[1,"antimage"], [2,"axe"], [3,"bane"], [4,"bloodseeker"], [5,"crystal maiden"], [6,"drow ranger"], [7,"earthshaker"], [8,"juggernaut"], [9,"mirana"], [11,"nevermore"], [10,"morphling"], [12,"phantom lancer"], [13,"puck"], [14,"pudge"], [15,"razor"], [16,"sand king"], [17,"storm spirit"], [18,"sven"], [19,"tiny"], [20,"vengefulspirit"], [21,"windrunner"], [22,"zuus"], [23,"kunkka"], [25,"lina"], [31,"lich"], [26,"lion"], [27,"shadow shaman"], [28,"slardar"], [29,"tidehunter"], [30,"witch doctor"], [32,"riki"], [33,"enigma"], [34,"tinker"], [35,"sniper"], [36,"necrolyte"], [37,"warlock"], [38,"beastmaster"], [39,"queenofpain"], [40,"venomancer"], [41,"faceless void"], [42,"skeleton king"], [43,"death prophet"], [44,"phantom assassin"], [45,"pugna"], [46,"templar assassin"], [47,"viper"], [48,"luna"], [49,"dragon knight"], [50,"dazzle"], [51,"rattletrap"], [52,"leshrac"], [53,"furion"], [54,"life stealer"], [55,"dark seer"], [56,"clinkz"], [57,"omniknight"], [58,"enchantress"], [59,"huskar"], [60,"night stalker"], [61,"broodmother"], [62,"bounty hunter"], [63,"weaver"], [64,"jakiro"], [65,"batrider"], [66,"chen"], [67,"spectre"], [69,"doom bringer"], [68,"ancient apparition"], [70,"ursa"], [71,"spirit breaker"], [72,"gyrocopter"], [73,"alchemist"], [74,"invoker"], [75,"silencer"], [76,"obsidian destroyer"], [77,"lycan"], [78,"brewmaster"], [79,"shadow demon"], [80,"lone druid"], [81,"chaos knight"], [82,"meepo"], [83,"treant"], [84,"ogre magi"], [85,"undying"], [86,"rubick"], [87,"disruptor"], [88,"nyx assassin"], [89,"naga siren"], [90,"keeper of the light"], [91,"wisp"], [92,"visage"], [93,"slark"], [94,"medusa"], [95,"troll warlord"], [96,"centaur"], [97,"magnataur"], [98,"shredder"], [99,"bristleback"], [100,"tusk"], [101,"skywrath mage"], [102,"abaddon"], [103,"elder titan"], [104,"legion commander"], [106,"ember spirit"], [107,"earth spirit"], [109,"terrorblade"], [110,"phoenix"], [111,"oracle"], [105,"techies"], [112,"winter wyvern"], [113,"arc warden"], [108,"abyssal underlord"], [114,"monkey king"], [120,"pangolier"], [119,"dark willow"], [121,"grimstroke"], [129,"mars"]])
var item_map = new Map([[1,"blink"], [2,"blades of attack"], [3,"broadsword"], [4,"chainmail"], [5,"claymore"], [6,"helm of iron will"], [7,"javelin"], [8,"mithril hammer"], [9,"platemail"], [10,"quarterstaff"], [11,"quelling blade"], [237,"faerie fire"], [265,"infused raindrop"], [244,"wind lace"], [12,"ring of protection"], [182,"stout shield"], [246,"recipe moon shard"], [247,"moon shard"], [13,"gauntlets"], [14,"slippers"], [15,"mantle"], [16,"branches"], [17,"belt of strength"], [18,"boots of elves"], [19,"robe"], [20,"circlet"], [261,"crown"], [21,"ogre axe"], [22,"blade of alacrity"], [23,"staff of wizardry"], [24,"ultimate orb"], [25,"gloves"], [26,"lifesteal"], [27,"ring of regen"], [279,"ring of tarrasque"], [28,"sobi mask"], [29,"boots"], [30,"gem"], [31,"cloak"], [32,"talisman of evasion"], [33,"cheese"], [34,"magic stick"], [35,"recipe magic wand"], [36,"magic wand"], [37,"ghost"], [38,"clarity"], [216,"enchanted mango"], [39,"flask"], [40,"dust"], [41,"bottle"], [42,"ward observer"], [43,"ward sentry"], [217,"recipe ward dispenser"], [218,"ward dispenser"], [44,"tango"], [241,"tango single"], [45,"courier"], [46,"tpscroll"], [47,"recipe travel boots"], [219,"recipe travel boots 2"], [48,"travel boots"], [220,"travel boots 2"], [49,"recipe phase boots"], [50,"phase boots"], [51,"demon edge"], [52,"eagle"], [53,"reaver"], [54,"relic"], [55,"hyperstone"], [56,"ring of health"], [57,"void stone"], [58,"mystic staff"], [59,"energy booster"], [60,"point booster"], [61,"vitality booster"], [62,"recipe power treads"], [63,"power treads"], [64,"recipe hand of midas"], [65,"hand of midas"], [66,"recipe oblivion staff"], [67,"oblivion staff"], [68,"recipe pers"], [69,"pers"], [70,"recipe poor mans shield"], [71,"poor mans shield"], [72,"recipe bracer"], [73,"bracer"], [74,"recipe wraith band"], [75,"wraith band"], [76,"recipe null talisman"], [77,"null talisman"], [78,"recipe mekansm"], [79,"mekansm"], [80,"recipe vladmir"], [81,"vladmir"], [85,"recipe buckler"], [86,"buckler"], [87,"recipe ring of basilius"], [88,"ring of basilius"], [268,"recipe holy locket"], [269,"holy locket"], [89,"recipe pipe"], [90,"pipe"], [91,"recipe urn of shadows"], [92,"urn of shadows"], [93,"recipe headdress"], [94,"headdress"], [95,"recipe sheepstick"], [96,"sheepstick"], [97,"recipe orchid"], [98,"orchid"], [245,"recipe bloodthorn"], [250,"bloodthorn"], [251,"recipe echo sabre"], [252,"echo sabre"], [99,"recipe cyclone"], [100,"cyclone"], [233,"recipe aether lens"], [232,"aether lens"], [101,"recipe force staff"], [102,"force staff"], [262,"recipe hurricane pike"], [263,"hurricane pike"], [103,"recipe dagon"], [197,"recipe dagon 2"], [198,"recipe dagon 3"], [199,"recipe dagon 4"], [200,"recipe dagon 5"], [104,"dagon"], [201,"dagon 2"], [202,"dagon 3"], [203,"dagon 4"], [204,"dagon 5"], [105,"recipe necronomicon"], [191,"recipe necronomicon 2"], [192,"recipe necronomicon 3"], [106,"necronomicon"], [193,"necronomicon 2"], [194,"necronomicon 3"], [107,"recipe ultimate scepter"], [108,"ultimate scepter"], [270,"recipe ultimate scepter 2"], [271,"ultimate scepter 2"], [109,"recipe refresher"], [110,"refresher"], [111,"recipe assault"], [112,"assault"], [113,"recipe heart"], [114,"heart"], [115,"recipe black king bar"], [116,"black king bar"], [117,"aegis"], [118,"recipe shivas guard"], [119,"shivas guard"], [120,"recipe bloodstone"], [121,"bloodstone"], [122,"recipe sphere"], [123,"sphere"], [221,"recipe lotus orb"], [226,"lotus orb"], [222,"recipe meteor hammer"], [223,"meteor hammer"], [224,"recipe nullifier"], [225,"nullifier"], [255,"recipe aeon disk"], [256,"aeon disk"], [258,"recipe kaya"], [259,"kaya"], [275,"trident"], [276,"combo breaker"], [260,"refresher shard"], [266,"recipe spirit vessel"], [267,"spirit vessel"], [124,"recipe vanguard"], [125,"vanguard"], [243,"recipe crimson guard"], [242,"crimson guard"], [126,"recipe blade mail"], [127,"blade mail"], [128,"recipe soul booster"], [129,"soul booster"], [130,"recipe hood of defiance"], [131,"hood of defiance"], [132,"recipe rapier"], [133,"rapier"], [134,"recipe monkey king bar"], [135,"monkey king bar"], [136,"recipe radiance"], [137,"radiance"], [138,"recipe butterfly"], [139,"butterfly"], [140,"recipe greater crit"], [141,"greater crit"], [142,"recipe basher"], [143,"basher"], [144,"recipe bfury"], [145,"bfury"], [146,"recipe manta"], [147,"manta"], [148,"recipe lesser crit"], [149,"lesser crit"], [234,"recipe dragon lance"], [236,"dragon lance"], [150,"recipe armlet"], [151,"armlet"], [183,"recipe invis sword"], [152,"invis sword"], [248,"recipe silver edge"], [249,"silver edge"], [153,"recipe sange and yasha"], [154,"sange and yasha"], [272,"recipe kaya and sange"], [273,"kaya and sange"], [274,"recipe yasha and kaya"], [277,"yasha and kaya"], [155,"recipe satanic"], [156,"satanic"], [157,"recipe mjollnir"], [158,"mjollnir"], [159,"recipe skadi"], [160,"skadi"], [161,"recipe sange"], [162,"sange"], [163,"recipe helm of the dominator"], [164,"helm of the dominator"], [165,"recipe maelstrom"], [166,"maelstrom"], [167,"recipe desolator"], [168,"desolator"], [169,"recipe yasha"], [170,"yasha"], [171,"recipe mask of madness"], [172,"mask of madness"], [173,"recipe diffusal blade"], [174,"diffusal blade"], [175,"recipe ethereal blade"], [176,"ethereal blade"], [177,"recipe soul ring"], [178,"soul ring"], [179,"recipe arcane boots"], [180,"arcane boots"], [228,"recipe octarine core"], [235,"octarine core"], [181,"orb of venom"], [240,"blight stone"], [184,"recipe ancient janggo"], [185,"ancient janggo"], [186,"recipe medallion of courage"], [187,"medallion of courage"], [227,"recipe solar crest"], [229,"solar crest"], [188,"smoke of deceit"], [257,"tome of knowledge"], [189,"recipe veil of discord"], [190,"veil of discord"], [230,"recipe guardian greaves"], [231,"guardian greaves"], [205,"recipe rod of atos"], [206,"rod of atos"], [238,"recipe iron talon"], [239,"iron talon"], [207,"recipe abyssal blade"], [208,"abyssal blade"], [209,"recipe heavens halberd"], [210,"heavens halberd"], [211,"recipe ring of aquila"], [212,"ring of aquila"], [213,"recipe tranquil boots"], [214,"tranquil boots"], [215,"shadow amulet"], [253,"recipe glimmer cape"], [254,"glimmer cape"], [1021,"river painter"], [1022,"river painter2"], [1023,"river painter3"], [1024,"river painter4"], [1025,"river painter5"], [1026,"river painter6"], [1027,"river painter7"], [1028,"mutation tombstone"], [1029,"super blink"], [1030,"pocket tower"], [1032,"pocket roshan"]])

// Introduction to FQL - Get Match Data
var startTime = Date.now()
client.query(
    q.Get(
        q.Ref(
            q.Collection('matches'), 
            '4931268777'
        )
    )
).then(
    (ret) => console.log('Match Data: ', ret['data']),
    (err) => console.log(err)
)

// Introduction to FQL - Get Match Data
var startTime = Date.now()
client.query(
    q.Get(
        q.Ref(
            q.Collection('matches'), 
            '4931268777'
        )
    )
).then(
    (ret) => console.log('Match Data: ', ret['data']),
    (err) => console.log(err)
)

// Easy Business Question 1 - Max match duraion
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            1911
        )
    )
).then(
    (ret) => console.log('Max game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 2 - Mean match duration
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            2002
        )
    )
).then(
    (ret) => console.log('Mean game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 3 - Mean First Blood time
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            2114
        )
    )
).then(
    (ret) => console.log('Mean FB Time: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 4 - Has a match been abandoned
var match_id_to_check = 4929685690
client.query(
    q.Get(
        q.Ref(
            q.Collection('matches'),
            match_id_to_check
        )
    )
).then(
    (ret) => console.log('Is match abandoned: ' + ret.data.abandoned_status),
    (err) => console.log(err)
)

// Easy Business Question 5 - Number of matches played with a time frame - Last 4 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(4, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');

client.query(
    q.Count(
        q.Range(
            q.Match(
                q.Index("match_by_ts")
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of matches in the last 4 months: ' + ret),
    (err) => console.log(err)
)

// Extra Easy Business Question - Min match duraion
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            1909
        )
    )
).then(
    (ret) => console.log('Min game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Medium Business Question 1 - Number of games played of a hero over a given time - Last 5 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');
var hero_id_to_check = 47
client.query(
    q.Count(
        q.Range(
            q.Union(
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    hero_id_to_check,
                    true
                ),
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    hero_id_to_check,
                    false
                )
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of games played: ', ret),
    (err) => console.log(err)
)

// Medium Business Question 2 - Win rate of a hero over a given time - Last 5 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');
var hero_id_to_check = 47
client.query(
    q.Count(
        q.Range(
            q.Match(
                q.Index("heroes_temporal_winrate"),
                hero_id_to_check,
                true
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => {
        num_of_wins = ret

        client.query(
            q.Count(
                q.Range(
                    q.Union(
                        q.Match(
                            q.Index("heroes_temporal_winrate"),
                            hero_id_to_check,
                            true
                        ),
                        q.Match(
                            q.Index("heroes_temporal_winrate"),
                            hero_id_to_check,
                            false
                        )
                    ), 
                    q.Time(beforeFourMonths), 
                    q.Time(today)
                )
            )
        ).then(
            (ret) => console.log('Win Rate: ', ((num_of_wins/ret).toFixed(4) * 100) ),
            (err) => console.log(err)
        )
    },
    (err) => console.log(err)
)

// Medium Business Questin 3 - Overall win-rate of a hero
var hero_id_to_check = 47
client.query(
    q.Get(
        q.Ref(
            q.Collection('heroes'),
            hero_id_to_check
        )
    )
).then(
    (ret) => console.log('Overall win-rate of a hero: ', ((ret.data.wins / ret.data.games).toFixed(4) * 100) ),
    (err) => console.log(err)
)

// Medium Business Question 4 - Preferred Items for a Hero
var hero_id_to_check = 47
var top_how_many = 2

client.query(
    q.Get(
        q.Ref(
            q.Collection('heroes'),
            hero_id_to_check
        )
    )
).then(
    (ret) => {
        item_data = ret['data']['items']
        item_list = []

        for (var i = 1; i<item_data.length; i++) {
            item_dict = {}

            item_dict.item_id = i
            item_dict.item_count = item_data[i]

            item_list.push(item_dict)
        }

        item_list.sort(function(x, y) {
            if (x.item_count > y.item_count) {
                return -1;
            }
            if (x.item_count < y.item_count) {
                return 1;
        }
            return 0;
        })

        console.log('Top Item Preferrences: ', item_list.slice(0, top_how_many))
    },
    (err) => console.log(err)
)

// Best Hero Pairs
var hero_id_to_check = 47
var top_how_many = 2
key_list = []
id_list = []

for (var i = 1; i<hero_id_to_check; i++) {
    key = ('000' + i).substr(-3) + ('000' + hero_id_to_check).substr(-3)
    key_list.push(key)
    id_list.push(i)
}

for (var k = hero_id_to_check + 1; k < 130; k++) {
    key = ('000' + hero_id_to_check).substr(-3) + ('000' + k).substr(-3)
    key_list.push(key)
    id_list.push(k)
}

client.query(
    q.Map(
        key_list,
        q.Lambda(
            'hero_pair',
            q.Get(
                q.Ref(
                    q.Collection('hero_pairs'), 
                    q.Var('hero_pair')
                )
            )
        )
    )
).then(
    (res) => {
        hero_data_list = res
        hero_team_list = []

        for (var i = 0; i < hero_data_list.length; i++) {
            hero_team_dictionary = {} 
            hero_team_dictionary.partner_id = id_list[i]

            if (hero_data_list[i]['data']['games'] > 0) {
                hero_team_dictionary['win_rate'] = (hero_data_list[i]['data']['wins'] / hero_data_list[i]['data']['games']).toFixed(4)
            } else {
                hero_team_dictionary['win_rate'] = '0.0000'
            }
            hero_team_list.push(hero_team_dictionary)
        }

        hero_team_list.sort(function(x, y) {
            if (x.win_rate > y.win_rate) {
                return -1;
            }
            if (x.win_rate < y.win_rate) {
                return 1;
            }
            return 0;
        })
        console.log(hero_team_list.splice(0, top_how_many))
    },
    (err) => console.log(err)
)


// Count of records
var startTime = Date.now()
client.query(
    q.Count(
        q.Match(
            q.Index('all_matches_raw')
        )
    )
).then(
    (ret) => console.log('Number of matches in DB: ' + ret + ' and time to fetch: ' + (Date.now() - startTime) + 'ms at ' + new Date().toISOString()),
    (err) => console.log(err)
)