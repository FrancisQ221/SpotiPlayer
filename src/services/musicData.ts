import type { Song, Playlist, Artist } from '../types/music';

// Curated high fidelity tracks matching the visual mockups
export const MOCK_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Noche de Estudio en Shibuya',
    artist: 'Bioluminescent Sound',
    featuredArtists: ['Kaito Kurogane'],
    album: 'Neo-Tokyo Twilight (Deluxe)',
    duration: 225, // 03:45
    durationFormatted: '03:45',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/93v00/stream?app_name=SPOTIPLAYER',
    audioQuality: 'FLAC 24-bit / 96kHz',
    bitrate: '1,411 kbps RAW',
    sampleRate: '96.0 kHz / 24-bit',
    isLiked: true,
    patronCount: 48200,
    hasLosslessMaster: true,
    genre: 'Synthwave & Lo-Fi',
    releaseYear: 2024,
    lyrics: [
      { id: '1', time: 10, timestampStr: '00:10', text: 'Caminos de silicio en la oscuridad', translation: 'Silicon pathways in the deep dark' },
      { id: '2', time: 24, timestampStr: '00:24', text: 'Un pulso distante comienza a despertar', translation: 'A distant rhythmic pulse starts awakening' },
      { id: '3', time: 42, timestampStr: '00:42', text: 'En la frecuencia de la noche digital, las luces de neón susurran la verdad.', translation: 'Within the digital night\'s resonant frequency, neon lights whisper the truth.' },
      { id: '4', time: 65, timestampStr: '01:05', text: 'Ecos de un sintetizador que no duerme jamás', translation: 'Echoes of a synth that never rests' },
      { id: '5', time: 84, timestampStr: '01:24', text: 'Saltando bytes en ondas de pura gravedad', translation: 'Leaping bytes riding waves of sheer gravity' }
    ]
  },
  {
    id: 'song-2',
    title: 'Luz de Neón',
    artist: 'Sintetizador 88',
    album: 'Cyber Horizon',
    duration: 232, // 03:52
    durationFormatted: '03:52',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/Y96Ry/stream?app_name=SPOTIPLAYER',
    audioQuality: 'FLAC 96k',
    bitrate: '1,411 kbps RAW',
    sampleRate: '96.0 kHz / 24-bit',
    isLiked: false,
    patronCount: 15400,
    hasLosslessMaster: true,
    genre: 'Cyberpunk Synth',
    releaseYear: 2024
  },
  {
    id: 'song-3',
    title: 'Resonancia Cuántica',
    artist: 'Kavinsky & Synthwave Lab',
    album: 'Cybernetics Remastered',
    duration: 255, // 04:15
    durationFormatted: '04:15',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/D7KyD/stream?app_name=SPOTIPLAYER',
    audioQuality: 'FLAC 24-bit / 96kHz',
    bitrate: '1,411 kbps RAW',
    sampleRate: '96.0 kHz / 24-bit',
    isLiked: true,
    patronCount: 38200,
    hasLosslessMaster: true,
    genre: 'Synthwave',
    releaseYear: 2024
  },
  {
    id: 'song-4',
    title: 'Aura Eléctrica',
    artist: 'Valeria Vox',
    album: 'Resonancias Urbanas',
    duration: 252, // 04:12
    durationFormatted: '04:12',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/m8n0E/stream?app_name=SPOTIPLAYER',
    audioQuality: 'WAV 96k',
    bitrate: '1,411 kbps RAW',
    sampleRate: '96.0 kHz / 24-bit',
    isLiked: true,
    patronCount: 45200,
    hasLosslessMaster: true,
    genre: 'Indie Electro-Pop',
    releaseYear: 2024
  },
  {
    id: 'song-5',
    title: 'Medianoche en Bogotá',
    artist: 'Kroma Soundworks',
    album: 'Noche Capital',
    duration: 258, // 04:18
    durationFormatted: '04:18',
    coverUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/x59W8/stream?app_name=SPOTIPLAYER',
    audioQuality: 'Dolby Atmos',
    bitrate: '1,411 kbps RAW',
    sampleRate: '48.0 kHz / 24-bit',
    isLiked: false,
    patronCount: 22100,
    hasLosslessMaster: true,
    genre: 'Ambient Latino',
    releaseYear: 2024
  },
  {
    id: 'song-6',
    title: 'Atmósfera Café',
    artist: 'Luna Sol & Beats',
    album: 'Acústico Vol. 2',
    duration: 164, // 02:44
    durationFormatted: '02:44',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/kG5oP/stream?app_name=SPOTIPLAYER',
    audioQuality: 'FLAC 48k',
    bitrate: '920 kbps',
    sampleRate: '48.0 kHz / 24-bit',
    isLiked: true,
    patronCount: 18400,
    hasLosslessMaster: true,
    genre: 'Lo-Fi Chill',
    releaseYear: 2024
  },
  {
    id: 'song-7',
    title: 'Fuego Lento (Remix)',
    artist: 'Mateo Cruz',
    featuredArtists: ['Karla'],
    album: 'El Ritual Deluxe',
    duration: 195, // 03:15
    durationFormatted: '03:15',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/2V78n/stream?app_name=SPOTIPLAYER',
    audioQuality: 'Hi-Res Lossless',
    bitrate: '1,411 kbps RAW',
    sampleRate: '96.0 kHz / 24-bit',
    isLiked: false,
    patronCount: 29800,
    hasLosslessMaster: true,
    genre: 'Urbano Alternativo',
    releaseYear: 2024
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-cyberwave',
    title: 'Cyberwave 2088',
    description: 'Sintetizadores oscuros, electro retro y ritmo cyberpunk futurista para programar y sesiones creativas sin interrupciones acústicas.',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    curator: { id: 'alex-rivera', name: 'Alex Rivera', isVerified: true },
    visibility: 'public',
    isCollaborative: true,
    songs: [MOCK_SONGS[0], MOCK_SONGS[1], MOCK_SONGS[2], MOCK_SONGS[3]],
    songCount: 18,
    totalDuration: 4320, // 1h 12m
    tags: ['Synthwave', 'Cyberpunk', 'FLAC Master'],
    patronSupport: { patronsCount: 2480, fundedPercentage: 92, monthlyGoal: 5000 }
  },
  {
    id: 'playlist-urban',
    title: 'Novedades Urbanas 2024',
    description: 'Bajos 808 profundos, líricas vanguardistas y producción independiente de alta fidelidad sin algoritmos corporativos.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    curator: { id: 'urban-flow', name: 'Urban Flow Collective', isVerified: true },
    visibility: 'public',
    isCollaborative: false,
    songs: [MOCK_SONGS[3], MOCK_SONGS[4], MOCK_SONGS[6]],
    songCount: 24,
    totalDuration: 5200,
    tags: ['Urbano', 'Hip-Hop', 'Trap'],
    patronSupport: { patronsCount: 3180, fundedPercentage: 88 }
  },
  {
    id: 'playlist-synth-lofi',
    title: 'Synthwave & Lo-Fi Flow',
    description: 'Cintas de casete analógicas, vinilo cálido y ondas binaurales para máxima concentración nocturna.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    curator: { id: 'midnight-cat', name: 'Chilled Cat Records', isVerified: true },
    visibility: 'public',
    isCollaborative: false,
    songs: [MOCK_SONGS[0], MOCK_SONGS[2], MOCK_SONGS[5]],
    songCount: 32,
    totalDuration: 6800,
    tags: ['Lo-Fi', 'Ambient', 'Focus'],
    patronSupport: { patronsCount: 1420, fundedPercentage: 78 }
  },
  {
    id: 'playlist-cafe-chill',
    title: 'Café & Chill Acústico',
    description: 'Guitarras íntimas de madera, micrófonos ribbon y ambientes acústicos en vivo con naturalidad sonora.',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    curator: { id: 'acustica-pura', name: 'Sesiones de Madera', isVerified: false },
    visibility: 'private',
    isCollaborative: false,
    songs: [MOCK_SONGS[5], MOCK_SONGS[4]],
    songCount: 16,
    totalDuration: 3400,
    tags: ['Acústico', 'Jazz', 'Chillout']
  }
];

