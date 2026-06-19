/* ==========================================
   AI Infrastructure DDS
   Ultimate Cost & Management System
========================================== */

const DDS = {

auth:{},
ui:{},
storage:{},
data:{},
maps:{},
analysis:{},
weather:{},
traffic:{},
cost:{},
reports:{},
kanban:{},
export:{}
};
if(!localStorage.getItem("theme")){
localStorage.setItem("theme","dark");
}


/* ==========================================
   STORAGE HELPERS
========================================== */

DDS.storage.get = function(key, fallback){

try{

return JSON.parse(
localStorage.getItem(key)
) || fallback;

}catch{

return fallback;

}

};

DDS.storage.set = function(key,val){

localStorage.setItem(
key,
JSON.stringify(val)
);
window.location.href =
 "dashboard.html";

};

/* ==========================================
   AUTH
========================================== */

DDS.auth.requireLogin = function(){

const auth =
DDS.storage.get(
"auth",
null
);

if(!auth){

window.location =
"index.html";

}

return auth;

};

DDS.auth.logout = function(){

localStorage.removeItem(
"auth"
);

window.location =
"index.html";

};

/* ==========================================
   THEME
========================================== */


DDS.ui.initTheme = function(){

const theme =
localStorage.getItem("theme") || "dark";

if(theme==="light"){

document.body.classList.add("light");

}

const btn =
document.getElementById("themeToggle");

if(btn){

btn.innerHTML =
theme==="light"
? "­ƒîÖ"
: "ÔÿÇ´©Å";

}

};


DDS.ui.toggleTheme = function(){

document.body.classList.toggle("dark");

const dark =
document.body.classList.contains("dark");

localStorage.setItem(
"theme",
dark ? "dark" : "light"
);

const btn =
document.getElementById("themeToggle");

if(btn){

btn.innerHTML =
dark ? "ÔÿÇ´©Å" : "­ƒîÖ";

}

};
/* ==========================================
   OFFLINE BANNER
========================================== */

DDS.ui.updateOfflineBanner =
function(){

const banner =
document.getElementById(
"offlineBanner"
);

if(!banner) return;

banner.style.display =
navigator.onLine
? "none"
: "block";

};

window.addEventListener(
"online",
DDS.ui.updateOfflineBanner
);

window.addEventListener(
"offline",
DDS.ui.updateOfflineBanner
);

/* ==========================================
   LANGUAGE SYSTEM
========================================== */

DDS.data.translations = {

en:{
dashboard:"Dashboard",
inspect:"Inspect",
reports:"Reports"
},

hi:{
dashboard:"ÓñíÓÑêÓñÂÓñ¼ÓÑïÓñ░ÓÑìÓñí",
inspect:"Óñ¿Óñ┐Óñ░ÓÑÇÓñòÓÑìÓñÀÓñú",
reports:"Óñ░Óñ┐Óñ¬ÓÑïÓñ░ÓÑìÓñƒ"
},

kn:{
dashboard:"Ó▓íÓ│ìÓ▓»Ó▓¥Ó▓ÂÓ│ìÔÇîÓ▓¼Ó│ïÓ▓░Ó│ìÓ▓íÓ│ì",
inspect:"Ó▓¬Ó▓░Ó▓┐Ó▓ÂÓ│ÇÓ▓▓Ó▓¿Ó│å",
reports:"Ó▓ÁÓ▓░Ó▓ªÓ▓┐Ó▓ùÓ▓│Ó│ü"
}

};

/* ==========================================
   LOCATION HIERARCHY
========================================== */

DDS.data.locations = {

India:{

Maharashtra:{

"Mumbai Suburban":[
"Khar",
"Bandra",
"Andheri"
],

Pune:[
"Hinjewadi",
"Wakad",
"Shivajinagar"
]

},

Karnataka:{

"Bengaluru Urban":[
"Whitefield",
"Electronic City",
"Yelahanka"
],

Mysuru:[
"Vijayanagar",
"Nazarbad"
]

},

TamilNadu:{

Chennai:[
"Guindy",
"Adyar",
"Tambaram"
]

},

Delhi:{

Delhi:[
"Rohini",
"Dwarka",
"Karol Bagh"
]

}

}

};

/* ==========================================
   SEVERITY CONFIG
========================================== */

DDS.data.severityConfig = {

Low:{
multiplier:1.0,
discount:0.95,
score:2
},

Moderate:{
multiplier:1.4,
discount:0.90,
score:5
},

High:{
multiplier:2.0,
discount:0.82,
score:10
},

"Very High":{
multiplier:3.0,
discount:0.72,
score:15
},

Critical:{
multiplier:4.5,
discount:0.65,
score:20
}

};

/* ==========================================
   INFRASTRUCTURE RATES
========================================== */

DDS.data.infrastructureRates = {

road:{
unit:"sqm",
base:800,
labour:0.30,
material:0.55,
equipment:0.15
},

bridge:{
unit:"sqm",
base:1200,
labour:0.25,
material:0.60,
equipment:0.15
},

building:{
unit:"sqm",
base:1100,
labour:0.35,
material:0.50,
equipment:0.15
},

drainage:{
unit:"m",
base:350,
labour:0.40,
material:0.40,
equipment:0.20
},

culvert:{
unit:"piece",
base:15000,
labour:0.30,
material:0.55,
equipment:0.15
},

flyover:{
unit:"sqm",
base:1800,
labour:0.25,
material:0.60,
equipment:0.15
},

footpath:{
unit:"sqm",
base:400,
labour:0.35,
material:0.50,
equipment:0.15
},

streetlight:{
unit:"pole",
base:8000,
labour:0.20,
material:0.70,
equipment:0.10
},

retainingWall:{
unit:"sqm",
base:900,
labour:0.40,
material:0.45,
equipment:0.15
},

waterPipeline:{
unit:"m",
base:500,
labour:0.35,
material:0.50,
equipment:0.15
},

electricalPole:{
unit:"pole",
base:6000,
labour:0.25,
material:0.60,
equipment:0.15
}

};

