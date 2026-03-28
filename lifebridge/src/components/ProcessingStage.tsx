'use client';

export function ProcessingStage() {
  return (
    <div className="flex items-center justify-center py-20 min-h-[40vh] w-full">
      <div className="flex flex-col items-center gap-8 relative w-full max-w-2xl">
        
        {/* Glow behind the visualization */}
        <div className="absolute inset-0 bg-seafoam/5 blur-3xl rounded-full w-full h-full -z-10 animate-pulse-glow" />

        <div className="flex items-center justify-between w-full relative">
          
          {/* Left Side: Chaos */}
          <div className="flex gap-2 p-6 bg-navy/[0.03] backdrop-blur-sm rounded-3xl border border-navy/5 shadow-inner">
            <div className="w-4 h-4 bg-amber/40 rounded animate-bounce delay-75 blur-[1px]"></div>
            <div className="w-6 h-6 bg-navy/20 rounded-full animate-bounce delay-150 blur-[2px]"></div>
            <div className="w-3 h-8 bg-seafoam/30 rounded-sm animate-bounce delay-300 blur-[1px] transform rotate-12"></div>
            <div className="w-5 h-5 bg-amber/20 rounded-lg animate-bounce delay-100 blur-[3px]"></div>
          </div>

          {/* Center Bridge (Connecting Path) */}
          <div className="flex-1 h-[2px] mx-8 bg-gradient-to-r from-navy/5 via-seafoam to-navy/10 relative">
             <div className="absolute inset-y-0 left-0 w-full animate-connect bg-gradient-to-r from-transparent via-seafoam to-seafoam shadow-[0_0_15px_rgba(78,205,196,1)] z-10"></div>
          </div>

          {/* Right Side: Order */}
          <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-seafoam/20 shadow-lg relative min-w-[120px] h-[80px] flex items-center justify-center">
             <div className="w-3/4 h-2 bg-seafoam/20 rounded-full mb-3 absolute top-6"></div>
             <div className="w-1/2 h-2 bg-navy/10 rounded-full absolute bottom-6"></div>
             <div className="w-2 h-2 bg-seafoam rounded-full absolute right-4 top-4 shadow-[0_0_10px_rgba(78,205,196,0.8)]"></div>
          </div>
        </div>

        <p className="text-navy/50 font-heading tracking-wide animate-pulse">
           structuring chaotic input...
        </p>

        {/* Screen Reader Announcement */}
        <div className="sr-only" aria-live="polite">
          LifeBridge is currently processing your input and generating structured actions. Please wait.
        </div>
      </div>
    </div>
  );
}
