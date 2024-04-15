const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment");

const app = express();
const port = 8000;
host = '192.168.43.99';//'192.168.43.99'; 
const cors = require("cors");
app.use(cors());
const cron = require("node-cron");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//.connect("mongodb://localhost:27017", { 
mongoose.connect("mongodb+srv://popebraxton6:popebraxton6@esmsexpo-copy.zh78voe.mongodb.net/", {
    
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });

app.listen(port, () => {
  console.log("Server is running on port", port);
  console.log("Server is running on host", host);
});

const Employee = require("./models/employee");
const Attendance = require("./models/attendance");

//endpoint to register a employee
app.post("/addEmployee", async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
      email,
    } = req.body;

    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee with this code already exists" });
    }

    //create a new Employee
    const newEmployee = new Employee({
      employeeName,
      employeeId,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
      email,
    });

    await newEmployee.save();

    res.status(201).json({ message: "Employee saved successfully", employee: newEmployee });
  } catch (error) {
    console.log("Error creating employee", error,);
    res.status(500).json({ message: "Failed to add an employee" });
  }
});

//endpoint to fetch all the employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve the employees" });
  }
});

app.post("/attendance/checkin", async (req, res) => {
  try {
    const { employeeId, employeeName, date } = req.body;
    const currentTime = moment().format("HH:mm:ss"); // Get the current time

    const existingAttendance = await Attendance.findOne({ employeeId, date });

    if (existingAttendance) {
      // If attendance already exists, update the check-in time
      existingAttendance.checkinTime = currentTime;
      await existingAttendance.save();
      res.status(200).json(existingAttendance);
    } else {
      // Create a new attendance record with the check-in time
      const newAttendance = new Attendance({
        employeeId,
        employeeName,
        date,
        checkinTime: currentTime,
        status: "halfday", // Set status as halfday when checking in
      });
      await newAttendance.save();
      res.status(200).json(newAttendance);
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking in" });
  }
});

app.post("/attendance/checkout", async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const currentTime = moment().format("HH:mm:ss"); // Get the current time
    const minWorkingHours = 1; // Set the minimum working hours

    const existingAttendance = await Attendance.findOne({ employeeId, date });

    if (existingAttendance) {
      const checkinTime = moment(`${existingAttendance.date} ${existingAttendance.checkinTime}`, "MMMM D, YYYY HH:mm:ss");
      const checkoutTime = moment(`${existingAttendance.date} ${currentTime}`, "MMMM D, YYYY HH:mm:ss");
      const duration = moment.duration(checkoutTime.diff(checkinTime));
      const durationHours = duration.asHours();

      // Set the attendance status based on the duration
      if (durationHours >= minWorkingHours) {
        existingAttendance.status = "present";
      }
      // Update the check-out time for the existing attendance record
      existingAttendance.checkoutTime = currentTime;
      await existingAttendance.save();
      res.status(200).json(existingAttendance);
    } else {
      res.status(404).json({ message: "No attendance record found for check-out" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking out" });
  }
});

app.get("/attendance/:employeeId?", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    // Find attendance records for the specified date
    let attendanceData;
    if (employeeId) {
      attendanceData = await Attendance.findOne({ employeeId, date: date });
    } else {
      attendanceData = await Attendance.find({ date: date });
    }

    if (attendanceData) {
      res.status(200).json(attendanceData);
    } else {
      res.status(404).json({ message: "No attendance record found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance data" });
  }
});
cron.schedule('59 23 * * *', async () => {
  try {
    const today = moment().startOf('day');
    const tomorrow = moment(today).add(1, 'days');

    // Find attendance records for today that don't have a check-in or check-out time
    const incompleteRecords = await Attendance.find({
      date: { $gte: today.format('MMMM D, YYYY'), $lt: tomorrow.format('MMMM D, YYYY') },
      $or: [
        { checkinTime: { $exists: false } },
        { checkoutTime: { $exists: false } },
      ],
    });

    // Update the status of incomplete records to 'absent'
    await Attendance.updateMany(
      { _id: { $in: incompleteRecords.map(record => record._id) } },
      { $set: { status: 'absent' } }
    );

    console.log('Incomplete attendance records marked as absent');
  } catch (error) {
    console.error('Error marking incomplete attendance records:', error);
  }
}, {
  scheduled: true,
  timezone: 'Africa/Nairobi', // Set the appropriate timezone
});
app.get("/attendance-report-all-employees", async (req, res) => {
  try {
    const { month, year, date } = req.query;

    // If date is provided, generate report for that specific date
    // Otherwise, generate report for the entire month
    let matchQuery = {};
    if (date) {
      matchQuery = {
        date: moment(date).startOf("day").toDate(),
      };
    } else {
      matchQuery = {
        date: {
          $gte: moment(`${year}-${month}-01`).startOf("month").toDate(),
          $lte: moment(`${year}-${month}-01`).endOf("month").toDate(),
        },
      };
    }

    // Aggregate attendance data for all employees and date range
    const report = await Attendance.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: "$date" } } },
                  parseInt(req.query.month),
                ],
              },
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: "$date" } } },
                  parseInt(req.query.year),
                ],
              },
              {
                $cond: {
                  if: { $ifNull: [req.query.date, false] }, // Check if date is provided
                  then: {
                    $eq: [
                      { $dayOfMonth: { $dateFromString: { dateString: "$date" } } },
                      parseInt(req.query.date),
                    ],
                  },
                  else: true, // If date is not provided, skip date filtering
                },
              },
            ],
          },
        },
      },
      

      {
        $group: {
          _id: "$employeeId",
          present: {
            $sum: {
              $cond: { if: { $eq: ["$status", "present"] }, then: 1, else: 0 },
            },
          },
          absent: {
            $sum: {
              $cond: { if: { $eq: ["$status", "absent"] }, then: 1, else: 0 },
            },
          },
          halfday: {
            $sum: {
              $cond: { if: { $eq: ["$status", "halfday"] }, then: 1, else: 0 },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees", // Name of the employee collection
          localField: "_id",
          foreignField: "employeeId",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails", // Unwind the employeeDetails array
      },
      {
        $project: {
          _id: 1,
          present: 1,
          absent: 1,
          halfday: 1,
          name: "$employeeDetails.employeeName",
          designation: "$employeeDetails.designation",
          salary: "$employeeDetails.salary",
          employeeId: "$employeeDetails.employeeId",
        },
      },
    ]);

    res.status(200).json({ report });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ message: "Error generating the report" });
  }
});