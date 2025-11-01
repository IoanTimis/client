export default function FeatureCard({ title, description, icon: Icon, className = "" }) {
  return (
    <div className={["rounded-lg border bg-white border-gray-300 backdrop-blur-sm p-5", className].join(" ")}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="mt-1 h-9 w-9 inline-flex items-center justify-center rounded-md text-black">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
}
