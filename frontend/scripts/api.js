/*
 When the backend is ready, change USE_API to true and implement fetch calls.
 Until then, feature modules use localStorage via utilities.js
 */
let USE_API = false;
let API_BASE = "http://localhost:5000/api";

// add this functions if umay bro:
// async function apiGet(path) {
//   let res = await fetch(API_BASE + path, {
//     headers: { Authorization: "Bearer " + localStorage.getItem("duto_token") }
//   });
//   return res.json();
// }
