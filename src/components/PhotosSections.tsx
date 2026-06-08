import React from 'react';

export function PhotosSections() {
  return (
    <section className="py-24 bg-[#050505] border-y border-white/5">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-8">Photos & Sections</h2>
        <div className="grid gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-4">1 — Spare Parts Availability</h3>
            <p className="text-sm text-white/60 mb-4">Quick visual inventory of spare parts availability.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <img src="https://via.placeholder.com/400x300?text=Spare+Part+1" alt="Spare Part 1" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Spare+Part+2" alt="Spare Part 2" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Spare+Part+3" alt="Spare Part 3" className="w-full h-48 object-cover rounded" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">2 — Workshop Tools</h3>
            <p className="text-sm text-white/60 mb-4">Photos of workshop tools and their status.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <img src="https://via.placeholder.com/400x300?text=Tool+1" alt="Tool 1" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Tool+2" alt="Tool 2" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Tool+3" alt="Tool 3" className="w-full h-48 object-cover rounded" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">3 — Vehicle Fleet</h3>
            <p className="text-sm text-white/60 mb-4">Fleet snapshots and availability overview.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <img src="https://via.placeholder.com/400x300?text=Vehicle+1" alt="Vehicle 1" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Vehicle+2" alt="Vehicle 2" className="w-full h-48 object-cover rounded" />
              <img src="https://via.placeholder.com/400x300?text=Vehicle+3" alt="Vehicle 3" className="w-full h-48 object-cover rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
