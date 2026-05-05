import React, { useState, useEffect, useRef } from 'react';
import { Search, Home, Settings, Wrench, Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Wallpaper, Layout, Palette, Music, Library as LibraryIcon, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { youtubeService } from './youtubeService';
import { authService } from './authService';

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = isLogin 
        ? await authService.login(username, password)
        : await authService.register(username, password);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '3rem', width: '400px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="search-input" 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="search-input" 
            required
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </div>
      </motion.div>
    </div>
  );
};

const ApplyVerifyModal = ({ onClose, token }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.applyVerify(token);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '3rem', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our team will review your profile and contact you within 7 days.</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle color="#3b82f6" /> Apply for Verification</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
            
            {step === 1 && (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>To get the blue checkmark, you must meet the following requirements:</p>
                <ul style={{ color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.5rem' }}>
                  <li>Have at least 10,000 monthly listeners.</li>
                  <li>Have released at least 3 original tracks.</li>
                  <li>Maintain an active social media presence.</li>
                  <li>No copyright strikes on your account.</li>
                </ul>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>I Meet These Requirements</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please provide your primary social media link (Instagram/Twitter) for identity verification:</p>
                <input type="text" className="search-input" placeholder="https://instagram.com/yourhandle" style={{ marginBottom: '2rem' }} />
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};


const ArtistCard = ({ artist, onClick }) => {
  const [imgSrc, setImgSrc] = useState(artist.icon || '');
  
  useEffect(() => {
    if (!artist.isVerified) {
      fetch(`/api/artist/pfp?name=${encodeURIComponent(artist.name)}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) setImgSrc(data.url);
        })
        .catch(err => console.error('Failed to load PFP for', artist.name));
    }
  }, [artist]);

  return (
    <motion.div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} whileHover={{ scale: 1.05 }} onClick={() => onClick(artist)}>
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${artist.isVerified ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`, background: 'rgba(0,0,0,0.5)' }}>
        {imgSrc ? (
          <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          </div>
        )}
        {artist.isVerified && (
          <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'white', borderRadius: '50%', padding: '2px', display: 'flex' }}>
            <CheckCircle size={14} color="#3b82f6" />
          </div>
        )}
      </div>
      <div style={{ fontWeight: 'bold' }}>{artist.name}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{artist.sub}</div>
    </motion.div>
  );
};

const MessagesPanel = ({ onClose, artist }) => {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([
    { sender: artist.name, text: 'Yooo what up?', time: '2:00 PM' }
  ]);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setChat([...chat, { sender: 'You', text: msg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setMsg('');
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '350px', background: 'var(--glass-bg)', borderLeft: '1px solid var(--glass-border)', zIndex: 9999, display: 'flex', flexDirection: 'column', backdropFilter: 'blur(20px)' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
            <img src={artist.icon} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid #000' }}></div>
          </div>
          <div style={{ fontWeight: 'bold' }}>{artist.name}</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
      </div>
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chat.map((c, i) => (
          <div key={i} style={{ alignSelf: c.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ background: c.sender === 'You' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', borderBottomRightRadius: c.sender === 'You' ? 0 : '12px', borderBottomLeftRadius: c.sender === 'You' ? '12px' : 0 }}>
              {c.text}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: c.sender === 'You' ? 'right' : 'left' }}>{c.time}</div>
          </div>
        ))}
      </div>
      <form onSubmit={send} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
        <input type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message..." className="search-input" style={{ flex: 1, padding: '0.8rem' }} />
        <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.2rem' }}>Send</button>
      </form>
    </div>
  );
};

const ArtistProfile = ({ artist, onBack, onPlay, onAddToLibrary, user, onSubscribe, onMessage }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSubbed = user?.subscriptions?.includes(artist.name);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    youtubeService.search(`${artist.name} top tracks music video`).then(res => {
      if (mounted) {
        setTracks(res);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => mounted = false;
  }, [artist]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        &larr; Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginBottom: '4rem' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${artist.isVerified ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, flexShrink: 0 }}>
          <img src={artist.icon} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>{artist.name}</h1>
            {artist.isVerified && <CheckCircle size={32} color="#3b82f6" />}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{artist.sub}</p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => onSubscribe(artist.name)} style={{ background: isSubbed ? 'transparent' : 'var(--primary)', border: isSubbed ? '1px solid var(--primary)' : 'none', color: isSubbed ? 'var(--primary)' : 'white' }}>
              {isSubbed ? 'Subscribed' : 'Subscribe'}
            </button>
            <button className="btn-primary" onClick={() => onMessage(artist)} style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
              Message
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Top Tracks</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : (
        <MusicGrid tracks={tracks} onPlay={onPlay} onAddToLibrary={onAddToLibrary} />
      )}
    </motion.div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, user, setShowAuthModal, handleLogout }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'artists', icon: Users, label: 'Artists' },
    { id: 'library', icon: LibraryIcon, label: 'Library' },
    { id: 'mods', icon: Wrench, label: 'Mods' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '4px', marginBottom: '2rem', color: '#ef4444', textTransform: 'uppercase', fontStyle: 'italic' }}>
        XCLOWN
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} color={activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user.username}</div>
                {user.isVerified && <div style={{ fontSize: '0.7rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '2px' }}><CheckCircle size={10} /> Verified</div>}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.5rem', fontSize: '0.8rem' }}>Sign Out</button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>Sign In</button>
        )}
      </div>
    </div>
  );
};

