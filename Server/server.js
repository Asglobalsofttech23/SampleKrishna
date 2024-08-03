const express = require('express')
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const port = 3030;


app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "ss1725758@gmail.com", // your Gmail account
    pass: "jssn aehs neyd vkgr", // your Gmail app-specific password or regular password (not recommended)
  },
  logger: true, // Enable logging
  debug: true,  // Enable debug output
});

app.post('/send-email', (req, res) => {
  const { to,subject,html} = req.body;

  const mailOptions = {
    from: 'ss1725758@gmail.com', // Replace with your email address
    to: to,
    subject: subject,
    html: html,
    
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      console.error('Error details:', error.message); // Add detailed error logging
      return res.status(500).json({ error: 'Error sending email', message: error.message });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent' });
  });
}); 




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '_' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });
const uploadExcel = multer({storage: storageExcel});


// const db = mysql.createPool({
//   host : '193.203.184.74',
//   port : '3306',
//   user : 'u534462265_asglobal',
//   password : 'ASGlobal@12345',
//   database : 'u534462265_crm'
// })
// const db = mysql.createPool({
//   host : 'localhost',
//   port : '3306',
//   user : 'root',
//   password : '0210',
//   database : 'u534462265_crm'
// })



const db = mysql.createPool({
  host : '193.203.184.74',
  port : '3306',
  user : 'u534462265_DemoDatabase',
  password : 'ASGlobal@12345',
  database : 'u534462265_DemoDatabase'
})

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully.");
    connection.release();
  }
});

const departmentController = require('./controllers/departmentController')(db);
app.use('/department',departmentController);

const roleController = require('./controllers/roleController')(db);
app.use('/role',roleController);

const languageController = require('./controllers/languageController')(db);
app.use('/language',languageController);

const employeeController = require('./controllers/employeeController')(db,transporter);
app.use('/employee',employeeController);

const leadsController = require('./controllers/leadsController')(db);
app.use('/leads',leadsController);

const purchaseController = require('./controllers/purchaseController')(db);
app.use('/purchase',purchaseController);


const productController = require('./controllers/productController')(db,storage);
app.use('/product',productController);

const salesController = require('./controllers/salesController')(db);
app.use('/sales',salesController);

const stackController = require('./controllers/stackController')(db);
app.use('/stock',stackController);

const customerController = require('./controllers/customerController')(db);
app.use('/customer',customerController);


const customerPurchaseController = require('./controllers/customerPurchaseController')(db);
app.use('/cust_purch',customerPurchaseController);


const empAttendanceController = require('./controllers/empAttendanceController')(db);
app.use('/emp_attend',empAttendanceController);

const uploadExcelController = require('./controllers/uploadExcelController')(db,uploadExcel);
app.use('/upload',uploadExcelController);

app.get('/totals', (req, res) => {
  const salesQuery = 'SELECT SUM(total) AS total_sales FROM sales';
  const purchaseQuery = 'SELECT SUM(total) AS total_purchases FROM purchase';

  db.query(salesQuery, (err, salesResult) => {
      if (err) throw err;

      db.query(purchaseQuery, (err, purchaseResult) => {
          if (err) throw err;

          res.json({
              total_sales: salesResult[0].total_sales,
              total_purchases: purchaseResult[0].total_purchases
          });
      });
  });
});



app.listen(port,()=>{
  console.log(`Server is running ....${port}`)
})