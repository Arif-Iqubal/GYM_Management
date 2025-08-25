// import { getAuth, updateEmail, signInWithEmailAndPassword } from "firebase/auth";
// import { initializeApp } from "firebase/app";

// // Your Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyCnkw8TwoB2BcHSqGDS6qIfxHHeXw_f9U4",
//   authDomain: "gym-management-49109.firebaseapp.com",
//   projectId: "gym-management-49109",
//   storageBucket: "gym-management-49109.appspot.com",
//   messagingSenderId: "433938893587",
//   appId: "1:433938893587:web:d992825f727210af13e8e6",
//   measurementId: "G-8P25C7LY3G"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// async function testEmailUpdate(currentEmail, currentPassword, newEmail) {
//   try {
//     // Sign in
//     const userCredential = await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
//     const user = userCredential.user;
//     console.log("Signed in as:", user.email, "Verified:", user.emailVerified);

//     // Make sure current email is verified
//     if (!user.emailVerified) {
//       throw new Error("Current email is not verified.");
//     }

//     // Try to update email
//     await updateEmail(user, newEmail);
//     console.log("Email updated to:", newEmail);

//     // Send verification to new email
//     await user.sendEmailVerification();
//     console.log("Verification email sent to new email.");
//   } catch (error) {
//     console.error("Email update error:", error.code, error.message);
//   }
// }

// // Usage:
// testEmailUpdate("your_current_email@gmail.com", "your_password", "your_new_email@gmail.com");