import React, { useState } from 'react';

export default function SimplotCategory({ name, items, defaultOpen = false, favoritesHook }) {
  const [open, setOpen] = useState(!!defaultOpen);
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-900/60">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left dark:bg-gray-800/60 dark:hover:bg-gray-800"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{items.length} item{items.length === 1 ? '' : 's'}</div>
        </div>
        <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No items.</p>
          ) : (
            (() => {
              // Normalize and stably sort: items with descriptions first
              const normalized = items.map((it, idx) => {
                const label = typeof it === 'string' ? it : (it?.label || '');
                const description = typeof it === 'object' ? (it?.description || '') : '';
                const tags = typeof it === 'object' && Array.isArray(it?.tags) ? it.tags : [];
                const tagAlts = typeof it === 'object' && Array.isArray(it?.tagAlts) ? it.tagAlts : [];
                const notes = typeof it === 'object' && Array.isArray(it?.notes) ? it.notes : [];
                const id = typeof it === 'object' ? (it?.id || '') : '';
                return { label, description, tags, tagAlts, notes, id, _i: idx };
              });
              const withDesc = normalized.filter(x => String(x.description || '').trim());
              const withoutDesc = normalized.filter(x => !String(x.description || '').trim());
              const itemsSorted = withDesc.concat(withoutDesc);
              return itemsSorted.map((it, idx) => {
                const isFavorited = favoritesHook?.isFavorited?.(it) || false;
                const itemData = {
                  id: it.id || `${name}-${it.label}-${it._i}`,
                  label: it.label,
                  description: it.description,
                  tags: it.tags,
                  category: name
                };

                return (
                  <React.Fragment key={name + it.label + it._i}>
                    <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900/60">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{it.label}</div>
                          {it.description && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                          )}
                          {it.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {it.tags.map((t, tagIdx) => {
                                const s = String(t || '');
                                const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                const alt = it.tagAlts[tagIdx] || '';
                                return (
                                  <span 
                                    key={short + s + tagIdx} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    title={alt}
                                  >
                                    {short}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {favoritesHook && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              favoritesHook.toggleFavorite(itemData);
                            }}
                            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                              isFavorited 
                                ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' 
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()
          )}
        </div>
      )}
    </div>
  );
}
