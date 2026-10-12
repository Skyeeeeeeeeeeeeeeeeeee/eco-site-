    <!-- base cabin, 200x260, flat facets -->
    <g id="cabg">
      <polygon points="12,246 196,246 204,254 2,254" fill="#2F5F8F" opacity=".4"/>
      <polygon points="120,42 180,56 180,232 120,244" fill="var(--side)"/>
      <rect x="20" y="42" width="100" height="202" fill="var(--front)"/>
      <rect x="14" y="30" width="112" height="14" fill="var(--roof)"/>
      <polygon points="126,30 186,44 186,58 126,44" fill="var(--roof2)"/>
      <rect x="14" y="30" width="112" height="2" fill="var(--rim)"/>
      <polygon points="126,30 186,44 186,46 126,32" fill="var(--rim2)"/>
      <rect x="20" y="44" width="2" height="200" fill="var(--rim)"/>
      <rect x="178" y="58" width="2" height="174" fill="var(--rim2)"/>
      <rect x="34" y="70" width="72" height="162" fill="var(--door)"/>
      <polygon points="34,70 72,70 34,158" fill="var(--facet)"/>
      <rect x="44" y="50" width="52" height="2" fill="var(--detail)"/>
      <rect x="44" y="55" width="52" height="2" fill="var(--detail)"/>
      <rect x="44" y="60" width="52" height="2" fill="var(--detail)"/>
      <rect x="93" y="142" width="6" height="20" rx="1" fill="var(--detail)"/>
      <rect x="40" y="224" width="60" height="2" fill="var(--rim2)"/>
      <polygon points="136,86 172,94 172,98 136,90" fill="var(--detail)"/>
      <polygon points="136,100 160,106 160,109 136,103" fill="var(--rim2)"/>
      <rect x="20" y="244" width="100" height="3" fill="#2F5F8F"/>
    </g>
    <!-- МТК Стандарт: классический вид -->
    <g id="mS"><use href="#cabg" x="40"/></g>
    <!-- МТК Эконом: проще и немного меньше, гладкая дверь без вентиляционных полос -->
    <g id="mE">
      <polygon points="52,246 214,246 222,254 44,254" fill="#2F5F8F" opacity=".4"/>
      <polygon points="148,76 204,88 204,232 148,244" fill="var(--side)"/>
      <rect x="62" y="76" width="86" height="168" fill="var(--front)"/>
      <rect x="56" y="66" width="98" height="12" fill="var(--roof)"/>
      <polygon points="154,66 210,78 210,90 154,78" fill="var(--roof2)"/>
      <rect x="56" y="66" width="98" height="2" fill="var(--rim)"/>
      <rect x="62" y="78" width="2" height="166" fill="var(--rim)"/>
      <rect x="74" y="94" width="62" height="140" fill="var(--door)"/>
      <rect x="124" y="156" width="5" height="16" rx="1" fill="var(--detail)"/>
      <rect x="62" y="244" width="86" height="3" fill="#2F5F8F"/>
    </g>
    <!-- МТК Комфорт: шире, светлая крыша со световой полосой, боковые вентиляционные окна -->
    <g id="mK">
      <polygon points="14,246 244,246 254,254 4,254" fill="#2F5F8F" opacity=".4"/>
      <polygon points="168,44 242,58 242,232 168,244" fill="var(--side)"/>
      <rect x="24" y="44" width="144" height="200" fill="var(--front)"/>
      <rect x="16" y="26" width="160" height="20" fill="var(--roofl)" stroke="var(--rim2)" stroke-width="1.5"/>
      <polygon points="176,26 250,40 250,58 176,46" fill="var(--roofl2)" stroke="var(--rim2)" stroke-width="1.5"/>
      <rect x="30" y="31" width="128" height="8" fill="var(--rim2)" opacity=".35"/>
      <rect x="16" y="44" width="160" height="2" fill="var(--rim2)"/>
      <rect x="24" y="46" width="2" height="198" fill="var(--rim)"/>
      <rect x="40" y="68" width="112" height="164" fill="var(--door)"/>
      <polygon points="40,68 96,68 40,168" fill="var(--facet)"/>
      <rect x="50" y="52" width="92" height="3" fill="var(--detail)"/>
      <rect x="50" y="58" width="92" height="3" fill="var(--detail)"/>
      <rect x="136" y="144" width="6" height="22" rx="1" fill="var(--detail)"/>
      <polygon points="180,84 232,94 232,100 180,90" fill="var(--detail)"/>
      <polygon points="180,106 232,116 232,122 180,112" fill="var(--detail)"/>
      <polygon points="180,128 232,138 232,144 180,134" fill="var(--detail)"/>
      <rect x="24" y="244" width="144" height="3" fill="#2F5F8F"/>
    </g>
    <!-- МТК VIP: тот же корпус, что у Комфорта, и табличка VIP на двери -->
    <g id="mV">
      <use href="#mK"/>
      <rect x="62" y="96" width="68" height="30" rx="6" fill="var(--detail)"/>
      <rect x="62" y="96" width="68" height="30" rx="6" fill="none" stroke="#fff" stroke-width="2"/>
      <text x="96" y="118" text-anchor="middle" font-size="19" font-weight="600" font-family="Onest,Arial,sans-serif" letter-spacing="1" fill="#fff">VIP</text>
    </g>
    <!-- МТК VIP внутри: зеркало, рукомойник с педалью, бак воды, диспенсер мыла, полотенцедержатель -->
    <g id="mVin">
      <polygon points="0,0 280,0 250,22 30,22" fill="var(--roofl)"/>
      <polygon points="0,0 30,22 30,214 0,260" fill="var(--side)"/>
      <polygon points="280,0 250,22 250,214 280,260" fill="var(--side)"/>
      <rect x="30" y="22" width="220" height="192" fill="var(--front)"/>
      <polygon points="0,260 30,214 250,214 280,260" fill="var(--door)"/>
      <rect x="100" y="42" width="80" height="76" rx="6" fill="#F4F9FE"/>
      <rect x="100" y="42" width="80" height="76" rx="6" fill="none" stroke="var(--rim2)" stroke-width="4"/>
      <polygon points="106,112 138,48 154,48 122,112" fill="var(--facet)" opacity=".6"/>
      <rect x="132" y="122" width="8" height="26" fill="var(--detail)"/>
      <rect x="132" y="122" width="26" height="7" fill="var(--detail)"/>
      <rect x="84" y="146" width="112" height="9" rx="2" fill="var(--roof)"/>
      <polygon points="92,155 188,155 174,178 106,178" fill="#F4F9FE"/>
      <rect x="100" y="178" width="80" height="36" fill="var(--rim2)"/>
      <rect x="108" y="186" width="64" height="24" fill="var(--door)"/>
      <polygon points="128,230 152,230 158,242 122,242" fill="var(--detail)"/>
      <rect x="138" y="214" width="4" height="16" fill="var(--detail)"/>
      <rect x="198" y="170" width="32" height="44" rx="4" fill="var(--roof2)"/>
      <rect x="208" y="162" width="12" height="9" fill="var(--detail)"/>
      <rect x="52" y="104" width="18" height="34" rx="4" fill="#F4F9FE"/>
      <rect x="57" y="94" width="8" height="11" fill="var(--detail)"/>
      <rect x="57" y="94" width="14" height="4" fill="var(--detail)"/>
      <rect x="200" y="86" width="36" height="5" rx="2" fill="var(--detail)"/>
      <polygon points="204,91 232,91 232,128 218,120 204,128" fill="var(--facet)"/>
    </g>
