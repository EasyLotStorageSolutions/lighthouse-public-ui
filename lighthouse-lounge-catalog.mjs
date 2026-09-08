// Shared catalog restored from Lighthouse World Lounge v20.
export const countries = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
  IE: 'Ireland',
  NZ: 'New Zealand',
  MX: 'Mexico',
  BR: 'Brazil',
  ZA: 'South Africa',
  JP: 'Japan',
};
export const regionalTV = {
  US: [
    {
      name: 'PBS',
      description:
        'Your local public television livestream and on-demand library',
      url: 'https://www.pbs.org/livestream/',
      type: 'local',
    },
    {
      name: 'Local Now',
      description: 'Local news, weather, stories, and free live channels',
      url: 'https://localnow.com/',
      type: 'local',
    },
    {
      name: 'CBS News 24/7',
      description: 'National coverage plus participating local CBS streams',
      url: 'https://www.cbsnews.com/live/',
      type: 'news',
    },
    {
      name: 'NBC News NOW',
      description: 'Continuous national news from NBC News',
      url: 'https://www.nbcnews.com/now',
      type: 'news',
    },
    {
      name: 'ABC News Live',
      description: 'Live breaking news and original reporting',
      url: 'https://abcnews.go.com/Live',
      type: 'news',
    },
    {
      name: 'Tubi Live TV',
      description: 'Free live news, sports, entertainment, and local channels',
      url: 'https://tubitv.com/live',
      type: 'free',
    },
    {
      name: 'The Roku Channel',
      description: 'Free live television guide and on-demand programs',
      url: 'https://therokuchannel.roku.com/',
      type: 'free',
    },
    {
      name: 'Sling Freestream',
      description: 'Free live channels and on-demand television',
      url: 'https://www.sling.com/freestream',
      type: 'free',
    },
  ],
  CA: [
    {
      name: 'CBC Gem',
      description: 'Live CBC television and Canadian programs',
      url: 'https://gem.cbc.ca/live',
      type: 'local',
    },
    {
      name: 'CTV News',
      description: 'Canadian and local news livestreams',
      url: 'https://www.ctvnews.ca/video/live/',
      type: 'news',
    },
    {
      name: 'Global News',
      description: 'National and participating local Canadian news',
      url: 'https://globalnews.ca/live/',
      type: 'local',
    },
  ],
  GB: [
    {
      name: 'BBC iPlayer',
      description: 'BBC live television and on-demand programs',
      url: 'https://www.bbc.co.uk/iplayer',
      type: 'local',
    },
    {
      name: 'ITVX',
      description: 'ITV live channels and on-demand television',
      url: 'https://www.itv.com/watch',
      type: 'local',
    },
    {
      name: 'Channel 4',
      description: 'Channel 4 live and on-demand',
      url: 'https://www.channel4.com/',
      type: 'local',
    },
    {
      name: 'My5',
      description: 'Channel 5 live channels and on-demand programs',
      url: 'https://www.channel5.com/',
      type: 'local',
    },
  ],
  AU: [
    {
      name: 'ABC iview',
      description: 'Australian public television live and on-demand',
      url: 'https://iview.abc.net.au/',
      type: 'local',
    },
    {
      name: 'SBS On Demand',
      description: 'Australian and international live television',
      url: 'https://www.sbs.com.au/ondemand/',
      type: 'local',
    },
    {
      name: '7plus',
      description: 'Seven network live television and on-demand',
      url: 'https://7plus.com.au/',
      type: 'local',
    },
    {
      name: '9Now',
      description: 'Nine network live channels and on-demand',
      url: 'https://www.9now.com.au/',
      type: 'local',
    },
    {
      name: '10',
      description: 'Network 10 live television and on-demand',
      url: 'https://10.com.au/',
      type: 'local',
    },
  ],
  DE: [
    {
      name: 'ARD Mediathek',
      description: 'German public television live and on-demand',
      url: 'https://www.ardmediathek.de/live',
      type: 'local',
    },
    {
      name: 'ZDF',
      description: 'German public television livestreams',
      url: 'https://www.zdf.de/live-tv',
      type: 'local',
    },
    {
      name: 'Joyn',
      description: 'Live German channels and on-demand television',
      url: 'https://www.joyn.de/',
      type: 'free',
    },
  ],
  FR: [
    {
      name: 'france.tv',
      description: 'French public television live and on-demand',
      url: 'https://www.france.tv/',
      type: 'local',
    },
    {
      name: 'TF1+',
      description: 'French live channels and programs',
      url: 'https://www.tf1.fr/',
      type: 'local',
    },
    {
      name: 'M6+',
      description: 'French live television and on-demand programs',
      url: 'https://www.m6.fr/',
      type: 'local',
    },
  ],
};
export const globalTV = [
  {
    name: 'Plex Live TV',
    description: 'Hundreds of free live channels in supported countries',
    url: 'https://watch.plex.tv/live-tv',
    type: 'world',
  },
  {
    name: 'Pluto TV',
    description: 'Free live channels with a guide tailored by country',
    url: 'https://pluto.tv/live-tv',
    type: 'world',
  },
  {
    name: 'YouTube Live',
    description: 'Official news, culture, sports, and creator livestreams',
    url: 'https://www.youtube.com/live',
    type: 'world',
  },
  {
    name: 'DW',
    description: 'International news and documentaries in several languages',
    url: 'https://www.dw.com/en/live-tv/channel-english',
    type: 'news',
  },
  {
    name: 'France 24',
    description: 'International news in English, French, Arabic, and Spanish',
    url: 'https://www.france24.com/en/live',
    type: 'news',
  },
  {
    name: 'Al Jazeera English',
    description: 'International news and current affairs livestream',
    url: 'https://www.aljazeera.com/live',
    type: 'news',
  },
];
export const radioServices = [
  {
    name: 'iHeartRadio',
    description: 'Live local radio, music, sports, news, and podcasts',
    url: 'https://www.iheart.com/live/',
  },
  {
    name: 'TuneIn',
    description: 'Local and worldwide radio, news, sports, and podcasts',
    url: 'https://tunein.com/radio/',
  },
  {
    name: 'Radio Garden',
    description: 'Explore live stations by moving around a world map',
    url: 'https://radio.garden/',
  },
  {
    name: 'BBC Sounds',
    description: 'BBC live radio, music mixes, and podcasts',
    url: 'https://www.bbc.co.uk/sounds',
  },
];

