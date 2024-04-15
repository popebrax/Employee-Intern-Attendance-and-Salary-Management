import { Pressable, StyleSheet, Text, View, ScrollView, TextInput, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Feather, Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

const markemployee = () => {
  const buttonPressHandler = (route) => {
    router.push(route);
  }; 
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/employees");
        setEmployees(response.data);
      } catch (error) {
        console.log("error fetching employee data", error);
      }
    };
    fetchEmployeeData();
  }, []);

  const handleEmployeeIdSubmit = () => {
    const employee = employees.find((emp) => emp.employeeId === employeeId);
    if (employee) {
      router.push({
        pathname: "/useremployee",
        params: {
          id: employee.employeeId,
          name: employee.employeeName,
          designation: employee.designation,
          salary: employee.salary,
        },
      });
    } else {
      Alert.alert("Invalid Employee ID", "Please enter a valid Employee ID.");
    }
  };


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View style={styles.header}>
        <Pressable onPress={() => buttonPressHandler("/(home)/index1")}>
          <Feather name="bar-chart" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTex}>Employee/Intern Checkin Checkout</Text>
        <Entypo name="lock" size={24} color="black" />
      </View>
      

      <View style={styles.inputContainer}>
      <View style={styles.buttonsContainer}>
      <Text style={styles.headerText}>Please Enter EmployeeID</Text>
      </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          onSubmitEditing={handleEmployeeIdSubmit}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTex:{
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    justifyContent: "space-between",
    margin: 20,
    marginHorizontal: 50,
    marginVertical: 80,
  },
  input: {
    height: 40,
    borderColor: "black",
    borderWidth: 1,
    paddingHorizontal: 80,
  },
});

export default markemployee;