/* ==========================================
   ADDITIONAL WORKS
========================================== */

DDS.data.additionalWorks = {

treeRemoval:{
unit:"tree",
base:1500
},

debrisRemoval:{
unit:"sqm",
base:100
},

encroachmentRemoval:{
unit:"occ",
base:5000
},

drainCleaning:{
unit:"m",
base:50
},

poleRemoval:{
unit:"pole",
base:2000
},

trafficDiversion:{
unit:"day",
base:8000
},

emergencyBarricading:{
unit:"occ",
base:3000
}

};

/* ==========================================
   LABOUR & MATERIAL RATES
========================================== */

DDS.data.rates = {

skilledLabour:800,
unskilledLabour:500,

cement:400,
steel:65,
aggregate:1000,
sand:1500,
bitumen:49

};

/* ==========================================
   TIMELINE
========================================== */

DDS.data.timeline = {

Low:"1-2 Days",

Moderate:"3-5 Days",

High:"5-10 Days",

"Very High":"10-20 Days",

Critical:"20-45 Days"

};

/* ==========================================
   TRAFFIC SCORES
========================================== */

DDS.data.trafficScores = {

"Free Flow":0,

Moderate:2,

Heavy:5,

Extreme:8

};

/* ==========================================
   WEATHER TYPES
========================================== */

DDS.data.weatherConditions = [

"Sunny",
"Cloudy",
"Rainy",
"Storm",
"Monsoon"

];

/* ==========================================
   SAMPLE DATA GENERATOR
========================================== */

DDS.data.generateSampleData =
function(){

let inspections =
DDS.storage.get(
"inspections",
[]
);

if(inspections.length > 0){

return;

}

const cities = [

{
city:"Bandra",
state:"Maharashtra",
lat:19.0596,
lng:72.8295
},

{
city:"Khar",
state:"Maharashtra",
lat:19.0728,
lng:72.8362
},

{
city:"Whitefield",
state:"Karnataka",
lat:12.9698,
lng:77.7500
},

{
city:"Electronic City",
state:"Karnataka",
lat:12.8456,
lng:77.6603
},

{
city:"Guindy",
state:"Tamil Nadu",
lat:13.0067,
lng:80.2206
}

];

const severities = [
"Low",
"Moderate",
"High",
"Very High",
"Critical"
];

const structures =
Object.keys(
DDS.data.infrastructureRates
);

for(let i=1;i<=30;i++){

let loc =
cities[
Math.floor(
Math.random()*
cities.length
)
];

let severity =
severities[
Math.floor(
Math.random()*
severities.length
)
];

let structure =
structures[
Math.floor(
Math.random()*
structures.length
)
];

inspections.push({

id:
"INS-"+(1000+i),

date:
new Date().toISOString(),

country:"India",

state:loc.state,

district:"Sample District",

city:loc.city,

lat:loc.lat,

lng:loc.lng,

structure,

severity,

priority:
severity,

status:
[
"Not Started",
"In Progress",
"Completed"
][
Math.floor(
Math.random()*3
)
],

assignedTo:
[
"Unassigned",
"Contractor A",
"Contractor B",
"PWD Team",
"NHAI Team"
][
Math.floor(
Math.random()*5
)
],

finalCost:
Math.floor(
50000+
Math.random()*500000
),

timeline:
DDS.data.timeline[
severity
],

weatherLog:{

condition:
DDS.data.weatherConditions[
Math.floor(
Math.random()*5
)
],

temp:
Math.floor(
20+Math.random()*15
)

},

images:[]

});

}

DDS.storage.set(
"inspections",
inspections
);

};

/* ==========================================
   INITIALIZE SAMPLE DATA
========================================== */

DDS.data.generateSampleData();
/* ==========================================
   GEOLOCATION
========================================== */

DDS.maps.getCurrentLocation = function(){

if(!navigator.geolocation){

alert("Geolocation not supported");

return;

}

navigator.geolocation.getCurrentPosition(

(pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

const latBox =
document.getElementById("latitude");

const lngBox =
document.getElementById("longitude");

if(latBox) latBox.value = lat;
if(lngBox) lngBox.value = lng;

DDS.maps.reverseGeocode(
lat,
lng
);

},

()=>{
alert(
"Location permission denied."
);
}

);

};

DDS.maps.reverseGeocode =
function(lat,lng){

let city = "Unknown";
let state = "Unknown";

if(lat>12 && lat<14){

city = "Whitefield";
state = "Karnataka";

}

if(lat>18 && lat<20){

city = "Bandra";
state = "Maharashtra";

}

const cityEl =
document.getElementById("city");

const stateEl =
document.getElementById("state");

if(cityEl) cityEl.value = city;
if(stateEl) stateEl.value = state;

};

/* ==========================================
   IMAGE STORAGE
========================================== */

