// Шүүмж — Firebase тохиргоо.
// Firebase Console → Project settings → General → "Your apps" → Web app → SDK setup and configuration → Config
// хэсгээс хуулж доорх утгуудыг солино уу. (Эдгээр нь нууц биш, вэб хуудсанд ил байхаар зохиогдсон.)
window.SHUUMJ_FIREBASE = {
  apiKey: "AIzaSyDUeYkSMklomjQEsgPwJ39EeGJtou8AWg4",
  authDomain: "shuumj-aa3af.firebaseapp.com",
  projectId: "shuumj-aa3af",
  storageBucket: "shuumj-aa3af.firebasestorage.app",
  messagingSenderId: "260017965344",
  appId: "1:260017965344:web:00a88933f0a88d605bef45"
};

// Удирдлагын (админ) и-мэйл хаягууд — эдгээр хаягаар нэвтэрсэн хүнд "⚙ Удирдлага" хуудас нээгдэнэ.
// firestore.rules доторх жагсаалттай ИЖИЛ байх ёстой.
window.SHUUMJ_ADMINS = ["wildhaskap@gmail.com"];

// Банкны шилжүүлгээр төлбөр авах данс (QPay холбогдох хүртэл).
// Иргэн гомдол/талархал баталгаажуулахад энэ мэдээлэл ба таны нэхэмжлэхийн дугаар (гүйлгээний утга) гарч ирнэ.
window.SHUUMJ_BANK = {
  bank: "Хаан банк",          // жишээ: "Хаан банк"
  account: "930005005031237303",    // дансны дугаар
  iban: "",                    // IBAN (байхгүй бол хоосон үлдээнэ)
  holder: "О.Данзанравжаа"       // хүлээн авагчийн нэр, жишээ: "Текбайс ХХК"
};
window.SHUUMJ_FEE = 20000;     // үйлчилгээний төлбөр (₮)
