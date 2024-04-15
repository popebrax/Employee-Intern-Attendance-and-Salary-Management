import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import moment from "moment";

const Summary2 = () => {
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState("date");

  const fetchAttendanceReport = async (date) => {
    try {
      const year = moment(date).format("YYYY");
      const month = moment(date).format("MM");
      const day = moment(date).format("DD");
      const response = await axios.get(
        `http://localhost:8000/attendance-report-all-employees?year=${year}&month=${month}&date=${day}`
      );
      setAttendanceReport(response.data.report);
    } catch (error) {
      console.log("Error fetching attendance report", error);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (pickerMode === "date") {
      setSelectedDate(date || selectedDate);
      fetchAttendanceReport(date || selectedDate);
    } else if (pickerMode === "month") {
      setSelectedDate(date || selectedDate);
      setPickerMode("year");
    } else if (pickerMode === "year") {
      setSelectedDate(date || selectedDate);
      fetchAttendanceReport(date || selectedDate);
      setPickerMode("date");
    }
  };

  const showDatepicker = (mode) => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.pickerContainer}
        onPress={() => showDatepicker("date")}
      >
        <Text style={styles.pickerText}>
          {moment(selectedDate).format("MMMM D, YYYY")}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode={pickerMode}
          display="default"
          onChange={handleDateChange}
        />
      )}

      <FlatList
        data={attendanceReport}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.designation}>{item.designation}</Text>
            <Text style={styles.salary}>Salary: {item.salary}</Text>
            <View style={styles.attendanceDetails}>
              <Text style={styles.attendanceLabel}>Present: {item.present}</Text>
              <Text style={styles.attendanceLabel}>Absent: {item.absent}</Text>
              <Text style={styles.attendanceLabel}>Checkins: {item.halfday}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  pickerContainer: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reportItem: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  designation: {
    fontSize: 16,
    color: "#666",
  },
  salary: {
    fontSize: 16,
    marginTop: 4,
  },
  attendanceDetails: {
    marginTop: 8,
  },
  attendanceLabel: {
    fontSize: 14,
    color: "#666",
  },
});

export default Summary2;
