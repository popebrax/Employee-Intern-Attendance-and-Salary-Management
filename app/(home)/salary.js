import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import axios from "axios";
import moment from "moment";



const SalarySummary = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());

  const goToNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, "months");
    setCurrentDate(nextMonth);
  };

  const goToPrevMonth = () => {
    const prevMonth = moment(currentDate).subtract(1, "months");
    setCurrentDate(prevMonth);
  };

  const formatDate = (date) => {
    return date.format("MMMM, YYYY");
  };

  const fetchAttendanceReport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/attendance-report-all-employees",
        {
          params: {
            month: currentDate.month() + 1,
            year: currentDate.year(),
          },
        }
      );

      setAttendanceData(response.data.report);
    } catch (error) {
      console.log("Error fetching attendance");
    }
  };

  useEffect(() => {
    fetchAttendanceReport();
  }, [currentDate]);
  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 12,
          marginTop: 20,
          marginBottom: 10
        }}
      >
        <Text>{formatDate(currentDate)}</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <Text>Previous Month</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text>Next Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginHorizontal: 12 }}>
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "black", paddingBottom: 5 }}>
          <Text style={{ flex: 2, fontWeight: "bold", paddingHorizontal: 5 }}>Employee</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Designation (ID)</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Days Present</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Checkins</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Basic Salary</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Full-Day Salary</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Checkin-Only Salary</Text>
          <Text style={{ flex: 1, fontWeight: "bold", paddingHorizontal: 5 }}>Net Salary</Text>
        </View>

        {attendanceData?.map((item, index) => (
          <View key={index} style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "black", paddingTop: 5, paddingBottom: 10 }}>
            <Text style={{ flex: 2, paddingHorizontal: 5 }}>{item?.name}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{item?.designation} ({item?.employeeId})</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{item?.present}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{item?.halfday}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{item?.salary}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{parseFloat(item?.present) * parseFloat(item?.salary)}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{(parseFloat(item?.halfday) * parseFloat(item?.salary)) / 2}</Text>
            <Text style={{ flex: 1, paddingHorizontal: 5 }}>{(parseFloat(item?.present) * parseFloat(item?.salary)) + ((parseFloat(item?.halfday) * parseFloat(item?.salary)) / 2)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SalarySummary;
