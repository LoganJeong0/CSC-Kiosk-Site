function todayShort() {
  return new Date().toLocaleDateString('en-US');
}

function toMilitary(hour, tag){
  tag = tag.toLowerCase();
  if (tag == "pm" && hour != 12){ 
    hour += 12;
  }
  if (tag == "am" && hour == 12){ 
    hour = 0;
  }
  return hour;
}


function toMinutes(timeText){
  const [clock, tag] = timeText.trim().split(' ');   // "2:30", "PM"
  const [hour, minute] = clock.split(':').map(Number);
  return toMilitary(hour, tag || '') * 60 + minute;
}


let todaySched = [];

// Shows only the events that haven't ended yet
function showUpcoming(){
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = todaySched.filter((event) => {
    const end = toMinutes(event[3]);
    return isNaN(end) || end > nowMinutes;   // keep events with a missing/garbled end time
  });
  renderEvents(upcoming);
}

async function main() {
    const sched = [];
    const rooms = [
    ["Classroom 1",        "↑"],
    ["Classroom 2",        "↑"],
    ["Classroom 3",        "→"],
    ["Procedural Skills",  "→"],
    ["Conference Room",    "→"],
    ["Sim Lab 1",          "→"],
    ["Sim Lab 2",          "→"],
    ["Sim Lab 3",          "→"],
    ["Exam 13 & 17", "←"]
    ];

  

  // ?t= makes each request unique so the browser can't hand back an old cached copy
  const res = await fetch('schedule/week.txt?t=' + Date.now());      // path is relative to the HTML file
  if (!res.ok) {                             // like checking fopen() for NULL
    console.log('Could not open file: ' + res.status);
    return;
  }
  const text = await res.text();             // entire file as one string

  const lines = text.split(/\r?\n/);   // handles both \n and \r\n line endings
  for (let i = 0; i < lines.length; i++) {
    const sections = lines[i].split('\t');      //[date, title, end time, room]
    let arrow = "Unknown";
    if(sections[0] == todayShort() && sections[3] != "Offsite 1"){
        for (let j = 0; j < rooms.length; j++){
            if (sections[3] == rooms[j][0]){
                arrow = rooms[j][1]
                break;
            }
        }
        const event = [sections[1], sections[3], arrow, sections[2] || '']
        sched.push(event);
    }
}
// Swap in the new list only after the file loaded fine, so a failed download keeps the old one
todaySched = sched;
showUpcoming();
}

function renderEvents(events) {
  const list = document.getElementById('event-list');
  list.textContent = '';                      // clear old entries so a rerun doesn't duplicate them

  if (events.length === 0) {
    const h1 = document.createElement('p');
    h1.textContent = 'No events scheduled today';
    list.appendChild(h1);
    return;
  }

  events.forEach((event, i) => {
    const [title, room, arrow] = event;

    // <h2><b>title</b><span>arrow</span></h2>
    const h2 = document.createElement('h2');
    const name = document.createElement('b');
    name.textContent = title;
    const dir = document.createElement('span');
    dir.textContent = arrow;
    h2.append(name, dir);

    // <p><b>room</b></p>
    const p = document.createElement('p');
    const roomText = document.createElement('b');
    roomText.textContent = room;
    p.appendChild(roomText);

    list.append(h2, p);

    // divider between entries, but not after the last one
    if (i < events.length - 1) {
      list.append(document.createElement('br'), document.createElement('hr'));
    }
  });
}

main();
setInterval(showUpcoming, 60 * 1000);   // drop ended events every minute
setInterval(main, 10 * 60 * 1000);      // re-download week.txt every 10 minutes (new uploads, new day)
