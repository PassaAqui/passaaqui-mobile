import { View, Text } from "react-native";
import { WeeklySale } from "@/src/features/shopkeeper/dashboard/services/dashboardService";

const CHART_HEIGHT = 120;
const Y_AXIS_WIDTH = 28;

const DAY_LABELS: Record<string, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
  Domingo: "Dom",
};

interface WeekChartProps {
  data: WeeklySale[];
}

export function WeekChart({ data }: WeekChartProps) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const ySteps = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));

  return (
    <View className="mx-5 mt-5 bg-[#E7A35A] rounded-2xl p-4">
      <Text className="text-white font-interBold text-xl mb-4">Vendas da semana</Text>
      <View className="bg-white/15 rounded-xl p-3">
        <View style={{ flexDirection: "row", height: CHART_HEIGHT }}>
          <View style={{ width: Y_AXIS_WIDTH, position: "relative" }}>
            {ySteps.map((step, i) => (
              <Text
                key={`${step}-${i}`}
                style={{
                  position: "absolute",
                  top: (i / (ySteps.length - 1)) * CHART_HEIGHT - 6,
                  right: 4,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "_400Regular",
                }}
              >
                {step}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, position: "relative" }}>
            {ySteps.map((step, i) => (
              <View
                key={`${step}-${i}`}
                style={{
                  position: "absolute",
                  top: (i / (ySteps.length - 1)) * CHART_HEIGHT,
                  left: 0, right: 0, height: 1,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              />
            ))}
            <View
              style={{
                flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around",
                position: "absolute", bottom: 0, left: 0, right: 0, height: CHART_HEIGHT,
              }}
            >
              {data.map((sale, index) => {
                const isMax = sale.total === max && max > 0;
                const barH = Math.max(Math.round((sale.total / max) * (CHART_HEIGHT - 14)), 2);
                return (
                  <View key={index} style={{ alignItems: "center", flex: 1 }}>
                    {isMax && (
                      <Text style={{ color: "white", fontSize: 10, fontFamily: "_400Regular", marginBottom: 2 }}>
                        {sale.total}
                      </Text>
                    )}
                    <View
                      style={{
                        width: 18, height: barH, borderTopLeftRadius: 4, borderTopRightRadius: 4,
                        backgroundColor: isMax ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 6, paddingLeft: Y_AXIS_WIDTH }}>
          {data.map((sale) => (
            <Text key={sale.day} style={{ flex: 1, textAlign: "center", color: "white", fontSize: 10, fontFamily: "_400Regular" }}>
              {DAY_LABELS[sale.day] ?? sale.day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}