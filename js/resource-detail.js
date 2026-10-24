/* Resource detail page.
   URL format:  resource-detail.html?topic=coding   (a different link per resource)

   Helpers used in the data below:
     L(title, url)      -> clickable link
     B(title, author)   -> book (plain text, no link)
   NOTES: paste your Drive links into each topic's `notes: []` array, e.g.
     notes: [ L('DSA Handwritten Notes', 'https://drive.google.com/...') ]
*/
(function () {
  var L = function (title, url) { return { title: title, url: url }; };
  var B = function (title, by) { return { title: title, by: by }; };
  var YT = function (q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); };
  var G  = function (q) { return 'https://www.google.com/search?q=' + encodeURIComponent(q); };

  var CATEGORIES = [
    { key: 'websites', label: 'Some Good Websites to Study' },
    { key: 'youtube',  label: 'Some Good YouTube Channels' },
    { key: 'books',    label: 'Some Good Books' },
    { key: 'notes',    label: 'Notes' },
    { key: 'extra',    label: 'Extra Materials for Exam or Practicals' },
    { key: 'cho',      label: 'CHO' }   // currently filled with cheat sheets / quick revision
  ];

  var TOPICS = {
    'quantitative-aptitude': {
      title: 'Quantitative Aptitude',
      desc: 'Percentages, profit & loss, time-speed-distance and more.',
      websites: [
        L('IndiaBIX – Aptitude', 'https://www.indiabix.com/aptitude/questions-and-answers/'),
        L('PrepInsta', 'https://prepinsta.com/'),
        L('FacePrep', 'https://www.faceprep.in/'),
        L('GeeksforGeeks', 'https://www.geeksforgeeks.org/')
      ],
      youtube: [
        L('CareerRide', 'https://www.youtube.com/@CareerRide'),
        L('Search: Placement aptitude tricks', YT('placement aptitude quantitative tricks'))
      ],
      books: [
        B('Quantitative Aptitude for Competitive Examinations', 'R.S. Aggarwal'),
        B('Fast Track Objective Arithmetic', 'Rajesh Verma'),
        B('How to Prepare for Quantitative Aptitude for CAT', 'Arun Sharma')
      ],
      notes: [L('Quantitative Aptitude Notes (Drive)', 'https://drive.google.com/drive/folders/1fng2hFWxIWxJtxMwzlnd4mynkYTOdxsP?usp=drive_link')],
      extra: [
        L('PrepInsta – Placement papers', 'https://prepinsta.com/'),
        L('IndiaBIX – Company-wise questions', 'https://www.indiabix.com/placement-papers/companies/')
      ],
      cho: [L('Search: Aptitude formula sheet PDF', G('placement aptitude formula sheet pdf'))]
    },

    'logical-reasoning': {
      title: 'Logical Reasoning',
      desc: 'Puzzles, seating arrangements, series and blood relations.',
      websites: [
        L('IndiaBIX – Logical Reasoning', 'https://www.indiabix.com/logical-reasoning/questions-and-answers/'),
        L('IndiaBIX – Non-Verbal Reasoning', 'https://www.indiabix.com/non-verbal-reasoning/questions-and-answers/'),
        L('PrepInsta', 'https://prepinsta.com/'),
        L('FacePrep', 'https://www.faceprep.in/')
      ],
      youtube: [
        L('CareerRide', 'https://www.youtube.com/@CareerRide'),
        L('Search: Seating arrangement & puzzles', YT('placement logical reasoning puzzles seating arrangement'))
      ],
      books: [
        B('A Modern Approach to Verbal & Non-Verbal Reasoning', 'R.S. Aggarwal'),
        B('Analytical Reasoning', 'M.K. Pandey'),
        B('How to Prepare for Logical Reasoning & Data Interpretation for CAT', 'Arun Sharma')
      ],
      notes: [L('Logical Reasoning Notes (Drive)', 'https://drive.google.com/drive/folders/152HegrcFYVPvZFBu8RxqiL-HUgtyaBpI?usp=drive_link')],
      extra: [
        L('IndiaBIX – Company-wise questions', 'https://www.indiabix.com/placement-papers/companies/'),
        L('PrepInsta – Reasoning practice', 'https://prepinsta.com/')
      ],
      cho: [L('Search: Reasoning shortcuts PDF', G('logical reasoning shortcuts cheat sheet pdf'))]
    },

    'verbal-ability': {
      title: 'Verbal Ability',
      desc: 'Grammar, reading comprehension and vocabulary.',
      websites: [
        L('IndiaBIX – Verbal Ability', 'https://www.indiabix.com/verbal-ability/questions-and-answers/'),
        L('British Council LearnEnglish', 'https://learnenglish.britishcouncil.org/'),
        L('Vocabulary.com', 'https://www.vocabulary.com/'),
        L('Merriam-Webster', 'https://www.merriam-webster.com/')
      ],
      youtube: [
        L('BBC Learning English', 'https://www.youtube.com/@bbclearningenglish'),
        L('English with Lucy', 'https://www.youtube.com/@EnglishwithLucy'),
        L("Rachel's English", 'https://www.youtube.com/@rachelsenglish')
      ],
      books: [
        B('Word Power Made Easy', 'Norman Lewis'),
        B('High School English Grammar & Composition', 'Wren & Martin'),
        B('Objective General English', 'S.P. Bakshi')
      ],
      notes: [L('Verbal Ability Notes (Drive)', 'https://drive.google.com/drive/u/0/folders/16Qwf80NPuMmvf_UxMOt6ZWJ9t4-UQr8K')],
      extra: [
        L('EnglishClub – Grammar & idioms', 'https://www.englishclub.com/'),
        L('IndiaBIX – Reading comprehension', 'https://www.indiabix.com/verbal-ability/comprehension/')
      ],
      cho: [L('Search: Grammar rules cheat sheet', G('english grammar rules cheat sheet pdf'))]
    },

    'coding': {
      title: 'Coding',
      desc: 'Programming basics and problem-solving across C, C++, Java, Python and JavaScript.',
      websites: [
        L('GeeksforGeeks', 'https://www.geeksforgeeks.org/'),
        L('W3Schools', 'https://www.w3schools.com/'),
        L('freeCodeCamp', 'https://www.freecodecamp.org/'),
        L('Programiz', 'https://www.programiz.com/'),
        L('MDN Web Docs (JavaScript)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'),
        L('HackerRank', 'https://www.hackerrank.com/')
      ],
      youtube: [
        L('CodeWithHarry', 'https://www.youtube.com/@CodeWithHarry'),
        L('Apna College', 'https://www.youtube.com/@ApnaCollegeOfficial'),
        L('freeCodeCamp.org', 'https://www.youtube.com/@freecodecamp'),
        L('Telusko', 'https://www.youtube.com/@Telusko'),
        L('Programming with Mosh', 'https://www.youtube.com/@programmingwithmosh')
      ],
      books: [
        B('Let Us C', 'Yashavant Kanetkar'),
        B('Head First Java', 'Kathy Sierra & Bert Bates'),
        B('Python Crash Course', 'Eric Matthes'),
        B('Cracking the Coding Interview', 'Gayle Laakmann McDowell')
      ],
      notes: [L('Coding Notes (Drive)', 'https://drive.google.com/drive/folders/1wmSoNISZulTlZdT9ui7pweTkTK8uOam2?usp=drive_link')],
      extra: [
        L('OnlineGDB – Online compiler', 'https://www.onlinegdb.com/'),
        L('CodeChef', 'https://www.codechef.com/'),
        L('Codeforces', 'https://codeforces.com/')
      ],
      cho: [
        L('Python Cheat Sheet', 'https://www.pythoncheatsheet.org/'),
        L('DevHints (JS, C++, Git…)', 'https://devhints.io/')
      ]
    },

    'dsa': {
      title: 'DSA',
      desc: 'Arrays, strings, linked lists, stacks, queues, searching and sorting.',
      websites: [
        L('LeetCode', 'https://leetcode.com/'),
        L('GeeksforGeeks DSA', 'https://www.geeksforgeeks.org/dsa/dsa-tutorial-learn-data-structures-and-algorithms/'),
        L('NeetCode', 'https://neetcode.io/'),
        L('VisuAlgo – Visualisations', 'https://visualgo.net/'),
        L('Data Structure Visualizer (USFCA)', 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html')
      ],
      youtube: [
        L('take U forward (Striver)', 'https://www.youtube.com/@takeUforward'),
        L('NeetCode', 'https://www.youtube.com/@NeetCode'),
        L('Abdul Bari', 'https://www.youtube.com/@abdul_bari'),
        L('Love Babbar', 'https://www.youtube.com/@LoveBabbar'),
        L('Apna College', 'https://www.youtube.com/@ApnaCollegeOfficial')
      ],
      books: [
        B('Introduction to Algorithms (CLRS)', 'Cormen, Leiserson, Rivest, Stein'),
        B('Data Structures and Algorithms Made Easy', 'Narasimha Karumanchi'),
        B('Grokking Algorithms', 'Aditya Bhargava'),
        B('Cracking the Coding Interview', 'Gayle Laakmann McDowell')
      ],
      notes: [L('DSA Notes (Drive)', 'https://drive.google.com/drive/folders/1wYKp5F4HiJw7NTFMyNhEgGsGEJSG38cz')],
      extra: [
        L('NeetCode 150 / Blind 75 practice list', 'https://neetcode.io/practice'),
        L("Striver's SDE Sheet", 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/'),
        L('HackerRank – Problem Solving', 'https://www.hackerrank.com/domains/algorithms')
      ],
      cho: [
        L('Big-O Cheat Sheet', 'https://www.bigocheatsheet.com/'),
        L('Search: DSA patterns cheat sheet', G('dsa patterns cheat sheet coding interview'))
      ]
    },

    'oop': {
      title: 'OOP',
      desc: 'Classes, objects, inheritance, polymorphism and design principles.',
      websites: [
        L('GeeksforGeeks', 'https://www.geeksforgeeks.org/'),
        L('Refactoring Guru – Design Patterns', 'https://refactoring.guru/design-patterns'),
        L('JavaTpoint', 'https://www.javatpoint.com/'),
        L('Programiz', 'https://www.programiz.com/')
      ],
      youtube: [
        L('Telusko (Java OOP)', 'https://www.youtube.com/@Telusko'),
        L('Apna College', 'https://www.youtube.com/@ApnaCollegeOfficial'),
        L('Programming with Mosh', 'https://www.youtube.com/@programmingwithmosh'),
        L('Search: OOP concepts interview', YT('OOP concepts interview questions placement'))
      ],
      books: [
        B('Object-Oriented Programming with C++', 'E. Balagurusamy'),
        B('Head First Object-Oriented Analysis and Design', 'McLaughlin, Pollice & West'),
        B('Head First Design Patterns', 'Freeman & Robson'),
        B('Effective Java', 'Joshua Bloch')
      ],
      notes: [L('OOP Notes (Drive)', 'https://drive.google.com/drive/folders/1QZcR-fHahRMeeNIP6nqbNnTRI6cyhYG0')],
      extra: [
        L('SOLID principles – overview', G('SOLID principles explained with examples')),
        L('Refactoring Guru – Refactoring', 'https://refactoring.guru/refactoring')
      ],
      cho: [L('Search: OOP cheat sheet', G('OOP concepts cheat sheet pdf'))]
    },

    'dbms': {
      title: 'DBMS',
      desc: 'SQL queries, normalization, transactions and database design.',
      websites: [
        L('SQLBolt – Interactive SQL lessons', 'https://sqlbolt.com/'),
        L('W3Schools SQL', 'https://www.w3schools.com/sql/'),
        L('SQLZoo', 'https://sqlzoo.net/'),
        L('GeeksforGeeks DBMS', 'https://www.geeksforgeeks.org/')
      ],
      youtube: [
        L('Gate Smashers', 'https://www.youtube.com/@GateSmashers'),
        L("Jenny's Lectures CS/IT", 'https://www.youtube.com/@JennyslecturesCSIT'),
        L('Knowledge Gate', 'https://www.youtube.com/@KnowledgeGATE'),
        L('Neso Academy', 'https://www.youtube.com/@nesoacademy')
      ],
      books: [
        B('Database System Concepts', 'Silberschatz, Korth & Sudarshan'),
        B('Fundamentals of Database Systems', 'Elmasri & Navathe'),
        B('Database Management Systems', 'Raghu Ramakrishnan & Johannes Gehrke')
      ],
      notes: [L('DBMS Notes (LetsHelp)', 'https://www.letshelp.co.in/year/CSE-2nd/cmgj9kahp000ch00wtjt0ikja/Notes')],
      extra: [
        L('LeetCode – Database problems', 'https://leetcode.com/problemset/database/'),
        L('HackerRank – SQL', 'https://www.hackerrank.com/domains/sql'),
        L('Oracle Live SQL', 'https://livesql.oracle.com/'),
        L('DB Fiddle – Online SQL playground', 'https://www.db-fiddle.com/')
      ],
      cho: [L('SQL Cheat Sheet', 'https://www.sqltutorial.org/sql-cheat-sheet/')]
    },

    'operating-systems': {
      title: 'Operating Systems',
      desc: 'Processes, scheduling, memory management and deadlocks.',
      websites: [
        L('OSTEP – Operating Systems: Three Easy Pieces (free)', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'),
        L('GeeksforGeeks OS', 'https://www.geeksforgeeks.org/'),
        L('TutorialsPoint OS', 'https://www.tutorialspoint.com/operating_system/index.htm'),
        L('JavaTpoint OS', 'https://www.javatpoint.com/operating-system')
      ],
      youtube: [
        L('Gate Smashers', 'https://www.youtube.com/@GateSmashers'),
        L("Jenny's Lectures CS/IT", 'https://www.youtube.com/@JennyslecturesCSIT'),
        L('Knowledge Gate', 'https://www.youtube.com/@KnowledgeGATE'),
        L('Neso Academy', 'https://www.youtube.com/@nesoacademy')
      ],
      books: [
        B('Operating System Concepts', 'Silberschatz, Galvin & Gagne'),
        B('Modern Operating Systems', 'Andrew S. Tanenbaum'),
        B('Operating Systems: Three Easy Pieces', 'Remzi & Andrea Arpaci-Dusseau')
      ],
      notes: [L('All the Operating System Concepts You Need to Know (Medium)', 'https://medium.com/@harshpreet0402/all-the-operating-system-concepts-you-need-to-know-b697bfeb3f9f')],
      extra: [
        L('OverTheWire Bandit – Linux practice', 'https://overthewire.org/wargames/bandit/'),
        L('Search: OS interview questions', G('operating system interview questions placement'))
      ],
      cho: [L('Search: OS scheduling algorithms cheat sheet', G('operating system cheat sheet scheduling deadlock paging'))]
    },

    'computer-networks': {
      title: 'Computer Networks',
      desc: 'OSI model, TCP/IP, routing and common interview questions.',
      websites: [
        L('Cloudflare Learning Center', 'https://www.cloudflare.com/learning/'),
        L('Practical Networking', 'https://www.practicalnetworking.net/'),
        L('GeeksforGeeks CN', 'https://www.geeksforgeeks.org/'),
        L('Cisco Networking Academy', 'https://www.netacad.com/')
      ],
      youtube: [
        L('Gate Smashers', 'https://www.youtube.com/@GateSmashers'),
        L("Jenny's Lectures CS/IT", 'https://www.youtube.com/@JennyslecturesCSIT'),
        L('Neso Academy', 'https://www.youtube.com/@nesoacademy'),
        L('Knowledge Gate', 'https://www.youtube.com/@KnowledgeGATE')
      ],
      books: [
        B('Computer Networking: A Top-Down Approach', 'Kurose & Ross'),
        B('Computer Networks', 'Andrew S. Tanenbaum'),
        B('Data Communications and Networking', 'Behrouz A. Forouzan')
      ],
      notes: [L('Computer Networks Notes (Drive)', 'https://drive.google.com/drive/folders/1drRtAH3dJnwRBJ1tSOGToRKnrL0DmXA7?usp=drive_link')],
      extra: [
        L('Wireshark – Packet analysis tool', 'https://www.wireshark.org/'),
        L('Search: CN interview questions', G('computer networks interview questions placement'))
      ],
      cho: [L('Search: OSI vs TCP/IP & subnetting cheat sheet', G('computer networks cheat sheet osi tcp ip subnetting'))]
    },

    'technical-interviews': {
      title: 'Technical Interviews',
      desc: 'Common technical interview questions and how to answer them.',
      websites: [
        L('GeeksforGeeks – Interview Corner', 'https://www.geeksforgeeks.org/interview-experiences/company-interview-corner/'),
        L('InterviewBit', 'https://www.interviewbit.com/'),
        L('LeetCode – Interview', 'https://leetcode.com/explore/interview/'),
        L('Pramp – Free mock interviews', 'https://www.pramp.com/'),
        L('Tech Interview Handbook', 'https://www.techinterviewhandbook.org/')
      ],
      youtube: [
        L('take U forward (Striver)', 'https://www.youtube.com/@takeUforward'),
        L('Apna College', 'https://www.youtube.com/@ApnaCollegeOfficial'),
        L('NeetCode', 'https://www.youtube.com/@NeetCode')
      ],
      books: [
        B('Cracking the Coding Interview', 'Gayle Laakmann McDowell'),
        B('Programming Interviews Exposed', 'John Mongan, Noah Kindler & Eric Giguère')
      ],
      notes: [L('Tech Interview Handbook – Coding interview prep guide', 'https://www.techinterviewhandbook.org/coding-interview-prep/')],
      extra: [L('InterviewBit – Mock interviews', 'https://www.interviewbit.com/mock-interview/')],
      cho: [L('Tech Interview Handbook – Algorithms study cheat sheet', 'https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/')]
    },

    'hr-interviews': {
      title: 'HR Interviews',
      desc: 'Behavioural questions, resume walkthroughs and communication tips.',
      websites: [
        L('Indeed – Interview Tips', 'https://www.indeed.com/career-advice/interviewing'),
        L('The Muse – Interview questions & answers', 'https://www.themuse.com/advice/interview-questions-and-answers'),
        L('Glassdoor – Interview questions', 'https://www.glassdoor.co.in/Interview/index.htm'),
        L('LinkedIn Learning – Interview tips', 'https://www.linkedin.com/learning/search?keywords=job%20interview')
      ],
      youtube: [
        L('Search: Jeff Su – interview tips', YT('Jeff Su job interview tips')),
        L('Search: Andrew LaCivita – interview questions', YT('Andrew LaCivita interview questions and answers'))
      ],
      books: [
        B("Knock 'em Dead Job Interview", 'Martin Yate'),
        B('101 Great Answers to the Toughest Interview Questions', 'Ron Fry')
      ],
      notes: [L('Indeed – Top interview questions and answers', 'https://www.indeed.com/career-advice/interviewing/top-interview-questions-and-answers')],
      extra: [L('Search: STAR method guide', G('STAR method interview answers guide with examples'))],
      cho: [L('Search: Common HR questions cheat sheet', G('common HR interview questions and answers cheat sheet'))]
    }
  };

  var ICON = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M50 2 70 22 50 42 30 22z"/><path d="M26 26 46 46 26 66 6 46z"/>' +
    '<path d="M74 26 94 46 74 66 54 46z"/><path d="M50 50 70 70 50 90 30 70z"/></svg>';

  var params = new URLSearchParams(window.location.search);
  var topicKey = params.get('topic');
  // hasOwnProperty: only our own topics count, not built-in names
  // like "toString" that every object has.
  var topic = Object.prototype.hasOwnProperty.call(TOPICS, topicKey) ? TOPICS[topicKey] : null;

  var grid = document.getElementById('rd-grid');
  var panel = document.getElementById('rd-panel');
  var panelTitle = document.getElementById('rd-panel-title');
  var panelList = document.getElementById('rd-panel-list');

  if (!topic) {
    document.getElementById('rd-notfound').style.display = 'block';
    return;
  }

  document.title = topic.title + ' | Placement Prep Portal';
  document.getElementById('rd-title').textContent = topic.title;
  document.getElementById('rd-desc').textContent = topic.desc;

  CATEGORIES.forEach(function (cat) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rd-card';
    btn.innerHTML = '<span class="rd-icon">' + ICON + '</span><h3></h3>';
    btn.querySelector('h3').textContent = cat.label;
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(grid.children, function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      showPanel(cat);
    });
    grid.appendChild(btn);
  });

  function showPanel(cat) {
    var items = topic[cat.key] || [];
    panelTitle.textContent = topic.title + ' — ' + cat.label;
    panelList.innerHTML = '';

    if (!items.length) {
      var empty = document.createElement('li');
      empty.className = 'rd-empty';
      empty.textContent = 'Resources coming soon.';
      panelList.appendChild(empty);
    } else {
      items.forEach(function (item) {
        var li = document.createElement('li');
        var el;
        if (item.url) {
          el = document.createElement('a');
          el.href = item.url;
          el.target = '_blank';
          el.rel = 'noopener';
        } else {
          el = document.createElement('span');
          el.className = 'rd-book';
        }
        el.textContent = item.title + (item.by ? ' — ' + item.by : '');
        li.appendChild(el);
        panelList.appendChild(li);
      });
    }
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();
