const express = require("express");
const session = require('express-session');
const cors = require("cors");
const port = 3000;
const path = require("path");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dbConnection = require("./db");
const upload = require("./uploadConfig.js")
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));


app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/mainpage", "login.html"));
});
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/dashboard-history", "dashboard.html"));
});
app.get("/dashboardstaff", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/staff", "dashboardstaff.html"));
});
app.get("/detail", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "detail.html"));
});
app.get("/confirm", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "confirm.html"));
});

app.get("/profile", (req, res) => {

    res.sendFile(path.join(__dirname, "/views/users", "profile.html"));
});
app.get("/detailstaff", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/staff", "detailstaff.html"));
});
app.get("/edit", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/staff", "edit.html"));
});

app.get("/homestaff", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/staff", "homestaff.html"));
});
app.get("/history", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "history.html"));
});

app.get("/listlender", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/lender", "listlender.html"));
});

app.use(session({
    secret: 's0/\/\P4$$w0rD',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 5 * 60 * 1000, // Session timeout set to 30 minutes (in milliseconds)
    },
}));

// Middleware สำหรับตรวจสอบสถานะการเข้าสู่ระบบ
function requireLogin(req, res, next) {
    // ตรวจสอบว่ามี session ที่มีข้อมูลของผู้ใช้หรือไม่
    if (req.session && req.session.user) {
        // ถ้าผู้ใช้เข้าสู่ระบบแล้ว ไปต่อไป
        return next();
    } else {
        // ถ้าไม่ได้เข้าสู่ระบบ ให้เปลี่ยนทางไปที่หน้า login
        return res.redirect('/');
    }
}

app.post('/uploading', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send("Upload failde");
        } else {
            res.send("Upload is successfully")
        }
    })
});

app.get("/user", async (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).send("No user info");
    }
});

