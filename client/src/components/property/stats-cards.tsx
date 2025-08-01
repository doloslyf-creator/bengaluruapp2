import { Building, TrendingUp, Tag, IndianRupee } from "lucide-react";
import { type PropertyStats } from "@shared/schema";

interface StatsCardsProps {
  stats: PropertyStats | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border-0 shadow-lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-3"></div>
              <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Properties",
      value: stats.totalProperties.toString(),
      icon: Building,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-100",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100",
    },
    {
      title: "RERA Approved",
      value: stats.reraApproved.toString(),
      icon: Tag,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-100",
    },
    {
      title: "Avg. Price",
      value: stats.avgPrice ? `₹${(stats.avgPrice / 100).toFixed(1)} Cr` : "₹0 Cr",
      icon: IndianRupee,
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.title} className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-700 tracking-wide">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-lg flex items-center justify-center shadow-md`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
