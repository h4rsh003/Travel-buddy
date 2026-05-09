export default function StatCard({ icon, value, label, colorClass }: { icon: React.ReactNode, value: number, label: string, colorClass: string }) {
    return (
        <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-travel-text">{value}</p>
                <p className="text-xs text-travel-text-muted uppercase font-semibold">{label}</p>
            </div>
        </div>
    );
}