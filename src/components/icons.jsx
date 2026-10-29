const S = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Mark = () => (
  <svg className="mark" width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M25 9a12 12 0 0 0 0 22 11 11 0 1 1 0-22Z" fill="currentColor" opacity="0.9" />
  </svg>
)
export const Cart = () => (<svg {...S} aria-hidden="true"><path d="M5 7h15l-1.3 10.5a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 7Z" /><path d="M9 7V5.5a3 3 0 0 1 6 0V7" /></svg>)
export const Menu = () => (<svg {...S} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>)
export const Close = () => (<svg {...S} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const Search = () => (<svg {...S} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>)
export const Plus = () => (<svg {...S} width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>)
export const Minus = () => (<svg {...S} width="18" height="18" aria-hidden="true"><path d="M5 12h14" /></svg>)
export const Wa = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.5 23.5l1.65-6a11.4 11.4 0 1 1 4.3 4.22L.5 23.5ZM6.8 19.9l.37.22a9.47 9.47 0 1 0-3.2-3.13l.24.38-.98 3.56 3.57-1.03ZM17.4 14.4c-.23-.12-1.37-.68-1.58-.76-.21-.08-.37-.12-.52.12-.15.23-.6.76-.73.92-.14.15-.27.17-.5.06-.23-.12-.98-.36-1.86-1.15-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.36.1-.47.1-.1.23-.27.35-.4.11-.14.15-.23.23-.39.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.71-1.72-.19-.45-.38-.39-.52-.4h-.44c-.15 0-.4.06-.6.29-.21.23-.8.78-.8 1.9 0 1.12.82 2.21.93 2.36.12.15 1.6 2.45 3.88 3.44.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.06 1.33-.54 1.52-1.07.19-.52.19-.97.13-1.07-.05-.1-.2-.15-.43-.27Z" /></svg>)
export const ChevRight = () => (<svg {...S} width="16" height="16" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>)