DDS.analysis.images = [];

DDS.analysis.handleImages =
function(files){

Array.from(files).forEach(file=>{

if(
DDS.analysis.images.length >= 10
){

alert(
"Maximum 10 photos allowed"
);

return;

}

const reader =
new FileReader();

reader.onload = (e)=>{

DDS.analysis.images.push(
e.target.result
);

DDS.analysis.previewImage(
e.target.result
);

DDS.analysis.analyzeImage(
e.target.result
);

};

reader.readAsDataURL(file);

});

};

DDS.analysis.previewImage =
function(src){

const container =
document.getElementById(
"photoPreview"
);

if(!container) return;

const img =
document.createElement("img");

img.src = src;

img.className =
"thumbnail";

container.appendChild(img);

};

/* ==========================================
   PIXEL ANALYSIS
========================================== */

DDS.analysis.analyzeImage =
function(src){

const canvas =
document.getElementById(
"analysisCanvas"
);

if(!canvas) return;

const ctx =
canvas.getContext("2d");

const img =
new Image();

img.onload = ()=>{

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(
img,
0,
0
);

const data =
ctx.getImageData(
0,
0,
img.width,
img.height
).data;

let dark=0;
let edges=0;

for(
let i=0;
i<data.length;
i+=4
){

const avg =
(
data[i]
+
data[i+1]
+
data[i+2]
)/3;

if(avg<60){

dark++;

}

if(i>4){

const prev =
(
data[i-4]
+
data[i-3]
+
data[i-2]
)/3;

if(
Math.abs(avg-prev)>60
){

edges++;

}

}

}

const total =
img.width*img.height;

const darkPct =
(
dark/total*100
).toFixed(2);

const edgePct =
(
edges/total*100
).toFixed(2);

const darkBox =
document.getElementById(
"darkPct"
);

const edgeBox =
document.getElementById(
"edgePct"
);

if(darkBox)
darkBox.value =
darkPct+"%";

if(edgeBox)
edgeBox.value =
edgePct+"%";

DDS.analysis.predictSeverity(
parseFloat(darkPct),
parseFloat(edgePct)
);

};

img.src = src;

};

/* ==========================================
   TRAINING DATA
========================================== */

DDS.analysis.trainingData = [];

for(let i=0;i<300;i++){

DDS.analysis.trainingData.push({

dark:
Math.random()*100,

edge:
Math.random()*100,

severity:
[
"Low",
"Moderate",
"High",
"Very High",
"Critical"
][
Math.floor(
Math.random()*5
)
]

});

}

/* ==========================================
   KNN
========================================== */

DDS.analysis.predictSeverity =
function(dark,edge){

const nearest =
DDS.analysis.trainingData

.sort((a,b)=>{

const da =
Math.sqrt(
Math.pow(
a.dark-dark,
2
)+
Math.pow(
a.edge-edge,
2
)
);

const db =
Math.sqrt(
Math.pow(
b.dark-dark,
2
)+
Math.pow(
b.edge-edge,
2
)
);

return da-db;

})

.slice(0,5);

const votes = {};

nearest.forEach(x=>{

votes[x.severity] =
(votes[x.severity]||0)+1;

});

const severity =
Object.keys(votes)

.sort(
(a,b)=>
votes[b]-votes[a]
)[0];

const confidence =
(
votes[severity]/5*100
).toFixed(0);

const sevBox =
document.getElementById(
"predictedSeverity"
);

const confBox =
document.getElementById(
"confidence"
);

if(sevBox)
sevBox.value = severity;

if(confBox)
confBox.value =
confidence+"%";

};

/* ==========================================
   WEATHER
========================================== */

DDS.weather.current = {};

DDS.weather.refresh =
function(){

const condition =
DDS.data.weatherConditions[
Math.floor(
Math.random()*
DDS.data.weatherConditions.length
)
];

DDS.weather.current = {

condition,

temp:
Math.floor(
20+
Math.random()*18
),

humidity:
Math.floor(
40+
Math.random()*50
)

};

const weatherBox =
document.getElementById(
"weatherCondition"
);

const tempBox =
document.getElementById(
"temperature"
);

if(weatherBox)
weatherBox.value =
condition;

if(tempBox)
tempBox.value =
DDS.weather.current.temp+"┬░C";

};

/* ==========================================
   TRAFFIC
========================================== */

DDS.traffic.current =
"Moderate";

DDS.traffic.refresh =
function(){

const levels = [

"Free Flow",
"Moderate",
"Heavy",
"Extreme"

];

DDS.traffic.current =
levels[
Math.floor(
Math.random()*4
)
];

const box =
document.getElementById(
"trafficLevel"
);

if(box)
box.value =
DDS.traffic.current;

};

setInterval(()=>{

DDS.weather.refresh();
DDS.traffic.refresh();

},5000);

/* ==========================================
   PRIORITY
========================================== */

DDS.cost.calculatePriority =
function(severity){

const sev =
DDS.data.severityConfig[
severity
];

const traffic =
DDS.data.trafficScores[
DDS.traffic.current
] || 0;

let total =
sev.score + traffic;

if(total<5)
return "Low";

if(total<10)
return "Medium";

if(total<15)
return "High";

if(total<20)
return "Very High";

return "Critical";

};
/* ==========================================
   COST ENGINE
========================================== */

