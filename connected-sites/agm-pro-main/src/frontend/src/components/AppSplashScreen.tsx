const BRAND_LOGO = "/assets/images/bcb-logo.png";

export function AppSplashScreen({
  label = "Preparing AGM workspace",
}: {
  label?: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,18,32,0.88),rgba(13,79,50,0.72))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,205,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(93,170,108,0.18),transparent_26%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-glass">
          <img
            src={BRAND_LOGO}
            alt="Bawjiase Community Bank logo"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-white/72">
          AGM Portal
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">
          Bawjiase Community Bank
        </h1>
        <p className="mt-3 text-sm text-white/76">{label}</p>

        <div className="mt-8 w-full max-w-[14rem] overflow-hidden rounded-full border border-white/20 bg-white/10 p-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="agm-splash-bar h-full w-1/2 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