const MusicGrid = ({ tracks, onPlay, onAddToLibrary }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
    {tracks.map((track) => (
      <motion.div
        key={track.id}
        className="glass-card"
        style={{ padding: '1rem', cursor: 'pointer', position: 'relative' }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onPlay(track)}
      >
        <img 
          src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`} 
          alt={track.title} 
          style={{ width: '100%', borderRadius: '12px', aspectRatio: '1/1', objectFit: 'cover', marginBottom: '0.8rem' }} 
          onError={(e) => { e.target.src = '/wallpapers/von1.png'; }}
        />
        <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{track.uploaderName}</div>
          {onAddToLibrary && !track.isLocal && (
            <div 
              onClick={(e) => { e.stopPropagation(); onAddToLibrary(track); }}
              style={{ padding: '4px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              title="Add to Library"
            >
              <LibraryIcon size={16} />
            </div>
          )}
        </div>
      </motion.div>
    ))}
  </div>
);

const NowPlayingModal = ({ track, onClose, isLooping, toggleLoop, progress, duration, formatTime }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, 
        padding: '3rem', display: 'flex', gap: '3rem', backdropFilter: 'blur(20px)' 
      }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
        <Maximize2 size={32} style={{ transform: 'rotate(45deg)' }} />
      </button>

      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src={track.thumbnail} alt="" style={{ width: '80%', maxWidth: '400px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(239, 68, 68, 0.3)' }} />
        <h1 style={{ marginTop: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>{track.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{track.uploaderName}</p>
        
        <div style={{ width: '100%', maxWidth: '500px', marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
            <div style={{ height: '100%', width: `${(progress/duration)*100}%`, background: 'var(--primary)', borderRadius: '3px' }} />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div 
            onClick={toggleLoop}
            style={{ cursor: 'pointer', color: isLooping ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SkipBack size={24} />
            <span>Loop: {isLooping ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: '1', overflowY: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Lyrics</h2>
        <div style={{ fontSize: '1.5rem', lineHeight: '2.5rem', color: '#ccc' }}>
          {/* Simulated Lyrics for the demo */}
          <p>Looking at the stars above...</p>
          <p>In the silence of the night...</p>
          <p>The cosmic dance of light and love...</p>
          <p>Burning bright, oh so bright...</p>
          <br />
          <p style={{ color: 'white', fontWeight: 'bold' }}>Searching for the truth within...</p>
          <p>Beyond the edge of space and time...</p>
          <p>A journey where we all begin...</p>
          <p>In this universe of mine...</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showMessages, setShowMessages] = useState(false);

  
  // Customization State (Mods) - Load from localStorage
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('stellar-theme') || '#ef4444');
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('stellar-wallpaper') || '/wallpapers/von1.jpg');
  const [sidebarPos, setSidebarPos] = useState(() => localStorage.getItem('stellar-sidebar') || 'left');
  
  // Music State
  const [localTracks, setLocalTracks] = useState(() => JSON.parse(localStorage.getItem('stellar-local') || '[]'));
  const [trendingTracks, setTrendingTracks] = useState([]);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', themeColor);
    root.style.setProperty('--wallpaper-url', wallpaper ? `url(${wallpaper})` : 'none');
    root.style.setProperty('--sidebar-width', sidebarPos === 'hidden' ? '0px' : '260px');
    
    // Check local storage for token on mount
    const savedToken = localStorage.getItem('stellar-token');
    const savedUser = localStorage.getItem('stellar-user');
    if (savedToken && savedUser && !user) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    localStorage.setItem('stellar-theme', themeColor);
    localStorage.setItem('stellar-wallpaper', wallpaper);
    localStorage.setItem('stellar-sidebar', sidebarPos);
    localStorage.setItem('stellar-local', JSON.stringify(localTracks));
  }, [themeColor, wallpaper, sidebarPos, localTracks]);

  useEffect(() => {
    // Fetch trending on mount for "Live" feel
    const fetchTrending = async () => {
      const results = await youtubeService.search('trending music 2024');
      setTrendingTracks(results.slice(0, 8));
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync loop state to the native audio element
  useEffect(() => {
    audioRef.current.loop = isLooping;
  }, [isLooping]);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery) {
      setIsLoading(true);
      const results = await youtubeService.search(searchQuery);
      setSearchResults(results);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newTracks = files.map(file => ({
      id: `local-${Date.now()}-${file.name}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      uploaderName: 'Local File',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
      isLocal: true,
      file: file
    }));
    setLocalTracks([...localTracks, ...newTracks]);
  };

  const addToLibrary = (track) => {
    // Don't add duplicates
    if (localTracks.find(t => t.id === track.id)) return;
    const libTrack = {
      ...track,
      isLibrary: true,
      thumbnail: track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`
    };
    setLocalTracks(prev => [...prev, libTrack]);
  };

  const playTrack = async (track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    
    if (track.isLocal && track.file) {
      audioRef.current.src = URL.createObjectURL(track.file);
    } else {
      // Point audio directly at our server's proxy endpoint
      const streamUrl = youtubeService.getStreamUrl(track.id);
      audioRef.current.src = streamUrl;
    }
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch(e) {
      console.error('Play error:', e);
    }
  };

  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('stellar-token', data.token);
    localStorage.setItem('stellar-user', JSON.stringify(data.user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('stellar-token');
    localStorage.removeItem('stellar-user');
  };


  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container" style={{ gridTemplateColumns: sidebarPos === 'left' ? 'var(--sidebar-width) 1fr' : '1fr var(--sidebar-width)' }}>
      <div className="clown-accent" />
      {sidebarPos !== 'hidden' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} setShowAuthModal={setShowAuthModal} handleLogout={handleLogout} />}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
      {showVerifyModal && <ApplyVerifyModal onClose={() => setShowVerifyModal(false)} token={token} />}
      {showMessages && selectedArtist && <MessagesPanel onClose={() => setShowMessages(false)} artist={selectedArtist} />}

      <main className="main-content">
        <AnimatePresence mode="wait">
          {selectedArtist && !showMessages && (
            <ArtistProfile 
              key="artist-profile"
              artist={selectedArtist} 
              onBack={() => setSelectedArtist(null)} 
              onPlay={playTrack}
              onAddToLibrary={addToLibrary}
              user={user}
              onSubscribe={(name) => {
                if (!user) return setShowAuthModal(true);
                const subbed = user.subscriptions?.includes(name);
                const newSubs = subbed ? user.subscriptions.filter(s => s !== name) : [...(user.subscriptions || []), name];
                setUser({ ...user, subscriptions: newSubs });
                // In a real app we would call authService.subscribe(...)
              }}
              onMessage={(artist) => {
                if (!user) return setShowAuthModal(true);
                setShowMessages(true);
              }}
            />
          )} 
          
          {activeTab === 'home' && !selectedArtist && !showMessages && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ position: 'relative', marginBottom: '2.5rem', maxWidth: '600px' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '3rem' }}
                  placeholder="Search for songs or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>

              <h2 style={{ marginBottom: '1.5rem' }}>{searchResults.length > 0 ? 'Search Results' : 'Trending Now'}</h2>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
                  />
                </div>
              ) : searchResults.length > 0 ? (
                <MusicGrid tracks={searchResults} onPlay={playTrack} onAddToLibrary={addToLibrary} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <MusicGrid tracks={trendingTracks} onPlay={playTrack} onAddToLibrary={addToLibrary} />
                  
                  <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--accent-gradient)', opacity: 0.9 }}>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Ready for your own music?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Check out the Library tab to add your local MP3s!</p>
                    <button className="btn-primary" style={{ background: 'white', color: 'black' }} onClick={() => setActiveTab('library')}>Go to Library</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'artists' && !selectedArtist && !showMessages && (
            <motion.div
              key="artists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Featured Artists</h2>
                <button className="btn-primary" onClick={() => user ? setShowVerifyModal(true) : setShowAuthModal(true)}>
                  Apply for Verification
                </button>
              </div>
              
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} color="#3b82f6" /> Verified Artists
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
                  {[
                    { name: 'Clownpierce', icon: '/wallpapers/von1.jpg', sub: '1.2M Listeners', isVerified: true },
                    { name: 'King Von', icon: '/wallpapers/von2.jpg', sub: '18M Listeners', isVerified: true },
                    { name: 'NBA YoungBoy', icon: '/wallpapers/von3.jpg', sub: '25M Listeners', isVerified: true },
                    { name: 'Polo G', icon: '/wallpapers/von4.jpg', sub: '22M Listeners', isVerified: true }
                  ].map((artist, i) => (
                    <ArtistCard key={i} artist={artist} onClick={setSelectedArtist} />
                  ))}
                </div>
              </div>

              <h2 style={{ marginBottom: '1.5rem' }}>Discover All Artists</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
                {[
                  { name: 'Drake', sub: '80M Listeners', isVerified: false },
                  { name: 'Travis Scott', sub: '50M Listeners', isVerified: false },
                  { name: 'Lil Baby', sub: '35M Listeners', isVerified: false },
                  { name: 'Future', sub: '40M Listeners', isVerified: false },
                  { name: 'Lil Uzi Vert', sub: '28M Listeners', isVerified: false },
                  { name: '21 Savage', sub: '45M Listeners', isVerified: false },
                  { name: 'Playboi Carti', sub: '30M Listeners', isVerified: false },
                  { name: 'Gunna', sub: '26M Listeners', isVerified: false },
                  { name: 'Chief Keef', sub: '12M Listeners', isVerified: false },
                  { name: 'Lil Durk', sub: '20M Listeners', isVerified: false }
                ].map((artist, i) => (
                  <ArtistCard key={i} artist={artist} onClick={setSelectedArtist} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && !selectedArtist && !showMessages && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 style={{ marginBottom: '2rem' }}>Your Library</h2>
              
              {!user && (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid #3b82f6' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Sign in to create and save playlists across devices!</p>
                  <button className="btn-primary" onClick={() => setShowAuthModal(true)}>Sign In</button>
                </div>
              )}

              {user && (
                <div style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Playlists</h3>
                    <button className="btn-primary" onClick={async () => {
                      const name = window.prompt('Enter playlist name:');
                      if (name) {
                        try {
                          const p = await authService.createPlaylist(token, name);
                          setUser(prev => ({ ...prev, playlists: [...(prev.playlists || []), p] }));
                        } catch(e) { alert(e.message); }
                      }
                    }}>+ New Playlist</button>
                  </div>
                  
                  {(!user.playlists || user.playlists.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)' }}>No playlists yet. Create one!</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      {user.playlists.map(p => (
                        <div key={p.id} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => alert('Playlist viewer coming soon!')}>
                          <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--glass-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Music size={40} opacity={0.5} />
                          </div>
                          <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.tracks.length} tracks</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Saved Tracks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {localTracks.length > 0 ? (
                  <MusicGrid tracks={localTracks} onPlay={playTrack} />
                ) : (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Music size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)' }}>Your library is empty. Search for tracks to add them!</p>
                  </div>
                )}

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--glass-border)' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Add Local Music</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Drag & drop your music files or click to upload.</p>
                  <input type="file" multiple accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload-lib" />
                  <label htmlFor="file-upload-lib" className="btn-primary" style={{ padding: '0.8rem 2rem', display: 'inline-block', cursor: 'pointer' }}>
                    Select Files
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'mods' && !selectedArtist && !showMessages && (
            <motion.div
              key="mods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 style={{ marginBottom: '2rem' }}>Mods & Customization</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <Palette size={20} color={themeColor} />
                    <h3 style={{ fontSize: '1.1rem' }}>Theme Color</h3>
                  </div>
                  <input 
                    type="color" 
                    value={themeColor} 
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <Wallpaper size={20} />
                    <h3 style={{ fontSize: '1.1rem' }}>Wallpaper</h3>
                  </div>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Image URL (e.g. Unsplash link)"
                    value={wallpaper}
                    onChange={(e) => setWallpaper(e.target.value)}
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    {[
                      '/wallpapers/von1.jpg',
                      '/wallpapers/von2.jpg',
                      '/wallpapers/von3.jpg',
                      '/wallpapers/von4.jpg',
                    ].map((url, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setWallpaper(url.startsWith('/') ? url : `${url}?auto=format&fit=crop&q=80&w=1600`)}
                        style={{ width: '80px', height: '50px', borderRadius: '8px', backgroundImage: `url(${url.startsWith('/') ? url : `${url}?auto=format&fit=crop&q=80&w=200`})`, backgroundSize: 'cover', cursor: 'pointer', border: wallpaper.includes(url) ? '2px solid white' : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <Layout size={20} />
                    <h3 style={{ fontSize: '1.1rem' }}>Layout</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => setSidebarPos('left')} style={{ flex: 1, opacity: sidebarPos === 'left' ? 1 : 0.5 }}>Left Sidebar</button>
                    <button className="btn-primary" onClick={() => setSidebarPos('hidden')} style={{ flex: 1, opacity: sidebarPos === 'hidden' ? 1 : 0.5 }}>Minimal</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && !selectedArtist && !showMessages && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 style={{ marginBottom: '2rem' }}>Settings</h2>
              <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Audio Quality</h3>
                  <select className="search-input">
                    <option>High (160kbps)</option>
                    <option>Medium (128kbps)</option>
                    <option>Data Saver (64kbps)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>Gapless Playback</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Eliminate silence between songs</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', marginTop: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>XClown Music v1.0.0</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Connected to Piped API (Ad-Free Engine)</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="player-bar">
        <div 
          onClick={() => currentTrack && setShowNowPlaying(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', width: '30%', cursor: currentTrack ? 'pointer' : 'default' }}
        >
          {currentTrack ? (
            <>
              <img src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`} alt="" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentTrack.uploaderName}</div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No song selected</div>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <SkipBack size={24} style={{ cursor: 'pointer', color: 'var(--primary)' }} />
            <div 
              onClick={togglePlay}
              style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--sidebar-bg)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            >
              {isPlaying ? <Pause size={24} style={{ margin: 'auto' }} /> : <Play size={24} style={{ margin: 'auto', marginLeft: '4px' }} />}
            </div>
            <SkipForward size={24} style={{ cursor: 'pointer', color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '500px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '35px' }}>{formatTime(progress)}</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(progress / duration) * 100}%`, background: 'var(--primary)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '35px' }}>{formatTime(duration)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '30%', justifyContent: 'flex-end' }}>
          <Volume2 size={20} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(e.target.value)}
            style={{ width: '100px', accentColor: 'var(--primary)' }}
          />
          <Maximize2 size={20} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
        </div>
      </footer>

      <AnimatePresence>
        {showNowPlaying && currentTrack && (
          <NowPlayingModal 
            track={currentTrack} 
            onClose={() => setShowNowPlaying(false)}
            isLooping={isLooping}
            toggleLoop={() => setIsLooping(!isLooping)}
            progress={progress}
            duration={duration}
            formatTime={formatTime}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