export const MOCK_ARTIST_VALERIA: Artist = {
  id: 'valeria-vox',
  name: 'Valeria Vox',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  bio: 'Cantante, diseñadora sonora y productora de Synthwave melancólico & Indie Electro-Pop. Creadora independiente desde Madrid con licencias abiertas y masterización en 96kHz/24-bit.',
  location: 'Madrid / Berlín',
  productionGear: 'Ableton & Moog',
  monthlyListeners: 142500,
  verified: true,
  isDirectAudio: true,
  patronStats: {
    totalPatrons: 384,
    monthlyFunding: 4100,
    fundingGoal: 5000,
    goalPercentage: 82,
  },
  patronTiers: [
    {
      id: 'tier-1',
      name: 'Invítale un Café',
      price: 3,
      currency: 'USD',
      perks: ['Acceso a chat en Discord', 'Insignia de mecenas', 'Descarga directa de pistas FLAC'],
      icon: 'coffee',
    },
    {
      id: 'tier-2',
      name: 'Pase Producción',
      price: 10,
      currency: 'USD',
      perks: ['Demos antes de lanzamiento & Créditos', 'Stem tracks sin comprimir', 'Stream mensual en vivo'],
      icon: 'headphones',
      isPopular: true,
    },
    {
      id: 'tier-3',
      name: 'Honorífico',
      price: 25,
      currency: 'USD',
      perks: ['Stems WAV + Vinilo exclusivo', 'Agradecimiento en carátula física', 'Sesión de mezcla 1-on-1'],
      icon: 'star',
    },
  ],
  popularTracks: [MOCK_SONGS[3], MOCK_SONGS[0], MOCK_SONGS[2]],
  latestRelease: {
    title: 'Neón & Ceniza (Deluxe)',
    type: 'Album',
    quality: 'FLAC 24-bit / 96kHz',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    year: 2024,
  },
};