DDS.cost.calculate = function(){

const structure =
document.getElementById(
"structureType"
)?.value;

if(!structure) return null;

const area =
parseFloat(
document.getElementById(
"area"
)?.value || 0
);

const predicted =
document.getElementById(
"predictedSeverity"
)?.value || "Low";

const override =
document.getElementById(
"overrideSeverity"
)?.value;

const severity =
override || predicted;

const rate =
DDS.data.infrastructureRates[
structure
];

if(!rate) return null;

const sev =
DDS.data.severityConfig[
severity
];

const baseCost =
area *
rate.base *
sev.multiplier;

/* ======================================
   MATERIALS
====================================== */

const cementQty =
area * 0.2;

const sandQty =
area * 0.05;

const aggregateQty =
area * 0.1;

const steelQty =
structure==="bridge"
? area * 5
: structure==="building"
? area * 2
: 0;

const bitumenQty =
structure==="road"
? area * 5
: 0;

const cementCost =
cementQty *
DDS.data.rates.cement;

const sandCost =
sandQty *
DDS.data.rates.sand;

const aggregateCost =
aggregateQty *
DDS.data.rates.aggregate;

const steelCost =
steelQty *
DDS.data.rates.steel;

const bitumenCost =
bitumenQty *
DDS.data.rates.bitumen;

const materialCost =

cementCost +
sandCost +
aggregateCost +
steelCost +
bitumenCost;

/* ======================================
   LABOUR
====================================== */

const skilledDays =
area * 0.05;

const unskilledDays =
area * 0.10;

const skilledCost =
skilledDays *
DDS.data.rates.skilledLabour;

const unskilledCost =
unskilledDays *
DDS.data.rates.unskilledLabour;

const labourCost =
skilledCost +
unskilledCost;

/* ======================================
   ADDITIONAL WORKS
====================================== */

let additionalCost = 0;

[
"treeRemoval",
"debrisRemoval",
"encroachmentRemoval",
"drainCleaning",
"poleRemoval",
"trafficDiversion",
"emergencyBarricading"

].forEach(id=>{

const el =
document.getElementById(id);

if(el && el.checked){

additionalCost +=
DDS.data.additionalWorks[id]
.base;

}

});

/* ======================================
   CUSTOM WORKS
====================================== */

document
.querySelectorAll(
".custom-work-row"
)
.forEach(row=>{

const qty =
parseFloat(
row.querySelector(
".workQty"
)?.value || 0
);

const cost =
parseFloat(
row.querySelector(
".workCost"
)?.value || 0
);

additionalCost +=
qty * cost;

});

/* ======================================
   TOTALS
====================================== */

const subtotal =

baseCost +

materialCost +

labourCost +

additionalCost;

const equipment =
subtotal * 0.20;

const intermediate =
subtotal + equipment;

const gst =
intermediate * 0.18;

const finalCost =
intermediate + gst;

const cutDown =
finalCost *
sev.discount;

/* ======================================
   TIMELINE
====================================== */

const timeline =
DDS.data.timeline[
severity
];

/* ======================================
   PRIORITY
====================================== */

const priority =
DDS.cost.calculatePriority(
severity
);

/* ======================================
   DISPLAY
====================================== */

DDS.cost.renderBreakdown({

severity,

baseCost,

cementQty,
cementCost,

sandQty,
sandCost,

aggregateQty,
aggregateCost,

steelQty,
steelCost,

bitumenQty,
bitumenCost,

materialCost,

skilledDays,
skilledCost,

unskilledDays,
unskilledCost,

labourCost,

additionalCost,

subtotal,

equipment,

gst,

finalCost,

cutDown,

timeline,

priority

});

return {

severity,

priority,

timeline,

baseCost,

materialCost,

labourCost,

additionalCost,

subtotal,

equipment,

gst,

finalCost,

cutDown

};

};

/* ==========================================
   COST DISPLAY
========================================== */

DDS.cost.renderBreakdown =
function(data){

const box =
document.getElementById(
"costBreakdown"
);

if(!box) return;

box.innerHTML = `

<table class="mini-table">

<tr>
<td>Severity</td>
<td>${data.severity}</td>
</tr>

<tr>
<td>Priority</td>
<td>${data.priority}</td>
</tr>

<tr>
<td>Base Cost</td>
<td>Ôé╣${data.baseCost.toFixed(0)}</td>
</tr>

<tr>
<td>Cement</td>
<td>Ôé╣${data.cementCost.toFixed(0)}</td>
</tr>

<tr>
<td>Sand</td>
<td>Ôé╣${data.sandCost.toFixed(0)}</td>
</tr>

<tr>
<td>Aggregate</td>
<td>Ôé╣${data.aggregateCost.toFixed(0)}</td>
</tr>

<tr>
<td>Steel</td>
<td>Ôé╣${data.steelCost.toFixed(0)}</td>
</tr>

<tr>
<td>Bitumen</td>
<td>Ôé╣${data.bitumenCost.toFixed(0)}</td>
</tr>

<tr>
<td>Material Total</td>
<td>Ôé╣${data.materialCost.toFixed(0)}</td>
</tr>

<tr>
<td>Labour Total</td>
<td>Ôé╣${data.labourCost.toFixed(0)}</td>
</tr>

<tr>
<td>Additional Works</td>
<td>Ôé╣${data.additionalCost.toFixed(0)}</td>
</tr>

<tr>
<td>Equipment & Overheads</td>
<td>Ôé╣${data.equipment.toFixed(0)}</td>
</tr>

<tr>
<td>GST</td>
<td>Ôé╣${data.gst.toFixed(0)}</td>
</tr>

<tr>
<td><b>Final Cost</b></td>
<td><b>Ôé╣${data.finalCost.toFixed(0)}</b></td>
</tr>

<tr>
<td>Cut-down Cost</td>
<td>Ôé╣${data.cutDown.toFixed(0)}</td>
</tr>

<tr>
<td>Timeline</td>
<td>${data.timeline}</td>
</tr>

</table>

`;

const timelineBox =
document.getElementById(
"timelineResult"
);

if(timelineBox){

timelineBox.innerHTML =
`
<b>${data.timeline}</b>
`;

}

};

