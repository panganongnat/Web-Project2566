
const RB=ReactBootstrap;
const {Alert, Card, Button, Table} = ReactBootstrap;

function StudentTable({data, app}) {
  return (
    <table className='table'>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>วันที่เช็คชื่อ</th>
          <th>วิชา</th>
          <th>ห้อง</th>
          <th>แก้ไข</th>
          <th>ลบ</th>
    
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{s.fname}</td>
            <td>{s.lname}</td>
            <td>{s.email}</td>
            <td>{s.class_date}</td>
            <td>{s.subject}</td>
            <td>{s.room}</td>
            <td><EditButton std={s} app={app}/></td>
            <td><DeleteButton std={s} app={app}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}







  function TextInput({label,app,value,style}){
    return <label className="form-label">
    {label}:    
     <input className="form-control" style={style}
     value={app.state[value]} onChange={(ev)=>{
         var s={};
         s[value]=ev.target.value;
         app.setState(s)}
     }></input>
   </label>;  
  }
  function EditButton({std,app}){
    return <button onClick={()=>app.edit(std)}>แก้ไข</button>
   }

   function DeleteButton({std,app}){    
    return <button onClick={()=>app.delete(std)}>ลบ</button>
  }
  function AnswerTable({ answers }) {
    return (
      <table className='table'>
        <thead>
          <tr>
            <th>คำตอบ</th>
          </tr>
        </thead>
        <tbody>
          {answers.map((answer) => (
            <tr key={answer.id}>
              <td>{answer.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  
 



class App extends React.Component {
    title = (
      <Alert variant="info">
        <b>SC310006 Mobile and Web Application Development </b>
      </Alert>
    );
    footer = (
      <div>
        By 643020638-9 รัชชานนท์ วัฒนกูล | 643020654-1 อนงค์นาถ จำนิล | 643021429-3 นางสาวมาริสา ปิ่นแก้ว | 643020623-2 นางสาวปรียาภรณ์ สอนสา<br />
        College of Computing, Khon Kaen University
      </div>
    );
    state = {
        scene: 0,
        students:[],
        stdid:"",
        stdfname:"",
        stdlname:"",
        stdemail:"",
        username: "", // เพิ่ม state สำหรับเก็บข้อมูล username
        password: "", // เพิ่ม state สำหรับเก็บข้อมูล password
        newQuestion: "", // เพิ่ม state สำหรับเก็บคำถามใหม่
        
        
    }
    
      

    
      
    readData(){
        db.collection("students").get().then((querySnapshot) => {
            var stdlist=[];
            querySnapshot.forEach((doc) => {
                stdlist.push({id:doc.id,... doc.data()});                
            });
            console.log(stdlist);
            this.setState({students: stdlist});
        });
    }
    autoRead(){
        db.collection("students").onSnapshot((querySnapshot) => {
            var stdlist=[];
            querySnapshot.forEach((doc) => {
                stdlist.push({id:doc.id,... doc.data()});                
            });          
            this.setState({students: stdlist});
        });
        
    }
    autoRead2() {
      db.collection("checkin").onSnapshot((querySnapshot) => {
        const checkinData = [];
        querySnapshot.forEach((doc) => {
          checkinData.push({ id: doc.id, ...doc.data() });
        });
    
        const studentsPromises = checkinData.map((checkin) => {
          return db.collection("students").doc(checkin.id).get();
        });
    
        Promise.all(studentsPromises)
          .then((studentSnapshots) => {
            const students = studentSnapshots.map((snapshot, index) => {
              const studentData = snapshot.data();
              return {
                ...studentData,
                ...checkinData[index], // เพิ่มข้อมูลการเช็คชื่อลงในข้อมูลของนักศึกษา
              };
            });
            this.setState({ students: students });
          })
          .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการอ่านข้อมูลนักศึกษา: ", error);
          });
      });
    }
    
    
    insertData(){
        db.collection("students").doc(this.state.stdid).set({
           fname : this.state.stdfname,
           lname : this.state.stdlname,
           email : this.state.stdemail,
        });
    }
    edit(std){      
        this.setState({
         stdid    : std.id,
         stdfname : std.fname,
         stdlname : std.lname,
         stdemail : std.email,
        
        })
     }
     delete(std){
      if(confirm("ต้องการลบข้อมูล")){
         db.collection("students").doc(std.id).delete(); // ลบข้อมูลนักศึกษา
         db.collection("checkin").doc(std.id).delete(); // ลบข้อมูลการเช็คชื่อ
      }
  }

    checkStudentAttendance() {
        const stdCheckId = this.state.stdCheckId;
        db.collection("students").doc(stdCheckId).get().then((doc) => {
          if (doc.exists) {
            // นักศึกษาพบ
            const studentData = doc.data();
            const studentName = studentData.fname + " " + studentData.lname;
            const currentDate = new Date().toLocaleDateString();
            // ทำการเช็คชื่อใน collection checkin
            db.collection("checkin").add({
              subject: "Mobile and Web Application Development",
              room: "SC9228",
              class_date: currentDate,
              id: stdCheckId
            }).then(() => {
              alert(`เช็คชื่อนักศึกษา ${studentName} เรียบร้อยแล้ว`);
              // อัปเดต state หรือทำการอื่น ๆ ตามต้องการ
            }).catch((error) => {
              console.error("เกิดข้อผิดพลาดในการเช็คชื่อ: ", error);
            });
          } else {
            // ไม่พบนักศึกษา
            alert("ไม่พบนักศึกษาดังกล่าว");
          }
        }).catch((error) => {
          console.error("เกิดข้อผิดพลาดในการค้นหาข้อมูลนักศึกษา: ", error);
        });
      }
      // ฟังก์ชันเพิ่มคำถามใหม่ลงในฐานข้อมูล Firestore
      addQuestionToDatabase = () => {
        const { newQuestion } = this.state;
        // เพิ่มคำถามใหม่ลงในคอลเลกชัน "questions" ใน Firestore
        db.collection("questions")
          .add({
            question: newQuestion,
            answers: [], // เริ่มต้นยังไม่มีคำตอบเลยเราจะเก็บในรูปแบบของอาเรย์ว่าง
          })
          .then(() => {
            console.log("เพิ่มคำถามใหม่ลงในฐานข้อมูลสำเร็จ");
            // อัปเดต state หรือทำอย่างอื่น ๆ ตามต้องการหลังจากเพิ่มคำถามเสร็จ
          })
          .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการเพิ่มคำถามใหม่: ", error);
          });
      };
      // ฟังก์ชันเปลี่ยนแปลง state เมื่อผู้ใช้ป้อนคำถามใหม่
      handleNewQuestionChange = (event) => {
        this.setState({ newQuestion: event.target.value });
      };

      autoReadAnswer(){
        db.collection("answers").onSnapshot((querySnapshot) => {
            var anslist=[];
            querySnapshot.forEach((doc) => {
                anslist.push({id:doc.id,... doc.data()});                
            });          
            this.setState({answars: anslist});
        });
        
    }
    showAnswers() {
      // ทำการดึงคำตอบจาก Firestore และแสดงผลบนหน้าเว็บ
      db.collection("answers").get().then((querySnapshot) => {
          const answers = [];
          querySnapshot.forEach((doc) => {
              answers.push({ id: doc.id, ...doc.data() });                
          });
          // แสดงคำตอบในรูปแบบที่ต้องการ
          console.log(answers);
          // หรือจะทำการแสดงผลบนหน้าเว็บโดยใช้ state ก็ได้
      });
  }
  


      
      
      
      

    render() {
        // var stext = JSON.stringify(this.state.students);  
        return (
          <Card>
            <Card.Header>{this.title}</Card.Header>  
            <Card.Body>
            <Button style={{ 
                backgroundColor: '#0d8ce0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                margin: '20px',
                
                
              }}  onClick={()=>this.autoRead()}>รายชื่อทั้งหมด</Button>

              <Button style={{ 
              backgroundColor: '#0d8ce0',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              margin: '20px',
              
              
            }}  onClick={()=>this.autoRead2()}>ดูรายชื่อที่เช็คชื่อ</Button>
              <div>
              <StudentTable data={this.state.students} app={this}/>  
        
              </div>

              <br/><br/>
              
            <b>เช็คชื่อนักศึกษา :</b><br/>
            <TextInput label="รหัสนักศึกษา" app={this} value="stdCheckId" style={{width:120}}/>
            <Button style={{ 
                backgroundColor: '#25a3f7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                margin: '10px'}} onClick={()=>this.checkStudentAttendance()}>เช็คชื่อ</Button>
            
            {/* ฟอร์มสำหรับเพิ่มคำถามใหม่ */}
            <div>
              <br></br>
              <b>เพิ่มคำถามใหม่</b>
              <br></br>
              <label>
                คำถาม :
                <input
                  type="text"
                  value={this.state.newQuestion}
                  onChange={this.handleNewQuestionChange}
                />
              </label>
              <button style={{ 
                backgroundColor: '#25a3f7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                margin: '20px',}}  onClick={this.addQuestionToDatabase}>เพิ่มคำถาม</button>
                
            </div>
            

            

            

            

            
            </Card.Body>

            <Card.Footer>
            <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b><br/>
            <TextInput label="ID" app={this} value="stdid" style={{width:120}}/>  
            <TextInput label="ชื่อ" app={this} value="stdfname" style={{width:120}}/>
            <TextInput label="สกุล" app={this} value="stdlname" style={{width:120}}/>
            <TextInput label="Email" app={this} value="stdemail" style={{width:150}} />        
            <Button style={{ 
                backgroundColor: '#25a3f7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                margin: '20px',}} onClick={()=>this.insertData()}>Save</Button>
            </Card.Footer>
            <Card.Footer>{this.footer}</Card.Footer>
          </Card>          
        );
      }
  
  
    
       
  }

  const firebaseConfig = {
    apiKey: "AIzaSyBuIiJtU4bgXMDPyQVgefNZv4a3oznL95Y",
    authDomain: "projectfinalweb2566.firebaseapp.com",
    projectId: "projectfinalweb2566",
    storageBucket: "projectfinalweb2566.appspot.com",
    messagingSenderId: "618027277807",
    appId: "1:618027277807:web:73e699a3d719603b4eaa1a",
    measurementId: "G-6ZSF8R4FM1"
  };
    firebase.initializeApp(firebaseConfig);      
    const db = firebase.firestore();
    // db.collection("students").get().then((querySnapshot) => {
//   querySnapshot.forEach((doc) => {
//       console.log(`${doc.id} =>`,doc.data());
//   });
// });
  




// ระบุคอมโพเนนต์ที่ใช้สำหรับหน้าแรก
const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
