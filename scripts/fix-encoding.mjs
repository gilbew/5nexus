import fs from "fs";
const p = "c:/Users/gilbe/Desktop/latihan ukom/Latihan UKOM/scripts/build-gap100.mjs";
let b = fs.readFileSync(p);
let s = b[1] === 0 ? b.toString("utf16le") : b.toString("utf8");
s = s.split("Implementing").join("Actuating");
s = s.replace(/Actuating ex post/g, "Evaluating ex post");
fs.writeFileSync(p, s, "utf8");
console.log("fixed build-gap100 utf8");