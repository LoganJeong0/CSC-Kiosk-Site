function todayShort() {
  return new Date().toLocaleDateString('en-US');
}

async function main() {
    let todaySched = [];
    const rooms = [
    ["Classroom 1",        "↑"],
    ["Classroom 2",        "↑"],
    ["Classroom 3",        "→"],
    ["Procedural Skills",  "→"],
    ["Conference Room",    "→"],
    ["Sim Lab 1",          "→"],
    ["Sim Lab 2",          "→"],
    ["Sim Lab 3",          "→"],
    ["Exam Rooms 13 & 17", "←"]
    ];

  

  const res = await fetch('schedule/week.txt');      // path is relative to the HTML file
  if (!res.ok) {                             // like checking fopen() for NULL
    console.log('Could not open file: ' + res.status);
    return;
  }
  const text = await res.text();             // entire file as one string

  const lines = text.split(/\r?\n/);   // handles both \n and \r\n line endings
  for (let i = 0; i < lines.length; i++) {
    const sections = lines[i].split('\t');      //[date, title, room]
    let arrow = "Unknown";
    if(sections[0] == todayShort() && sections[2] != "Offsite 1"){
        for (let j = 0; j < rooms.length; j++){
            if (sections[2] == rooms[j][0]){
                arrow = rooms[j][1]
                break;
            }
        }
        const event = [sections[1], sections[2], arrow]
        todaySched.push(event);
    }
}
renderEvents(todaySched);
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