/* ==========================================
   SAVE REPORT
========================================== */

DDS.reports.saveReport =
function(){

const cost =
DDS.cost.calculate();

if(!cost){

alert(
"Please calculate cost first."
);

return;

}

const reports =
DDS.storage.get(
"inspections",
[]
);

const report = {

id:
"INS-"+Date.now(),

date:
new Date().toISOString(),

country:
document.getElementById(
"country"
)?.value || "India",

state:
document.getElementById(
"state"
)?.value || "",

district:
document.getElementById(
"district"
)?.value || "",

city:
document.getElementById(
"city"
)?.value || "",

lat:
parseFloat(
document.getElementById(
"latitude"
)?.value || 0
),

lng:
parseFloat(
document.getElementById(
"longitude"
)?.value || 0
),

structure:
document.getElementById(
"structureType"
)?.value || "",

area:
parseFloat(
document.getElementById(
"area"
)?.value || 0
),

severity:
cost.severity,

priority:
cost.priority,

timeline:
cost.timeline,

status:
"Not Started",

assignedTo:
"Unassigned",

finalCost:
Math.round(
cost.finalCost
),

cutDownCost:
Math.round(
cost.cutDown
),

weatherLog:
DDS.weather.current,

traffic:
DDS.traffic.current,

images:
DDS.analysis.images,

createdBy:
DDS.storage.get(
"auth",
{}
).email || ""

};

reports.push(report);

DDS.storage.set(
"inspections",
reports
);

alert(
"Report Saved Successfully"
);

window.dispatchEvent(
new StorageEvent(
"storage"
)
);

};
/* ==========================================
   DASHBOARD
========================================== */

DDS.dashboard = {};

DDS.dashboard.refreshDashboard = function(){

const reports =
DDS.storage.get(
"inspections",
[]
);

const totalReports =
document.getElementById(
"totalReports"
);

const totalCost =
document.getElementById(
"totalCost"
);

const criticalCount =
document.getElementById(
"criticalCount"
);

const progressCount =
document.getElementById(
"progressCount"
);

if(totalReports){

totalReports.innerText =
reports.length;

}

if(totalCost){

const sum =
reports.reduce(
(a,b)=>
a+(b.finalCost||0),
0
);

totalCost.innerText =
"Ôé╣"+sum.toLocaleString();

}

if(criticalCount){

criticalCount.innerText =
reports.filter(
x=>
x.priority==="Critical"
).length;

}

if(progressCount){

progressCount.innerText =
reports.filter(
x=>
x.status==="In Progress"
).length;

}

DDS.dashboard.renderRecent(
reports
);

};

DDS.dashboard.renderRecent =
function(reports){

const container =
document.getElementById(
"recentReports"
);

if(!container) return;

container.innerHTML = "";

reports
.slice(-5)
.reverse()
.forEach(r=>{

container.innerHTML += `

<div class="report-item">

<b>${r.id}</b>

<br>

${r.structure}

<br>

${r.city}

<br>

${r.assignedTo}

</div>

`;

});

};

/* ==========================================
   REPORT FILTERS
========================================== */

DDS.reports.getFilteredReports =
function(){

let reports =
DDS.storage.get(
"inspections",
[]
);

const search =
document.getElementById(
"searchReports"
)?.value
?.toLowerCase() || "";

const severity =
document.getElementById(
"severityFilter"
)?.value || "";

const priority =
document.getElementById(
"priorityFilter"
)?.value || "";

const status =
document.getElementById(
"statusFilter"
)?.value || "";

const assignment =
document.getElementById(
"assignmentFilter"
)?.value || "";

reports = reports.filter(r=>{

const matchesSearch =

!search ||

r.id
.toLowerCase()
.includes(search)

||

(r.city||"")
.toLowerCase()
.includes(search)

||

(r.structure||"")
.toLowerCase()
.includes(search);

const matchesSeverity =
!severity ||
r.severity===severity;

const matchesPriority =
!priority ||
r.priority===priority;

const matchesStatus =
!status ||
r.status===status;

const matchesAssign =
!assignment ||
r.assignedTo===assignment;

return

matchesSearch &&
matchesSeverity &&
matchesPriority &&
matchesStatus &&
matchesAssign;

});

return reports;

};

/* ==========================================
   REPORT TABLE
========================================== */

