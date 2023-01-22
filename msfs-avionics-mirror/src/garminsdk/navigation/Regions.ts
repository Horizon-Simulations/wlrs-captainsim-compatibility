/**
 * Utility class for working with ICAO region codes in a Garmin context.
 */
export class Regions {
  private static readonly NAME_TABLE: Record<string, string> = {
    'AG': 'SOLOMON IS',
    'AN': 'NAURU',
    'AY': 'PAPUA N GN',
    'BG': 'GREENLAND',
    'BI': 'ICELAND',
    'BK': 'KOSOVO',
    'CY': 'CANADA',
    'DA': 'ALGERIA',
    'DB': 'BENIN',
    'DF': 'BURKINA',
    'DG': 'GHANA',
    'DI': 'IVRY COAST',
    'DN': 'NIGERIA',
    'DR': 'NIGER',
    'DT': 'TUNISIA',
    'DX': 'TOGO',
    'EB': 'BELGIUM',
    'ED': 'GERMANY',
    'EE': 'ESTONIA',
    'EF': 'FINLAND',
    'EG': 'U KINGDOM',
    'EH': 'NETHERLNDS',
    'EI': 'IRELAND',
    'EK': 'DENMARK',
    'EL': 'LUXEMBOURG',
    'EN': 'NORWAY',
    'EP': 'POLAND',
    'ES': 'SWEDEN',
    'ET': 'GERMANY',
    'EV': 'LATVIA',
    'EY': 'LITHUANIA',
    'FA': 'S AFRICA',
    'FB': 'BOTSWANA',
    'FC': 'CONGO',
    'FD': 'ESWATINI',
    'FE': 'CENTRL AFR',
    'FG': 'EQU GUINEA',
    'FH': 'ASCN/ST HL',
    'FI': 'MAURITIUS',
    'FJ': 'IND OCN TR',
    'FK': 'CAMEROON',
    'FL': 'ZAMBIA',
    'FM': 'MADAGASCAR',
    'FN': 'ANGOLA',
    'FO': 'GABON',
    'FP': 'SAO TOME',
    'FQ': 'MOZAMBIQUE',
    'FS': 'SEYCHELLES',
    'FT': 'CHAD',
    'FV': 'ZIMBABWE',
    'FW': 'MALAWI',
    'FX': 'LESOTHO',
    'FY': 'NAMIBIA',
    'FZ': 'DEM CONGO',
    'GA': 'MALI',
    'GB': 'GAMBIA',
    'GC': 'CANARY IS',
    'GE': 'MELILLA',
    'GF': 'SIER LEONE',
    'GG': 'GUIN-BSSAU',
    'GL': 'LIBERIA',
    'GM': 'MOROCCO',
    'GO': 'SENEGAL',
    'GQ': 'MAURITANIA',
    'GS': 'W SAHARA',
    'GU': 'GUINEA',
    'GV': 'CAPE VERDE',
    'HA': 'ETHIOPIA',
    'HB': 'BURUNDI',
    'HD': 'DJIBOUTI',
    'HE': 'EGYPT',
    'HH': 'ERITREA',
    'HK': 'KENYRA',
    'HL': 'LIBYA',
    'HR': 'RWANDA',
    'HS': 'SUDAN',
    'HT': 'TANZANIA',
    'HU': 'UGANDA',
    'K1': 'NW USA',
    'K2': 'SW USA',
    'K3': 'N CEN USA',
    'K4': 'S CEN USA',
    'K5': 'GR LKS USA',
    'K6': 'NE USA',
    'K7': 'SE USA',
    'LA': 'ALBANIA',
    'LB': 'BULGARIA',
    'LC': 'CYPRUS',
    'LD': 'CROATIA',
    'LE': 'SPAIN',
    'LF': 'FRANCE',
    'LG': 'GREECE',
    'LH': 'HUNGARY',
    'LI': 'ITALY',
    'LJ': 'SLOVENIA',
    'LK': 'CZECH',
    'LL': 'ISRAEL',
    'LM': 'MALTA',
    'LO': 'AUSTRIA',
    'LP': 'PORTUGAL',
    'LQ': 'BOSNIA-HRZ',
    'LR': 'ROMANIA',
    'LS': 'SWITZRLAND',
    'LT': 'TURKEY',
    'LU': 'MOLDOVA',
    'LV': 'PALESTINE',
    'LW': 'MACEDONIA',
    'LX': 'GIBRALTAR',
    'LY': 'SERB/MONTG',
    'LZ': 'SLOVAKIA',
    'MB': 'TURKS/CAIC',
    'MD': 'DOM REPBLC',
    'MG': 'GUATEMALA',
    'MH': 'HONDURAS',
    'MK': 'JAMAICA',
    'MM': 'MEXICO',
    'MN': 'NICARAGUA',
    'MP': 'PANAMA',
    'MR': 'COSTA RICA',
    'MS': 'EL SALVDOR',
    'MT': 'HAITI',
    'MU': 'CUBA',
    'MW': 'CAYMAN IS',
    'MY': 'BAHAMAS',
    'MZ': 'BELIZE',
    'NC': 'COOK IS',
    'NF': 'FIJI/TONGA',
    'NG': 'KIRI/TUVLU',
    'NI': 'NIUE',
    'NL': 'FUTNA/WALS',
    'NS': 'AM/W SAMOA',
    'NT': 'FRNCH POLY',
    'NV': 'VANUATU',
    'NW': 'N CALEDNIA',
    'NZ': 'NEW ZEALND',
    'OA': 'AFGHNISTAN',
    'OB': 'BAHRAIN',
    'OE': 'SAUDI ARAB',
    'OI': 'IRAN',
    'OJ': 'JORDAN',
    'OK': 'KUWAIT',
    'OL': 'LEBANON',
    'OM': 'ARAB EMIRA',
    'OO': 'OMAN',
    'OP': 'PAKISTAN',
    'OR': 'IRAQ',
    'OS': 'SYRIA',
    'OT': 'QATAR',
    'OY': 'YEMEN',
    'PA': 'ALASKA',
    'PG': 'GUAM',
    'PH': 'HAWAII',
    'PJ': 'JOHNSTON ATOLL',
    'PK': 'MARSHLL IS',
    'PL': 'KIRIBATI',
    'PM': 'MIDWAY IS',
    'PO': 'ALASKA',
    'PP': 'ALASKA',
    'PT': 'MICRONESIA',
    'PW': 'WAKE IS',
    'RC': 'TAIWAN',
    'RJ': 'JAPAN',
    'RK': 'S KOREA',
    'RO': 'OKINAWA',
    'RP': 'PHILIPPINS',
    'SA': 'ARGENTINA',
    'SB': 'BRAZIL',
    'SC': 'CHILE',
    'SD': 'BRAZIL',
    'SE': 'EQUADOR',
    'SG': 'PARAGUAY',
    'SI': 'BRAZIL',
    'SJ': 'BRAZIL',
    'SK': 'COLOMBIA',
    'SL': 'BOLIVIA',
    'SM': 'SURINAME',
    'SO': 'FRN GUIANA',
    'SP': 'PERU',
    'SS': 'BRAZIL',
    'SU': 'URUGUAY',
    'SV': 'VENEZUELA',
    'SW': 'BRAZIL',
    'SY': 'GUYANA',
    'TA': 'ANTIGUA',
    'TB': 'BARBADOS',
    'TD': 'ANTIGUA',
    'TF': 'GUAD/MRTNQ',
    'TG': 'GRENADA',
    'TI': 'US VRGN IS',
    'TJ': 'PUERTO RIC',
    'TK': 'ST KTS/NEV',
    'TL': 'ST LUCIA',
    'TN': 'ARUBA',
    'TQ': 'ANGUILLA',
    'TT': 'MONTSERRAT',
    'TU': 'TRIN/TOBAG',
    'TV': 'BR VRGN IS',
    'TX': 'BERMUDA',
    'UA': 'KZKHSTN',
    'UB': 'AZERBAIJAN',
    'UC': 'KYRGYZSTAN',
    'UD': 'ARMENIA',
    'UE': 'RUSSIA',
    'UG': 'GEORGIA',
    'UH': 'RUSSIA',
    'UI': 'RUSSIA',
    'UK': 'UKRAINE',
    'UL': 'RUSSIA',
    'UM': 'RUSS/BELRS',
    'UN': 'RUSSIA',
    'UO': 'RUSSIA',
    'UR': 'RUSS/KZKST',
    'US': 'RUSSIA',
    'UT': 'UZBEK/TADZ',
    'UU': 'RUSSIA',
    'UW': 'RUSSIA',
    'VA': 'INDIA',
    'VC': 'SRI LANKA',
    'VD': 'CAMBODIA',
    'VE': 'INDIA',
    'VG': 'BANGLADESH',
    'VH': 'HONG KONG',
    'VI': 'INDIA',
    'VL': 'LAOS',
    'VM': 'MACAU',
    'VN': 'NEPAL',
    'VO': 'INDIA',
    'VR': 'MALDIVES',
    'VT': 'THAILAND',
    'VV': 'VIETNAM',
    'VY': 'MYANMAR',
    'WA': 'INDONESIA',
    'WB': 'BRUNEI',
    'WI': 'INDONESIA',
    'WM': 'MALAYSIA',
    'WR': 'INDONESIA',
    'WS': 'SINGAPORE',
    'YB': 'AUSTRALIA',
    'YM': 'AUSTRALIA',
    'ZB': 'CHINA',
    'ZG': 'CHINA',
    'ZH': 'CHINA',
    'ZK': 'N KOREA',
    'ZL': 'CHINA',
    'ZM': 'MONGOLIA',
    'ZP': 'CHINA',
    'ZS': 'CHINA',
    'ZU': 'CHINA',
    'ZW': 'CHINA',
    'ZY': 'CHINA',
  };

  /**
   * Gets the Garmin display name of the region associated with a specified ICAO region code.
   * @param code - the 2 character ICAO region code.
   * @returns the Garmin display name of the region.
   */
  public static getName(code: string): string {
    const name = Regions.NAME_TABLE[code.toUpperCase()];
    return name ?? '';
  }
}