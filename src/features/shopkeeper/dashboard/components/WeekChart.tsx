import { View, Text } from "react-native";

const CHART_DATA = [45, 38, 52, 40, 66, 92, 72];
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CHART_MAX = Math.max(...CHART_DATA);
const CHART_HEIGHT = 120;
const Y_AXIS_WIDTH = 28;
const Y_STEPS = [80, 60, 40, 20, 0];

export function WeekChart() {
  return (
    <View className="mx-5 mt-5 bg-[#E7A35A] rounded-2xl p-4">
      <Text className="text-white font-interBold text-xl mb-4">Vendas da semana</Text>
      <View className="bg-white/15 rounded-xl p-3">
        <View style={{ flexDirection: "row", height: CHART_HEIGHT }}>
          <View style={{ width: Y_AXIS_WIDTH, position: "relative" }}>
            {Y_STEPS.map((step, i) => (
              <Text
                key={step}
                style={{
                  position: "absolute",
                  top: (i / (Y_STEPS.length - 1)) * CHART_HEIGHT - 6,
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
            {Y_STEPS.map((step, i) => (
              <View
                key={step}
                style={{
                  position: "absolute",
                  top: (i / (Y_STEPS.length - 1)) * CHART_HEIGHT,
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
              {CHART_DATA.map((value, index) => {
                const isMax = value === CHART_MAX;
                const barH = Math.round((value / CHART_MAX) * (CHART_HEIGHT - 14));
                return (
                  <View key={index} style={{ alignItems: "center", flex: 1 }}>
                    {isMax && (
                      <Text style={{ color: "white", fontSize: 10, fontFamily: "_400Regular", marginBottom: 2 }}>
                        {value}
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
          {WEEK_DAYS.map((day) => (
            <Text key={day} style={{ flex: 1, textAlign: "center", color: "white", fontSize: 10, fontFamily: "_400Regular" }}>
              {day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}