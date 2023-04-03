let countries = {
    "AW":"Aruba","AG":"Antigua and Barbuda","AF":"Afghanistan","DZ":"Algeria","AZ":"Azerbaijan","AL":"Albania","AM":"Armenia","AD":"Andorra","AO":"Angola","AS":"American Samoa","AR":"Argentina","AU":"Australia","AT":"Austria","AI":"Anguilla","AQ":"Antarctica","BH":"Bahrain","BB":"Barbados","BW":"Botswana","BM":"Bermuda","BE":"Belgium","BS":"Bahamas, The","BD":"Bangladesh","BZ":"Belize","BA":"Bosnia and Herzegovina","BO":"Bolivia","MM":"Myanmar (Burma)","BJ":"Benin","BY":"Belarus","SB":"Solomon Islands","BR":"Brazil","BT":"Bhutan","BG":"Bulgaria","BV":"Bouvet Island","BN":"Brunei","BI":"Burundi","CA":"Canada","KH":"Cambodia","TD":"Chad","LK":"Sri Lanka","CG":"Congo","CD":"Zaire","CN":"China","CL":"Chile","KY":"Cayman Islands","CC":"Cocos (Keeling) Islands","CM":"Cameroon","KM":"Comoros","CO":"Colombia","MP":"Northern Mariana Islands","CR":"Costa Rica","CF":"Central African Republic","CU":"Cuba","CV":"Cape Verde","CK":"Cook Islands","CY":"Cyprus","DK":"Denmark","DJ":"Djibouti","DM":"Dominica","NA":"Wake Island","DO":"Dominican Republic","EC":"Ecuador","EG":"Egypt","IE":"Ireland","GQ":"Equatorial Guinea","EE":"Estonia","ER":"Eritrea","SV":"El Salvador","ET":"Ethiopia","CZ":"Czech Republic","GF":"French Guiana","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands (Islas Malvinas)","FM":"Federated States of Micronesia","FO":"Faroe Islands","PF":"French Polynesia","FR":"France","TF":"French Southern & Antarctic Lands","GM":"Gambia, The","GA":"Gabon","GE":"Georgia","GH":"Ghana","GI":"Gibraltar","GD":"Grenada","GG":"Guernsey","GL":"Greenland","DE":"Germany","GP":"Guadeloupe","GU":"Guam","GR":"Greece","GT":"Guatemala","GN":"Guinea","GY":"Guyana","PS":"West Bank","HT":"Haiti","HM":"Heard Island & McDonald Islands","HN":"Honduras","HR":"Croatia","HU":"Hungary","IS":"Iceland","ID":"Indonesia","IM":"Man, Isle of","IN":"India","IO":"British Indian Ocean Territory","IR":"Iran","IL":"Israel","IT":"Italy","CI":"Ivory Coast","IQ":"Iraq","JP":"Japan","JE":"Jersey","JM":"Jamaica","JO":"Jordan","KE":"Kenya","KG":"Kyrgyzstan","KP":"North Korea","KI":"Kiribati","KR":"South Korea","CX":"Christmas Island","KW":"Kuwait","KZ":"Kazakhstan","LA":"Laos","LB":"Lebanon","LV":"Latvia","LT":"Lithuania","LR":"Liberia","SK":"Slovakia","LI":"Liechtenstein","LS":"Lesotho","LU":"Luxembourg","LY":"Libya","MG":"Madagascar","MQ":"Martinique","MO":"Macau","MD":"Moldova","YT":"Mayotte","MN":"Mongolia","MS":"Montserrat","MW":"Malawi","MK":"Macedonia","ML":"Mali","MC":"Monaco","MA":"Morocco","MU":"Mauritius","MR":"Mauritania","MT":"Malta","OM":"Oman","MV":"Maldives","ME":"Montenegro","MX":"Mexico","MY":"Malaysia","MZ":"Mozambique","NC":"New Caledonia","NU":"Niue","NF":"Norfolk Island","NE":"Niger","VU":"Vanuatu","NG":"Nigeria","NL":"Netherlands","NO":"Norway","NP":"Nepal","NR":"Nauru","SR":"Suriname","NI":"Nicaragua","NZ":"New Zealand","PY":"Paraguay","PN":"Pitcairn Islands","PE":"Peru","PK":"Pakistan","PL":"Poland","PA":"Panama","PT":"Portugal","PG":"Papua New Guinea","PW":"Pacific Islands (Palau)","GW":"Guinea-Bissau","QA":"Qatar","RE":"Reunion","MH":"Marshall Islands","RO":"Romania","PH":"Philippines","PR":"Puerto Rico","RU":"Russia","RW":"Rwanda","SA":"Saudi Arabia","PM":"St. Pierre and Miquelon","KN":"St. Kitts and Nevis","SC":"Seychelles","ZA":"South Africa","SN":"Senegal","SH":"St. Helena","SI":"Slovenia","SL":"Sierra Leone","SM":"San Marino","SG":"Singapore","SO":"Somalia","ES":"Spain","RS":"Serbia","LC":"St. Lucia","SD":"Sudan","SJ":"Svalbard","SE":"Sweden","GS":"South Georgia and the South Sandwich Is","SY":"Syria","CH":"Switzerland","AE":"United Arab Emirates","TT":"Trinidad and Tobago","TH":"Thailand","TJ":"Tajikistan","TC":"Turks and Caicos Islands","TK":"Tokelau","TO":"Tonga","TG":"Togo","ST":"Sao Tome and Principe","TN":"Tunisia","TR":"Turkey","TV":"Tuvalu","TW":"Taiwan","TM":"Turkmenistan","TZ":"Tanzania, United Republic of","UG":"Uganda","UK":"United Kingdom","UA":"Ukraine","US":"United States","BF":"Burkina Faso","UY":"Uruguay","UZ":"Uzbekistan","VC":"St. Vincent and the Grenadines","VE":"Venezuela","VG":"British Virgin Islands","VN":"Vietnam","WF":"Wallis and Futuna","EH":"Western Sahara","WS":"Western Samoa","SZ":"Swaziland","YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe"
};

let countriesSorted = Object.keys(countries).sort(
    function(a, b) {
        if (countries[a] > countries[b])
            return 1;
        else
            return -1;
    }
);

let layersList = {};

countriesSorted.forEach((iso2) => {
    layersList[`countries!${iso2}`] = {
        name: countries[iso2],
        url: `countries/res_03/${iso2}.geojson`
    };
});

export default {
    style: {
        color: "#d3d3d3",
        stroke: true,
        interactive: false,
        fillOpacity: 0.1,
        fillColor: "#4e4eff"
    },
    list: layersList
};