DDS.reports.refreshReports =
function(){

const tbody =
document.getElementById(
"reportsTableBody"
);

if(!tbody) return;

tbody.innerHTML = "";

const reports =
DDS.reports.getFilteredReports();

reports.forEach(report=>{

const row =
document.createElement(
"tr"
);

row.innerHTML = `

<td>

<input
type="checkbox"
class="reportCheck"
value="${report.id}">

</td>

<td>${report.id}</td>

<td>
${new Date(
report.date
).toLocaleDateString()}
</td>

<td>
${report.structure}
</td>

<td>
${report.city}
</td>

<td>
${report.severity}
</td>

<td>
<span class="badge
${DDS.reports.badgeClass(
report.priority
)}">
${report.priority}
</span>
</td>

<td>
${report.status}
</td>

<td>

<select
data-id="${report.id}"
class="assignmentSelect">

<option
${report.assignedTo==="Unassigned"?"selected":""}>
Unassigned
</option>

<option
${report.assignedTo==="Contractor A"?"selected":""}>
Contractor A
</option>

<option
${report.assignedTo==="Contractor B"?"selected":""}>
Contractor B
</option>

<option
${report.assignedTo==="PWD Team"?"selected":""}>
PWD Team
</option>

<option
${report.assignedTo==="NHAI Team"?"selected":""}>
NHAI Team
</option>

</select>

</td>

<td>
Ôé╣${(report.finalCost||0)
.toLocaleString()}
</td>

<td>
${report.timeline}
</td>

<td>
${report.weatherLog?.condition||"-"}
</td>

<td>

<button
onclick="DDS.reports.showGallery('${report.id}')">

Photos

</button>

</td>

<td>

<button
onclick="DDS.reports.deleteReport('${report.id}')">

Delete

</button>

</td>

`;

tbody.appendChild(row);

});

DDS.reports.bindAssignmentEvents();

};

/* ==========================================
   BADGES
========================================== */

DDS.reports.badgeClass =
function(priority){

switch(priority){

case "Low":
return "low";

case "Medium":
return "medium";

case "High":
return "high";

case "Very High":
return "veryhigh";

case "Critical":
return "critical";

default:
return "medium";

}

};

/* ==========================================
   ASSIGNMENTS
========================================== */

DDS.reports.bindAssignmentEvents =
function(){

document
.querySelectorAll(
".assignmentSelect"
)
.forEach(select=>{

select.onchange = ()=>{

const reports =
DDS.storage.get(
"inspections",
[]
);

const id =
select.dataset.id;

const report =
reports.find(
x=>x.id===id
);

if(report){

report.assignedTo =
select.value;

DDS.storage.set(
"inspections",
reports
);

}

};

});

};

/* ==========================================
   DELETE
========================================== */

DDS.reports.deleteReport =
function(id){

if(
!confirm(
"Delete report?"
)
) return;

let reports =
DDS.storage.get(
"inspections",
[]
);

reports =
reports.filter(
x=>x.id!==id
);

DDS.storage.set(
"inspections",
reports
);

DDS.reports.refreshReports();

};

/* ==========================================
   GALLERY
========================================== */

DDS.reports.showGallery =
function(id){

const reports =
DDS.storage.get(
"inspections",
[]
);

const report =
reports.find(
x=>x.id===id
);

if(!report) return;

const gallery =
document.getElementById(
"galleryContainer"
);

if(!gallery) return;

gallery.innerHTML = "";

(report.images||[])
.forEach(src=>{

gallery.innerHTML += `

<img
src="${src}"
class="thumbnail">

`;

});

};

/* ==========================================
   BULK ACTIONS
========================================== */

DDS.reports.applyBulkAction =
function(){

const action =
document.getElementById(
"bulkAction"
)?.value;

if(!action) return;

const selected =
Array.from(
document.querySelectorAll(
".reportCheck:checked"
)
)
.map(x=>x.value);

const reports =
DDS.storage.get(
"inspections",
[]
);

reports.forEach(r=>{

if(
!selected.includes(
r.id
)
) return;

switch(action){

case "notstarted":
r.status =
"Not Started";
break;

case "inprogress":
r.status =
"In Progress";
break;

case "completed":
r.status =
"Completed";
break;

case "assignA":
r.assignedTo =
"Contractor A";
break;

case "assignB":
r.assignedTo =
"Contractor B";
break;

case "assignPWD":
r.assignedTo =
"PWD Team";
break;

case "assignNHAI":
r.assignedTo =
"NHAI Team";
break;

}

});

DDS.storage.set(
"inspections",
reports
);

DDS.reports.refreshReports();

};

/* ==========================================
   KANBAN
========================================== */

DDS.kanban.refresh =
function(){

const reports =
DDS.storage.get(
"inspections",
[]
);

const ns =
document.getElementById(
"notStartedColumn"
);

const ip =
document.getElementById(
"inProgressColumn"
);

const cp =
document.getElementById(
"completedColumn"
);

if(!ns) return;

ns.innerHTML="";
ip.innerHTML="";
cp.innerHTML="";

reports.forEach(r=>{

const card =
DDS.kanban.createCard(r);

if(
r.status==="Not Started"
){

ns.appendChild(card);

}

else if(
r.status==="In Progress"
){

ip.appendChild(card);

}

else{

cp.appendChild(card);

}

});

};

DDS.kanban.createCard =
function(report){

const div =
document.createElement(
"div"
);

div.className =
"kanban-card";

div.draggable = true;

div.dataset.id =
report.id;

div.innerHTML = `

<b>${report.id}</b>

<br>

${report.structure}

<br>

${report.city}

<br>

<span class="badge
${DDS.reports.badgeClass(
report.priority
)}">

${report.priority}

</span>

<br>

${report.assignedTo}

`;

return div;

};
/* ==========================================
   EXPORTS
========================================== */

