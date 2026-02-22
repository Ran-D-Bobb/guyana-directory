export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[hsl(var(--border))]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-[hsl(var(--muted-foreground))]">or</span>
      </div>
    </div>
  )
}
