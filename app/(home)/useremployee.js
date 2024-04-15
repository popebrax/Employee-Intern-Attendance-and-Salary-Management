import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";

const useremployee = () => {
  const params = useLocalSearchParams();
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [currentDate, setCurrentDate] = useState(moment());
  const [qrCodeData, setQRCodeData] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
 
  useEffect(() => {
    generateQRCode();
  }, [attendanceStatus, attendanceRecord]);

  const generateQRCode = async () => {
    try {
      if (attendanceStatus === "present" && attendanceRecord?.checkinTime) {
        const qrCodeData = JSON.stringify({
          employeeId: params?.id,
          employeeName: params?.name || "Unknown", // Use "Unknown" if name is not provided
          date: currentDate.format("MMMM D, YYYY"),
          action: "checkin",
          uniqueKey: currentDate.format("YYYY-MM-DD") + "_checkin",
        });
        setQRCodeData(qrCodeData);
      } else if (attendanceStatus === "absent" && attendanceRecord?.checkoutTime) {
        const qrCodeData = JSON.stringify({
          employeeId: params?.id,
          employeeName: params?.name || "Unknown", // Use "Unknown" if name is not provided
          date: currentDate.format("MMMM D, YYYY"),
          action: "checkout",
          uniqueKey: currentDate.format("YYYY-MM-DD") + "_checkout",
        });
        setQRCodeData(qrCodeData);
      } else {
        setQRCodeData(null);
      }
    } catch (error) {
      console.log("error generating QR code", error);
    }
  };

  const goToNextDay = () => {
    const today = moment();
    const nextDate = moment(currentDate).add(1, "days");
  
    // Disable navigation if attempting to navigate to future dates
    if (nextDate.isAfter(today, "day")) {
      return;
    }
  
    setCurrentDate(nextDate);
  };

  const goToPrevDay = () => {
    // Disable navigation to previous dates
    return;
  };

  const formatDate = (date) => {
    return date.format("MMMM D, YYYY");
  };

  const submitAttendance = async (action) => {
    try {
      const attendanceData = {
        employeeId: params?.id,
        employeeName: params?.name,
        date: currentDate.format("MMMM D, YYYY"),
      };
  
      let response;
      if (action === "checkin") {
        response = await axios.post(
          "http://localhost:8000/attendance/checkin",
          attendanceData
        );
        setAttendanceStatus("present");
        setAttendanceRecord(response.data);
      } else if (action === "checkout") {
        response = await axios.post(
          "http://localhost:8000/attendance/checkout",
          attendanceData
        );
        setAttendanceStatus("absent");
        setAttendanceRecord(response.data);
      }
  
      if (response.status === 200) {
        Alert.alert(`Attendance ${action} successful for ${params?.name}`);
      }
      setRefreshing(true);

      // Delay navigation back to markemployee.js by 2 seconds
      setTimeout(() => {
        setRefreshing(false);
        router.push("/markemployee");
      }, 5000);
    } catch (error) {
      console.log(`error ${action} attendance`, error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateNavigation}>
        
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        
      </View>

      <Pressable style={styles.employeeInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(params?.name || "Unknown").charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.employeeName}>
            {params?.name || "Unknown"}
          </Text>
          <Text style={styles.designation}>
            {params?.designation || "Unknown"} ({params?.id})
          </Text>
        </View>
      </Pressable>

     

      <View style={styles.attendanceSection}>
        <Text style={styles.attendanceHeader}></Text>
        <View style={styles.qrCodeContainer}>
          {qrCodeData && (
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrCodeData}
                size={160}
                color="#4b6cb7"
                backgroundColor="white"
              />
              <Text style={styles.qrCodeLabel}>Scan to mark attendance</Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => submitAttendance("checkin")} style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Check-in</Text>
        </Pressable>

        <Pressable onPress={() => submitAttendance("checkout")} style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Check-out</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default useremployee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4b6cb7",
  },
  employeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4b6cb7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  designation: {
    marginTop: 5,
    color: "gray",
  },
  basicPay: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 7,
  },
  attendanceSection: {
    marginBottom: 30,
  },
  attendanceHeader: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 1,
    marginTop: 7,
    marginBottom: 10,
    color: "#4b6cb7",
  },
  qrCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  qrCodeWrapper: {
    alignItems: "center",
  },
  qrCodeLabel: {
    marginTop: 10,
    color: "#4b6cb7",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#4b6cb7",
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  generateButton: {
    padding: 15,
    backgroundColor: "#4b6cb7",
    width: 200,
    alignSelf: "center",
    borderRadius: 6,
    marginBottom: 20, // Add this line to increase the spacing between buttons
  },
  generateButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "500",
  },
});
