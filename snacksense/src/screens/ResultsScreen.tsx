// src/screens/ResultsScreen.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { Linking, Alert } from "react-native";
import { Text, Card, Title, Paragraph, Button, Chip } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // <--- Icons
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useTheme } from 'react-native-paper';
import { resetScan } from "../redux/scanSlice";
import { Animated } from 'react-native';

const { width } = Dimensions.get("window");

// --- Helper Components ---

// 1. Circular Progress (Same as before)
const SimpleCircularProgress = ({
  value,
  radius = 50,
  strokeWidth = 10,
  color = "green",
}: any) => {
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + strokeWidth;
  const progress = (value / 100) * circumference;
  const strokeDashoffset = circumference - progress;


  return (
    <View
      style={{
        width: radius * 2 + strokeWidth,
        height: radius * 2 + strokeWidth,
      }}
    >
      <Svg
        width={radius * 2 + strokeWidth}
        height={radius * 2 + strokeWidth}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          {Math.round(value)}
        </Text>
        <Text style={{ fontSize: 10, color: "#666" }}>/ 100</Text>
      </View>
    </View>
  );
};

// 2. Main Screen
export default function ResultsScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { scannedProduct, analysisResult } = useSelector(
    (state: RootState) => state.scan,
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,          
      duration: 800,       
      useNativeDriver: true,
    }).start();
  }, []);

  if (!scannedProduct || !analysisResult) {
    return (
      <View style={styles.center}>
        <Text>No results found.</Text>
        <Button mode="contained" onPress={() => navigation.navigate("Scanner")}>
          Go to Scanner
        </Button>
      </View>
    );
  }

  // Color Logic
  const getScoreColor = (score: number) => {
    if (score >= 70) return "#4caf50"; // Green
    if (score >= 40) return "#ffeb3b"; // Yellow
    return "#f44336"; // Red
  };
  const handleConnectNutritionist = () => {
    const subject = `Consultation Request: ${scannedProduct?.name || "SnackSense Inquiry"}`;
    const body = `Hello Nutritionist,\n\nI just scanned ${scannedProduct?.name} (Health Score: ${analysisResult?.health_score}).\n\nI would like to discuss...`;

    // 'mailto' link automatically opens Gmail/Mail app
    const mailtoUrl = `mailto:nutrition@snacksense.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch((err) =>
      Alert.alert(
        "Error",
        "Could not open email client. Please email us at nutrition@snacksense.com",
      ),
    );
  };

  const scoreColor = getScoreColor(analysisResult.health_score);
  const sustainabilityColor = getScoreColor(
    analysisResult.sustainability_score,
  );
  const hasAllergens = analysisResult.allergens.length > 0;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* --- HEADER --- */}
      <View style={styles.header}>
        {scannedProduct.image_url ? (
          <Image
            source={{ uri: scannedProduct.image_url }}
            style={styles.productImage}
          />
        ) : (
          <View
            style={[
              styles.productImage,
              {
                backgroundColor: "#ddd",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <MaterialCommunityIcons name="food" size={40} color="gray" />
          </View>
        )}
        <Title style={styles.productName}>{scannedProduct.name}</Title>
        <Text style={styles.brandName}>{scannedProduct.brand}</Text>

        {/* Category Badge */}
        <Chip
          style={{ backgroundColor: scoreColor, marginTop: 10 }}
          textStyle={{ color: "white", fontWeight: "bold" }}
        >
          {analysisResult.category.toUpperCase()}
        </Chip>
      </View>

      {/* --- ALLERGEN ALERT (Conditional) --- */}
      {hasAllergens && (
        <View style={styles.allergenContainer}>
          <View style={styles.allergenHeader}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#d32f2f"
            />
            <Text style={styles.allergenTitle}>Allergens Detected</Text>
          </View>
          <Text style={styles.allergenText}>
            {analysisResult.allergens.join(", ")}
          </Text>
        </View>
      )}

      {/* --- HEALTH SCORE CARD --- */}
      <Card style={styles.card}>
        <Card.Content style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Title>Health Score</Title>
            <Paragraph style={{ color: "gray" }}>
              Based on ingredients & nutrition
            </Paragraph>
          </View>
          <SimpleCircularProgress
            value={analysisResult.health_score}
            radius={35}
            color={scoreColor}
          />
        </Card.Content>
      </Card>

      {/* --- SUSTAINABILITY CARD --- */}
      <Card style={styles.card}>
        <Card.Content style={styles.rowBetween}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="leaf"
              size={24}
              color={sustainabilityColor}
              style={{ marginRight: 10 }}
            />
            <View>
              <Title>Sustainability</Title>
              <Text style={{ color: "gray" }}>
                Eco-impact score: {analysisResult.sustainability_score}/100
              </Text>
            </View>
          </View>
          {/* Simple Bar Visual */}
          <View style={styles.sustainBarBg}>
            <View
              style={[
                styles.sustainBarFill,
                {
                  width: `${analysisResult.sustainability_score}%`,
                  backgroundColor: sustainabilityColor,
                },
              ]}
            />
          </View>
        </Card.Content>
      </Card>

      {/* --- NUTRITIONIST VERDICT --- */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ marginBottom: 5 }}>Verict</Title>
          <Paragraph style={{ lineHeight: 22 }}>
            {analysisResult.summary}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* --- HEALTHIER ALTERNATIVES --- */}
      {analysisResult.healthier_alternatives.length > 0 && (
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Title style={{ marginLeft: 20, marginBottom: 10 }}>
            Healthier Alternatives
          </Title>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {analysisResult.healthier_alternatives.map(
              (item: string, index: number) => (
                <Card key={index} style={styles.altCard}>
                  <Card.Content>
                    <MaterialCommunityIcons
                      name="food-apple-outline"
                      size={24}
                      color="green"
                      style={{ marginBottom: 5 }}
                    />
                    <Paragraph style={{ fontWeight: "bold" }}>{item}</Paragraph>
                  </Card.Content>
                </Card>
              ),
            )}
          </ScrollView>
        </View>
      )}
      {/* --- CONNECT TO EXPERT SECTION --- */}
      <Card
        style={[
          styles.card,
          {
            backgroundColor: "#e3f2fd",
            borderColor: "#2196f3",
            borderWidth: 1,
          },
        ]}
      >
        <Card.Content style={{ alignItems: "center" }}>
          <MaterialCommunityIcons
            name="doctor"
            size={40}
            color="#1976d2"
            style={{ marginBottom: 10 }}
          />
          <Title
            style={{ fontSize: 18, color: "#0d47a1", textAlign: "center" }}
          >
            Need Professional Advice?
          </Title>
          <Paragraph
            style={{ textAlign: "center", marginBottom: 15, color: "#546e7a" }}
          >
            AI is great, but sometimes you need a human touch. Book a
            consultation today.
          </Paragraph>
          <Button
            mode="contained"
            onPress={handleConnectNutritionist}
            style={{ backgroundColor: "#1976d2", width: "100%" }}
            icon="email-outline"
          >
            Talk to a Human Nutritionist
          </Button>
        </Card.Content>
      </Card>

      {/* --- ACTION BUTTONS --- */}
      <Button
        mode="contained"
        onPress={() => {
          dispatch(resetScan());
          navigation.navigate("Scanner");
        }}
        style={{ margin: 20, backgroundColor: "#333", borderRadius: 30}}
        icon="camera"
      >
        Scan Another Item
      </Button>
    </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 2,
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: "contain",
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  brandName: { fontSize: 14, color: "gray", marginBottom: 5 },

  // Allergen Styles
  allergenContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#ffebee", // Light red
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef5350",
  },
  allergenHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  allergenTitle: {
    color: "#c62828",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 16,
  },
  allergenText: { color: "#c62828" },

  // Card Styles
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: "white",
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Sustainability Bar
  sustainBarBg: {
    width: 60,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  sustainBarFill: { height: "100%", borderRadius: 4 },

  // Alternatives
  altCard: {
    width: 140,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: "white",
    elevation: 2,
  },
});
