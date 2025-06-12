import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F6EF] flex flex-col items-center justify-center px-6 py-12">
      <header className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex-1 flex flex-col gap-6 items-start">
          <span className="inline-flex items-center gap-2 px-4 py-1 bg-white rounded-full shadow text-sm font-medium text-gray-700 mb-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FF6A00" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tasty Living
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-xl">Deliciously Curated Foods for Every Diet and Lifestyle</h1>
          <p className="text-lg text-gray-600 max-w-lg">Choose meals that suit your health needs, dietary preferences, and allergy concerns making everyday eating simple.</p>
          <a href="#" className="inline-flex items-center gap-2 px-7 py-3 bg-[#FFB800] hover:bg-[#FF6A00] text-white font-bold rounded-full text-lg shadow transition-colors">
            Order Now
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image src="https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg" alt="Burger" width={400} height={400} className="rounded-full shadow-2xl border-8 border-[#FFF3E6] object-cover" />
        </div>
      </header>
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <Image src="https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" alt="Fresh Bite" width={120} height={120} className="rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold mb-1">Fresh Bite Co.</h3>
          <p className="text-gray-500 text-sm mb-2">Fresh flavors, fast, always satisfying.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <Image src="https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" alt="Tasty Table" width={120} height={120} className="rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold mb-1">Tasty Table Co.</h3>
          <p className="text-gray-500 text-sm mb-2">Tasty flavors for every craving.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <Image src="https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" alt="Flavor Feast" width={120} height={120} className="rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold mb-1">Flavor Feast Co.</h3>
          <p className="text-gray-500 text-sm mb-2">Savor bold flavors, crafted with care.</p>
        </div>
      </section>
      <section className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <Image src="https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" alt="Coconut Bliss" width={400} height={200} className="object-cover w-full h-48" />
            <div className="p-6 flex flex-col gap-2">
              <span className="text-lg font-semibold text-gray-900">Coconut Bliss</span>
              <span className="text-[#FF6A00] font-bold text-lg">$5.50</span>
              <button className="mt-2 ml-auto bg-[#FFB800] hover:bg-[#FF6A00] text-white rounded-full p-2 transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <Image src="https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" alt="Pumpkin Chili" width={400} height={200} className="object-cover w-full h-48" />
            <div className="p-6 flex flex-col gap-2">
              <span className="text-lg font-semibold text-gray-900">Pumpkin Chili</span>
              <span className="text-[#FF6A00] font-bold text-lg">$7.50</span>
              <button className="mt-2 ml-auto bg-[#FFB800] hover:bg-[#FF6A00] text-white rounded-full p-2 transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#FF6A00] hover:bg-[#FFF3E6] transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-[#FFB800] hover:bg-[#FF6A00] flex items-center justify-center text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </section>
    </div>
  );
}
