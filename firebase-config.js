// Firebase configuration for Meftahul Amin portfolio — live client reviews
const firebaseConfig = {
  apiKey: "AIzaSyARgkwk8uMTZ4-pnSk5G4Q4AIAZUW5AIS4",
  authDomain: "meftahul-portfolio.firebaseapp.com",
  projectId: "meftahul-portfolio",
  storageBucket: "meftahul-portfolio.firebasestorage.app",
  messagingSenderId: "907942922449",
  appId: "1:907942922449:web:ff1d66b2536bff661d1df0",
  measurementId: "G-QY2YYMHZJP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