app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    try {
        dbConnection.query(
            "SELECT motorcycle_name, motorcycle_status, motorcycle_detail, motorcycle_traffic, motorcycle_insurance FROM motorcycles WHERE motorcycle_id = ?",
            [id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (result && result.length > 0) {
                    res.status(200).json(result);
                } else {
                    // ไม่พบข้อมูลหรือไม่ถูกต้อง
                    return res.status(404).send();
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


app.put("/edit/:id", upload, async (req, res) => {
    const id = req.params.id;
    const { motorcycle_name, motorcycle_detail, motorcycle_status, motorcycle_insurance, motorcycle_traffic } = req.body;
    const motorcycle_image = req.file.filename; // ใช้ชื่อไฟล์ที่อัปโหลดมา

    try {
        dbConnection.query(
            "UPDATE motorcycles SET motorcycle_name = ?, motorcycle_detail = ?, motorcycle_status = ?, motorcycle_insurance = ?, motorcycle_traffic = ?, motorcycle_image = ? WHERE motorcycle_id = ?",
            [motorcycle_name, motorcycle_detail, motorcycle_status, motorcycle_insurance, motorcycle_traffic, motorcycle_image, id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ redirect: "/homestaff", message: "Product update successfully!" });
            }
        );
    } catch (err) {
        console.log("Product update failed");
        return res.status(500).send();
    }
});




app.post("/add", upload, async (req, res) => {
    const { motorcycle_name, motorcycle_detail, motorcycle_status, motorcycle_insurance, motorcycle_traffic } = req.body;
    const filetoupload = req.file.filename;

    try {
        dbConnection.query(
            "INSERT INTO motorcycles (motorcycle_name, motorcycle_detail, motorcycle_image, motorcycle_status, motorcycle_insurance, motorcycle_traffic) VALUES (?, ?, ?, ?, ?, ?)",
            [
                motorcycle_name,
                motorcycle_detail,
                filetoupload,
                motorcycle_status,
                motorcycle_insurance,
                motorcycle_traffic
            ],
            (err, result, fields) => {
                if (err) {
                    console.log("Error inserting into 'motorcycles'", err);
                    return res.status(400).json({ message: "Post product failed" });
                }

                return res.status(200).json({ message: "Post product successfully!" });
            }
        );
    } catch (error) {
        console.error('Error in route handler:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// staff role
app.get("/homestaff/:email", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/staff", "homestaff.html"));
});
app.get("/historyadmin", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/dashboard-history", "history.html"));
});

// lender
// app.get("/listlender/:email", (req, res) => {
//     res.sendFile(path.join(__dirname, "/views/lender", "listlender.html"));
// });



//COUNT
app.get("/count", (req, res) => {
    try {
        const userQuery = "SELECT id FROM users";
        const borrowingQuery = "SELECT motorcycle_status FROM motorcycles";

        dbConnection.query(userQuery, (errUser, resultUser) => {
            if (errUser) {
                console.log(errUser);
                return res.status(500).send();
            }

            dbConnection.query(borrowingQuery, (errBorrowing, resultBorrowing) => {
                if (errBorrowing) {
                    console.log(errBorrowing);
                    return res.status(500).send();
                }

                const responseData = {
                    users: resultUser,
                    borrowingStatus: resultBorrowing
                };

                res.status(200).json(responseData);
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});
// END COUNT


// app.get("/confirm/:motorcycle_id", async (req, res) => {
//     const motorcycle_id = req.params.motorcycle_id;
//     try {
//         dbConnection.query(
//             "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail, motorcycle_insurance, motorcycle_traffic FROM motorcycles WHERE motorcycle_id = ?",
//             [motorcycle_id],
//             (err, result, fields) => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(400).send();
//                 }

//                 if (result.length === 0) {
//                     return res.status(404).json({ error: "Motorcycle not found" });
//                 }

//                 res.status(200).json(result);

//                 // Assuming you want to send the HTML file only if the query is successful
//                 const filePath = path.join(__dirname, "/views/users", "confirm.html");
//                 res.sendFile(filePath);
//             }
//         );

//     } catch (err) {
//         console.log(err);
//         return res.status(500).send();
//     }
// });


app.get("/products", function (_req, res) {
    const sql = "SELECT motorcycle_id, motorcycle_name, motorcycle_image FROM motorcycles";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

app.get("/main", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT motorcycle_id, motorcycle_name, motorcycle_image FROM motorcycles",
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                // res.status(200).json(result);
                const filePath = path.join(__dirname, "/views/mainpage", "main.html");
                res.sendFile(filePath);
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


// Register
app.post('/register', jsonParser, async (req, res) => {
    const {
        firstname,
        lastname,
        username,
        email,
        password,
        phone,
        address,
        gender,
    } = req.body;

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database
        dbConnection.query(
            'INSERT INTO users(firstname, lastname, username, email, password, phone, address, gender, urole) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                firstname,
                lastname,
                username,
                email,
                hashedPassword, // ใช้พาสเวิร์ดที่ถูกแฮชแล้ว
                phone,
                address,
                gender,
                'user',
            ],
            (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }
                res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
            }
        );
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await new Promise((resolve, reject) => {
            dbConnection.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0 ? result[0] : null);
                    }
                }
            );
        });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const token = jwt.sign({ email, urole: user.urole }, "Myadminweb", {
                    expiresIn: "1h",
                });

                // ตั้งค่า session หลังจาก login
                req.session.user = { email, id: user.id, urole: user.urole, username: user.username };

                // ตรวจสอบ urole เพื่อเปลี่ยนเส้นทาง
                switch (user.urole) {
                    case "staff":
                        return res.json({ redirect: "/homestaff", token, urole: user.urole, username: user.username });
                    case "lender":
                        return res.json({ redirect: "/listlender", token, urole: user.urole, username: user.username });
                    case "user":
                        return res.json({ redirect: "/home", token, urole: user.urole, username: user.username });
                    default:
                        return res.status(200).json({ token, urole: user.urole, username: user.username });
                }
            } else {
                return res.status(401).json({ error: "Invalid email or password" });
            }
        } else {
            return res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.log("Server error during login", err);
        return res.status(500).json({ error: "Server error during login" });
    }
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/mainpage", "register.html"));
});

// Register
app.post('/register', jsonParser, async (req, res) => {
    const {
        firstname,
        lastname,
        username,
        email,
        password,
        phone,
        address,
        gender,
    } = req.body;

    try {
        // Hash the password using bcrypt
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database
        dbConnection.query(
            'INSERT INTO users(firstname, lastname, username, email, password, phone, address, gender, urole) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                firstname,
                lastname,
                username,
                email,
                password, // ใช้พาสเวิร์ดที่ถูกแฮชแล้ว
                phone,
                address,
                gender,
                'user',
            ],
            (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }
                res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
            }
        );
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/profile/:id", async (req, res) => {
    const id = req.params.id;
    try {
        dbConnection.query(
            "SELECT username, email, firstname, lastname, image, phone, address FROM users WHERE id = ?",
            [id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result);
                // const filePath = path.join(__dirname, "/views/users", "profile.html");
                // res.sendFile(filePath);
            }

        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.patch("/profile/:email", async (req, res) => {
    const email = req.params.email;
    const newpassword = req.body.password;
    const image = req.body.image;

    try {
        dbConnection.query(
            "UPDATE users SET password = ?, image = ? WHERE email = ?",
            [newpassword, image, email],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Password changed successfully!" });
            }
        );
    } catch (err) {
        console.log("Password changed failed");
        return res.status(500).send();
    }
});

app.get("/home", requireLogin, async (req, res) => {
    // ดึงข้อมูลผู้ใช้จาก session หรือ token ที่ได้จากการ login
    const user = req.session.user;

    // เช็คว่ามีข้อมูลผู้ใช้หรือไม่
    if (user) {
        // ดึงข้อมูล username จากฐานข้อมูล
        try {
            const userData = await new Promise((resolve, reject) => {
                dbConnection.query(
                    "SELECT username FROM users WHERE email = ?",
                    [user.email],
                    (err, result, fields) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.length > 0 ? result[0] : null);
                        }
                    }
                );
            });

            // ส่งข้อมูล username กลับไปยังหน้า home
            res.sendFile(path.join(__dirname, "/views/users", "home.html"));
        } catch (err) {
            console.error('Error retrieving username:', err);
            res.status(500).json({ error: "Server error during retrieving username" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});


app.get("/home1", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail FROM motorcycles",
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result);
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// History lender
app.get("/historylender", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT borrow_date, return_date, motorcycle_id, motorcycle_name,user_borrow, status, reason FROM borrowing",
        
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                const filePath = path.join(__dirname, "/views/dashboard-history", "historylender.html");

                // Check if the client accepts JSON
                if (req.accepts('json')) {
                    res.status(200).json(result);
                } else {
                    res.sendFile(filePath);
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// historystaff
app.get("/historystaff", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT borrow_date, return_date, motorcycle_id, motorcycle_name,user_borrow, status, reason FROM borrowing",
        
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                const filePath = path.join(__dirname, "/views/staff", "historystaff.html");

                // Check if the client accepts JSON
                if (req.accepts('json')) {
                    res.status(200).json(result);
                } else {
                    res.sendFile(filePath);
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// confirm insert




// app.get("/confirm/:motorcycle_id", async (req, res) => {
//     const motorcycle_id = req.params.motorcycle_id;

//     try {
//         const queryResult = await new Promise((resolve, reject) => {
//             dbConnection.query(
//                 "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail, motorcycle_insurance, motorcycle_traffic FROM motorcycles WHERE motorcycle_id = ?",
//                 [motorcycle_id],
//                 (err, result, fields) => {
//                     if (err) {
//                         console.log(err);
//                         reject(err);
//                         return;
//                     }

//                     if (result.length === 0) {
//                         reject({ status: 404, error: "Motorcycle not found" });
//                         return;
//                     }

//                     resolve(result);
//                 }
//             );
//         });

//         // Send JSON response
//         res.status(200).json(queryResult);
//     } catch (err) {
//         console.log(err);
//         if (err.status === 404) {
//             return res.status(404).json(err);
//         }
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });



// Function to check if a motorcycle with the specified ID exists
async function checkIfMotorcycleExists(motorcycle_id) {
    return new Promise((resolve, reject) => {
        dbConnection.query(
            "SELECT COUNT(*) AS count FROM motorcycles WHERE motorcycle_id = ?",
            [motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0].count > 0);
                }
            }
        );
    });
}














app.get("/detail/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;
    try {
        dbConnection.query(
            "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail, motorcycle_insurance, motorcycle_traffic FROM motorcycles WHERE motorcycle_id = ?",
            [motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                if (result.length === 0) {
                    return res.status(404).json({ error: "Motorcycle not found" });
                }

                res.status(200).json(result);

                // Assuming you want to send the HTML file only if the query is successful
                const filePath = path.join(__dirname, "/views/users", "detail.html");
                res.sendFile(filePath);
            }
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.get("/list", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "list.html"));
});

app.get("/list/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    try {
        dbConnection.query(
            "SELECT id, request_date, motorcycle_id, motorcycle_name, user_process, borrow_date, return_date, borrow_location, return_location, motorcycle_status FROM borrowing",
            [user_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    // return res.status(400).send();
                }
                res.status(200).json(result);
                res
                    .status(200)
                    .sendFile(path.join(__dirname, "/views/users", "list.html"));
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


// history user
app.get("/history3", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT borrow_date, return_date, motorcycle_id, motorcycle_name,user_borrow, status, reason FROM borrowing",
        
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                const filePath = path.join(__dirname, "/views/dashboard-history", "history.html");

                // Check if the client accepts JSON
                if (req.accepts('json')) {
                    res.status(200).json(result);
                } else {
                    res.sendFile(filePath);
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.get("/history2", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT borrow_date, return_date, motorcycle_id, motorcycle_name, status, user_borrow, reason FROM borrowing",
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    // return res.status(400).send();
                }
                res.status(200).json(result);
                const filePath = path.join(__dirname, "/views/dashboard-history", "history.html");
                res.sendFile(filePath);
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});




app.get("/history1", async (req, res) => {
    try {
        dbConnection.query(
            "SELECT user_borrow, borrow_date, return_date, motorcycle_id, motorcycle_name, status, reason FROM borrowing",
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    // return res.status(400).send();
                }
                res.status(200).json(result);
                const filePath = path.join(__dirname, "/views/users", "history.html");
                res.sendFile(filePath);
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


// app.get("/dashboard_lander/:email", async (req, res) => {
//     const email = req.params.email;
//     try {
//         dbConnection.query(
//             "SELECT borrowing.user_id, motorcycles.motorcycle_id FROM  borrowing, motorcycles, users WHERE email = ?",
//             [email],
//             (err, result, fields) => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(400).send();
//                 }
//                 // res.status(200).json({ result });
//                 res
//                     .status(200)
//                     .sendFile(
//                         path.join(__dirname, "/views/dashboard-history", "dashboard.html")
//                     );
//             }
//         );
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send();
//     }
// });




// approve
app.patch("/listlender/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;
    const newStatus = 'approved';

    try {
        dbConnection.query(
            "UPDATE borrowing SET status = ? WHERE motorcycle_id = ?",
            [newStatus, motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Password changed successfully!" });
            }
        );
    } catch (err) {
        console.log("Password changed failed");
        return res.status(500).send();
    }
});

// disapprove
app.patch("/listlenderdis/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;
    const newStatus = 'disapproved';
    const reason = req.body.reason


    try {
        dbConnection.query(
            "UPDATE borrowing SET status = ?,reason = ? WHERE motorcycle_id = ?",
            [newStatus, reason, motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Password changed successfully!" });
            }
        );
    } catch (err) {
        console.log("Password changed failed");
        return res.status(500).send();
    }
});


app.get("/homestaff1", async (req, res) => {
    const email = req.params.email;
    try {
        dbConnection.query(
            "SELECT motorcycle_name, motorcycle_status, motorcycle_id, motorcycle_image FROM  motorcycles",
            [email],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result);
                // res.status(200).sendFile(path.join(__dirname, "/views/staff", "homestaff.html"));
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


app.delete("/homestaff/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;

    try {
        // First, delete related records in the 'borrowing' table
        await new Promise((resolve, reject) => {
            dbConnection.query(
                "DELETE FROM borrowing WHERE motorcycle_id = ?",
                [motorcycle_id],
                (err, result, fields) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        // Then, delete the record in the 'motorcycles' table
        await new Promise((resolve, reject) => {
            dbConnection.query(
                "DELETE FROM motorcycles WHERE motorcycle_id = ?",
                [motorcycle_id],
                (err, result, fields) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        // Send a success response only if the above operations were successful
        res.status(200).json({ message: "Product and related records deleted successfully!" });
    } catch (err) {
        console.error(err);
        // Send an error response
        // res.status(500).json({ error: "Internal Server Error" });
    }
});






app.get("/Staff_edit/:email/:motorcycle_id", async (req, res) => {
    const email = req.params.email;
    const motorcycle_id = req.params.motorcycle_id;
    try {
        dbConnection.query(
            "SELECT motorcycle_name, motorcycle_status, motorcycle_id, motorcycle_image, motorcycle_detail, motorcycle_traffic, motorcycle_insurance FROM motorcycles JOIN users WHERE users.email = ? AND motorcycles.motorcycle_id = ?",
            [email, motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                // res.status(200).json(result);
                res.status(200).sendFile(path.join(__dirname, "/views/staff", "edit.html"));
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


app.patch("/Staff_edit/:email", async (req, res) => {
    const email = req.params.email;
    const { motorcycle_image, motorcycle_name, motorcycle_id, motorcycle_status, motorcycle_detail, motorcycle_traffic, motorcycle_insurance } = req.body;

    try {
        dbConnection.query(
            "UPDATE motorcycles, users SET motorcycle_image = ?, motorcycle_name = ?, motorcycle_id = ?, motorcycle_status = ?, motorcycle_detail = ?, motorcycle_traffic = ?, motorcycle_insurance = ?   WHERE email = ?",
            [motorcycle_image, motorcycle_name, motorcycle_id, motorcycle_status, motorcycle_detail, motorcycle_traffic, motorcycle_insurance, email],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Product update successfully!" });
            }
        );
    } catch (err) {
        console.log("Product update failed");
        return res.status(500).send();
    }
});


app.post("/detailstaff/:email", async (req, res) => {
    const { motorcycle_name, motorcycle_detail, motorcycle_image, motorcycle_status, motorcycle_insurance, motorcycle_traffic } = req.body;
    const email = req.params.email;
    try {
        // Insert into 'borrowing'
        dbConnection.query(
            "INSERT INTO motorcycles (motorcycle_name, motorcycle_detail, motorcycle_image, motorcycle_status, motorcycle_insurance, motorcycle_traffic) VALUES (?, ?, ?, ?, ?, ?)",
            [
                motorcycle_name, motorcycle_detail, motorcycle_image, motorcycle_status, motorcycle_insurance, motorcycle_traffic, email
            ],
            (err, result, fields) => {
                if (err) {
                    console.log("Error inserting into 'borrowing'", err);
                    return res.status(400).json({ message: "Post product fialed" });
                }

                return res.status(200).json({ message: "Post product successfully!" });
            }
        );
    } catch (err) {
        console.log("Server error during registration", err);
        return res.status(500).send();
    }
});


// app.get("/confirm", (req, res) => {
//     res.sendFile(path.join(__dirname, "/views/users", "confirm.html"));
// });

app.get("/confirm/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;
    try {
        dbConnection.query(
            "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail, motorcycle_insurance, motorcycle_traffic FROM motorcycles WHERE motorcycle_id = ?",
            [motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                if (result.length === 0) {
                    return res.status(404).json({ error: "Motorcycle not found" });
                }

                res.status(200).json(result);

                // Assuming you want to send the HTML file only if the query is successful
                const filePath = path.join(__dirname, "/views/users", "confirm.html");
                res.sendFile(filePath);
            }
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.patch("/confirm/:motorcycle_id", async (req, res) => {
    const motorcycle_id = req.params.motorcycle_id;
    const newStatus = 'waiting';

    try {
        dbConnection.query(
            "UPDATE motorcycles SET motorcycle_status = ? WHERE motorcycle_id = ?",
            ['waiting', motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ message: "Update failed" });
                }

                res.status(200).json({ message: "Update successfully!!" });
            }
        );
    } catch (err) {
        console.log("Update failed");
        return res.status(500).json({ message: "Server error during update" });
    }
});

// app.get("/confirm/:motorcycle_id", async (req, res) => {
//     const motorcycle_id = req.params.motorcycle_id;

//     try {
//         const queryResult = await new Promise((resolve, reject) => {
//             dbConnection.query(
//                 "SELECT motorcycle_id, motorcycle_name, motorcycle_image, motorcycle_status, motorcycle_detail, motorcycle_insurance, motorcycle_traffic FROM motorcycles WHERE motorcycle_id = ?",
//                 [motorcycle_id],
//                 (err, result, fields) => {
//                     if (err) {
//                         console.log(err);
//                         reject(err);
//                         return;
//                     }

//                     if (result.length === 0) {
//                         reject({ status: 404, error: "Motorcycle not found" });
//                         return;
//                     }

//                     resolve(result);
//                 }
//             );
//         });

//         // Send JSON response
//         res.status(200).json(queryResult);
//     } catch (err) {
//         console.log(err);
//         if (err.status === 404) {
//             return res.status(404).json(err);
//         }
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });

app.post("/confirm/:motorcycle_id", async (req, res) => {
    const { borrow_date, return_date } = req.body;
    const motorcycle_id = req.params.motorcycle_id;
    const user = req.session.user;

    try {
        // Check if the motorcycle with the specified ID exists
        const motorcycleExists = await checkIfMotorcycleExists(motorcycle_id);

        if (!motorcycleExists) {
            return res.status(404).json({ message: "Motorcycle not found" });
        }

        // Fetch motorcycle_name from the database based on motorcycle_id
        const motorcycleInfo = await getMotorcycleInfo(motorcycle_id);

        if (!motorcycleInfo) {
            return res.status(404).json({ message: "Motorcycle information not found" });
        }

        const motorcycle_name = motorcycleInfo.motorcycle_name;

        // If the motorcycle exists, insert into 'borrowing'
        dbConnection.query(
            "INSERT INTO borrowing (borrow_date, return_date, motorcycle_id, motorcycle_name, user_borrow) VALUES (?, ?, ?, ?, ?)",
            [borrow_date, return_date, motorcycle_id, motorcycle_name, user.username],
            (err, result, fields) => {
                if (err) {
                    console.log("Error inserting into 'borrowing'", err);
                    return res.status(400).json({ message: "Post product failed" });
                }

                return res.status(200).json({ message: "Post product successfully!" });
            }
        );
    } catch (err) {
        console.log("Server error during registration", err);
        return res.status(500).send();
    }
});



// Function to get motorcycle information based on motorcycle_id
async function getMotorcycleInfo(motorcycle_id) {
    return new Promise((resolve, reject) => {
        dbConnection.query(
            "SELECT motorcycle_name FROM motorcycles WHERE motorcycle_id = ?",
            [motorcycle_id],
            (err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0]); // Assuming you have only one row for a given motorcycle_id
                }
            }
        );
    });
}


app.get("/history3", async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user

        dbConnection.query(
            "SELECT borrow_date, return_date, motorcycle_id, motorcycle_name, status, reason FROM borrowing WHERE user_id = ?",
            [userId],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }

                // Check if the client accepts JSON
                if (req.accepts('json')) {
                    res.status(200).json(result);
                } else {
                    const filePath = path.join(__dirname, "/views/dashboard-history", "history.html");
                    res.sendFile(filePath);
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/views/mainpage", "main.html")));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
