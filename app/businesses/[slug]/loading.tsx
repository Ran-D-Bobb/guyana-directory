export default function BusinessPageLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
      {/* Hero Skeleton */}
      <div className="relative h-[55vh] md:h-[60vh] min-h-[400px] md:min-h-[450px] max-h-[600px] bg-[hsl(var(--jungle-100))] animate-pulse" />

      {/* Main Content */}
      <div className="relative z-20 -mt-6 lg:-mt-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Mobile Quick Actions Skeleton */}
              <div className="lg:hidden bg-white/80 rounded-2xl p-4 shadow-sm border border-white/60">
                <div className="flex items-center justify-center gap-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-100))] animate-pulse" />
                      <div className="w-8 h-2 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* About Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]/60 p-6 lg:p-8">
                <div className="w-24 h-8 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-5" />
                <div className="space-y-3">
                  <div className="w-full h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                  <div className="w-full h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                  <div className="w-3/4 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                </div>
                <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]/60">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--jungle-100))] animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="w-16 h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                      <div className="w-48 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]/60 p-6 lg:p-8">
                <div className="w-28 h-8 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-5" />
                <div className="w-full h-48 rounded-2xl bg-[hsl(var(--jungle-100))] animate-pulse" />
              </div>

              {/* Reviews Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]/60 p-6 lg:p-8">
                <div className="w-28 h-8 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-6" />

                {/* Ratings Breakdown Skeleton */}
                <div className="bg-[hsl(var(--jungle-50))] rounded-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center md:w-1/3">
                      <div className="w-20 h-14 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-2" />
                      <div className="w-32 h-5 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-2" />
                      <div className="w-24 h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                          <div className="flex-1 h-3 rounded-full bg-[hsl(var(--jungle-100))] animate-pulse" />
                          <div className="w-8 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Items Skeleton */}
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b border-[hsl(var(--border))] pb-6 last:border-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[hsl(var(--jungle-100))] animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="w-32 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                          <div className="w-24 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2 ml-15">
                        <div className="w-full h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                        <div className="w-2/3 h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Skeleton */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-5">

                {/* Primary Action Card Skeleton */}
                <div className="rounded-2xl bg-[hsl(var(--jungle-800))] p-6">
                  <div className="w-24 h-3 rounded bg-[hsl(var(--jungle-600))] animate-pulse mb-2" />
                  <div className="w-40 h-6 rounded bg-[hsl(var(--jungle-600))] animate-pulse mb-5" />
                  <div className="w-full h-12 rounded-xl bg-[hsl(var(--jungle-600))] animate-pulse mb-2.5" />
                  <div className="w-full h-11 rounded-xl bg-[hsl(var(--jungle-700))] animate-pulse" />
                </div>

                {/* Contact Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]/60 p-5">
                  <div className="w-36 h-4 rounded bg-[hsl(var(--jungle-100))] animate-pulse mb-4" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--jungle-100))] animate-pulse" />
                        <div className="space-y-1.5 flex-1">
                          <div className="w-12 h-2 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                          <div className="w-28 h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save & Share Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]/60 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-10 rounded-xl bg-[hsl(var(--jungle-100))] animate-pulse" />
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--jungle-100))] animate-pulse" />
                  </div>
                  <div className="w-48 h-3 rounded bg-[hsl(var(--jungle-100))] animate-pulse mx-auto" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-28 lg:h-16" />
    </div>
  )
}