DDS.export.csv = function(){

const reports =
DDS.storage.get(
"inspections",
[]
);

let csv =
"ID,Date,Structure,City,Severity,Priority,Status,AssignedTo,Cost\n";

reports.forEach(r=>{

csv +=

`${r.id},
${r.date},
${r.structure},
${r.city},
${r.severity},
${r.priority},
${r.status},
${r.assignedTo},
${r.finalCost}\n`;

});

const blob =
new Blob(
[csv],
{type:"text/csv"}
);

const a =
document.createElement("a");

a.href =
URL.createObjectURL(blob);

a.download =
"inspections.csv";

a.click();

};

/* ==========================================
   EXCEL
========================================== */

DDS.export.excel = function(){

const reports =
DDS.storage.get(
"inspections",
[]
);

const ws =
XLSX.utils.json_to_sheet(
reports
);

const wb =
XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
wb,
ws,
"Reports"
);

XLSX.writeFile(
wb,
"inspections.xlsx"
);

};

/* ==========================================
   GEOJSON
========================================== */

DDS.export.geojson =
function(){

const reports =
DDS.storage.get(
"inspections",
[]
);

const geojson = {

type:
"FeatureCollection",

features:

reports.map(r=>({

type:"Feature",

geometry:{

type:"Point",

coordinates:[
r.lng||0,
r.lat||0
]

},

properties:r

}))

};

const blob =
new Blob(

[
JSON.stringify(
geojson,
null,
2
)
],

{
type:
"application/json"
}

);

const a =
document.createElement("a");

a.href =
URL.createObjectURL(blob);

a.download =
"inspections.geojson";

a.click();

};

/* ==========================================
   PDF REPORT
========================================== */

DDS.export.pdf =
async function(){

const table =
document.getElementById(
"reportsTable"
);

if(!table) return;

const canvas =
await html2canvas(
table
);

const img =
canvas.toDataURL(
"image/png"
);

const pdf =
new jspdf.jsPDF(
"p",
"mm",
"a4"
);

pdf.setFontSize(16);

pdf.text(
"AI Infrastructure DDS Report",
10,
15
);

pdf.addImage(

img,

"PNG",

10,

25,

190,

0

);

pdf.save(
"reports.pdf"
);

};

/* ==========================================
   INSPECTION PDF
========================================== */

DDS.export.inspectionPDF =
async function(){

const card =
document.getElementById(
"costCard"
);

if(!card) return;

const canvas =
await html2canvas(
card
);

const img =
canvas.toDataURL(
"image/png"
);

const pdf =
new jspdf.jsPDF();

pdf.text(
"Inspection Cost Report",
10,
10
);

pdf.addImage(
img,
"PNG",
10,
20,
180,
0
);

pdf.save(
"inspection.pdf"
);

};

/* ==========================================
   WHATSAPP
========================================== */

DDS.export.shareWhatsApp =
function(){

const cost =
DDS.cost.calculate();

if(!cost) return;

const msg =

`AI Infrastructure DDS

Severity:
${cost.severity}

Priority:
${cost.priority}

Estimated Cost:
Ôé╣${Math.round(cost.finalCost)}

Timeline:
${cost.timeline}`;

window.open(

"https://wa.me/?text=" +

encodeURIComponent(msg)

);

};

/* ==========================================
   KANBAN DRAG DROP
========================================== */

DDS.kanban.bindEvents =
function(){

document
.querySelectorAll(
".kanban-card"
)
.forEach(card=>{

card.addEventListener(
"dragstart",
e=>{

e.dataTransfer.setData(
"text",
card.dataset.id
);

}
);

});

document
.querySelectorAll(
".kanban-dropzone"
)
.forEach(zone=>{

zone.addEventListener(
"dragover",
e=>{
e.preventDefault();
}
);

zone.addEventListener(
"drop",
e=>{

e.preventDefault();

const id =
e.dataTransfer.getData(
"text"
);

DDS.kanban.moveCard(
id,
zone.id
);

}
);

});

};

DDS.kanban.moveCard =
function(id,target){

const reports =
DDS.storage.get(
"inspections",
[]
);

const report =
reports.find(
x=>x.id===id
);

if(!report) return;

switch(target){

case "notStartedColumn":

report.status =
"Not Started";

break;

case "inProgressColumn":

report.status =
"In Progress";

break;

case "completedColumn":

report.status =
"Completed";

break;

}

DDS.storage.set(
"inspections",
reports
);

DDS.kanban.refresh();

};

/* ==========================================
   SEARCH LISTENERS
========================================== */

DDS.reports.bindEvents =
function(){

const search =
document.getElementById(
"searchReports"
);

if(search){

search.addEventListener(
"input",
DDS.reports.refreshReports
);

}

[
"severityFilter",
"priorityFilter",
"statusFilter",
"assignmentFilter"
]
.forEach(id=>{

const el =
document.getElementById(id);

if(el){

el.addEventListener(
"change",
DDS.reports.refreshReports
);

}

});

const bulkBtn =
document.getElementById(
"applyBulkAction"
);

if(bulkBtn){

bulkBtn.onclick =
DDS.reports.applyBulkAction;

}

const refreshBtn =
document.getElementById(
"refreshReports"
);

if(refreshBtn){

refreshBtn.onclick =
DDS.reports.refreshReports;

}

};

/* ==========================================
   INSPECT EVENTS
========================================== */

DDS.analysis.bindInspectEvents =
function(){

const upload =
document.getElementById(
"imageUpload"
);

if(upload){

upload.addEventListener(
"change",
e=>{

DDS.analysis.handleImages(
e.target.files
);

}
);

}

const calcBtn =
document.getElementById(
"calculateBtn"
);

if(calcBtn){

calcBtn.onclick =
DDS.cost.calculate;

}

const saveBtn =
document.getElementById(
"saveReportBtn"
);

if(saveBtn){

saveBtn.onclick =
DDS.reports.saveReport;

}

const pdfBtn =
document.getElementById(
"pdfBtn"
);

if(pdfBtn){

pdfBtn.onclick =
DDS.export.inspectionPDF;

}

const shareBtn =
document.getElementById(
"shareBtn"
);

if(shareBtn){

shareBtn.onclick =
DDS.export.shareWhatsApp;

}

const locBtn =
document.getElementById(
"getLocationBtn"
);

if(locBtn){

locBtn.onclick =
DDS.maps.getCurrentLocation;

}

};

/* ==========================================
   REPORT EXPORT EVENTS
========================================== */

DDS.export.bindEvents =
function(){

const csv =
document.getElementById(
"exportCSV"
);

if(csv){

csv.onclick =
DDS.export.csv;

}

const excel =
document.getElementById(
"exportExcel"
);

if(excel){

excel.onclick =
DDS.export.excel;

}

const geo =
document.getElementById(
"exportGeoJSON"
);

if(geo){

geo.onclick =
DDS.export.geojson;

}

const pdf =
document.getElementById(
"exportPDF"
);

if(pdf){

pdf.onclick =
DDS.export.pdf;

}

};

/* ==========================================
   PAGE INITIALIZER
========================================== */

DDS.init = function(){

DDS.ui.initTheme();

DDS.ui.updateOfflineBanner();

DDS.weather.refresh();

DDS.traffic.refresh();

DDS.analysis.bindInspectEvents();

DDS.reports.bindEvents();

DDS.export.bindEvents();

if(
document.getElementById(
"reportsTableBody"
)
){

DDS.reports.refreshReports();

}

if(
document.getElementById(
"notStartedColumn"
)
){

DDS.kanban.refresh();

setTimeout(()=>{

DDS.kanban.bindEvents();

},500);

}

if(
document.getElementById(
"totalReports"
)
){

DDS.dashboard.refreshDashboard();

}

};

document.addEventListener(
"DOMContentLoaded",
DDS.init
);
window.addEventListener("pageshow", () => {
    if (
        document.getElementById("totalReports")
    ) {
        DDS.dashboard.refreshDashboard();
    }
});
/* ==========================================
   STORAGE SYNC
========================================== */

window.addEventListener(
"storage",
()=>{

if(
document.getElementById(
"reportsTableBody"
)
){

DDS.reports.refreshReports();

}

if(
document.getElementById(
"notStartedColumn"
)
){

DDS.kanban.refresh();

}

if(
document.getElementById(
"totalReports"
)
){

DDS.dashboard.refreshDashboard();

}

}
);
const themeBtn =
document.getElementById(
"themeToggle"
);

if(themeBtn){

themeBtn.addEventListener(
"click",
DDS.ui.toggleTheme
);

}
// ======================
// DASHBOARD CHARTS
// ======================

if (document.getElementById("severityChart")) {

    const severityCtx =
        document.getElementById("severityChart");

    new Chart(severityCtx, {
        type: "doughnut",
        data: {
            labels: ["Low", "Moderate", "High", "Very High", "Critical",],
            datasets: [{
                data: [4,12,5,2, 4,],
                backgroundColor: [
                    "#52c41a",
                    "#facc15",
                    "#f97316",
                    "#ef4444",
                    "#991b1b",
                    
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

}

if (document.getElementById("citySeverityChart")) {

    const cityCtx =
        document.getElementById("citySeverityChart");

    new Chart(cityCtx, {
        type: "bar",
        data: {
            labels: [
                "Bengaluru",
                "Mumbai",
                "Chennai",
                "Hyderabad"
            ],
            datasets: [
                {
                    label: "Severe",
                    data: [1,0,0,3],
                    backgroundColor:"#ff4d4f"
                },
                {
                    label: "Moderate",
                    data:[0,1,0,1],
                    backgroundColor:"#faad14"
                },
                {
                    label:"Good",
                    data:[0,0,1,0],
                    backgroundColor:"#52c41a"
                }
            ]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });

}

function showMap(type){

document.getElementById("damageMap").style.display="none";
document.getElementById("trafficMap").style.display="none";
document.getElementById("overlayMap").style.display="none";

document.getElementById("damageBtn").classList.remove("active");
document.getElementById("trafficBtn").classList.remove("active");
document.getElementById("overlayBtn").classList.remove("active");

if(type==="damage"){
    document.getElementById("damageMap").style.display="block";
    document.getElementById("damageBtn").classList.add("active");
}

if(type==="traffic"){
    document.getElementById("trafficMap").style.display="block";
    document.getElementById("trafficBtn").classList.add("active");
}

if(type==="overlay"){
    document.getElementById("overlayMap").style.display="block";
    document.getElementById("overlayBtn").classList.add("active");
}
}
const glow = document.getElementById("cursor-glow");

document.addEventListener("mousemove",(e)=>{
    if(glow){
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    }
});
