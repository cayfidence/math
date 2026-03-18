(function(){
  const startSeconds = 12;
  const totalQuestions = 10;

  const openBtn = document.getElementById("small99Btn");
  const modal = document.getElementById("small99Modal");
  const closeBtn = document.getElementById("closeBtn");
  const restartBtn = document.getElementById("restartBtn");

  const timerEl = document.getElementById("timer");
  const scoreEl = document.getElementById("score");
  const qEl = document.getElementById("question");
  const progressEl = document.getElementById("progress");
  const form = document.getElementById("quizSurface");
  const answerInput = document.getElementById("answerInput");
  const submitBtn = document.getElementById("submitBtn");

  /** Quiz state */
  let questions = [];
  let qIndex = 0;
  let score = 0;
  let countdown = startSeconds;
  let intervalId = null;
  let awaitingAnswer = false;

  function rand1to9(){ return Math.floor(Math.random()*9)+1; }

  function makeQuestions(){
    // Create 10 random single-digit multiplication problems (1¨C9)
    const qs = [];
    for(let i=0;i<totalQuestions;i++){
      const a = rand1to9();
      const b = rand1to9();
      qs.push({a,b,answer:a*b});
    }
    return qs;
  }

  function renderQuestion(){
    const q = questions[qIndex];
    qEl.textContent = `${q.a} x ${q.b} = ?`;
    progressEl.textContent = `Question ${qIndex+1} of ${totalQuestions}`;
    answerInput.value = "";
    answerInput.focus();
  }

  function setScore(delta){
    score += delta;
    scoreEl.textContent = String(score);
    scoreEl.style.color = delta>0 ? getComputedStyle(document.documentElement).getPropertyValue("--ok") : getComputedStyle(document.documentElement).getPropertyValue("--bad");
    // brief flash then return to ok color if positive score
    setTimeout(()=>{
      scoreEl.style.color = score>=0 ? getComputedStyle(document.documentElement).getPropertyValue("--ok") : getComputedStyle(document.documentElement).getPropertyValue("--bad");
    }, 350);
  }

  function startTimer(){
    clearInterval(intervalId);
    countdown = startSeconds;
    timerEl.textContent = String(countdown);
    awaitingAnswer = true;
    intervalId = setInterval(()=>{
      countdown -= 1;
      timerEl.textContent = String(countdown);
      if(countdown <= 0){
        clearInterval(intervalId);
        // Timeout counts as incorrect ¡ú -1
        if(awaitingAnswer){
          awaitingAnswer = false;
          setScore(-1);
          nextQuestion();
        }
      }
    }, 1000);
  }

  function nextQuestion(){
    qIndex += 1;
    if(qIndex >= totalQuestions){
      endQuiz();
      return;
    }
    renderQuestion();
    startTimer();
  }

  function startQuiz(){
    questions = makeQuestions();
    qIndex = 0;
    score = 0;
    scoreEl.textContent = "0";
    renderQuestion();
    restartBtn.hidden = true;
    submitBtn.disabled = false;
    startTimer();
  }

  function endQuiz(){
    clearInterval(intervalId);
    awaitingAnswer = false;
    submitBtn.disabled = true;

    const minutes = Math.max(0, score) * 3; // negative score ¡ú 0 minutes
    const result = document.createElement("div");
    result.className = "result";
    result.innerHTML = `
      <p><strong>All done!</strong></p>
      <p>Final score: <strong>${score}</strong></p>
      <p>Phone time earned: <strong>${minutes} minute${minutes===1?"":"s"}</strong></p>
    `;

    // ensure only one result block
    document.querySelectorAll('.result').forEach(n=>n.remove());
    form.querySelector('.quiz-content')?.insertAdjacentElement('afterend', result);

    restartBtn.hidden = false;
    restartBtn.focus();
  }

  // Form submit = attempt answer
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!awaitingAnswer) return;

    const raw = answerInput.value.trim();
    const guess = Number(raw);
    const correct = questions[qIndex].answer;

    clearInterval(intervalId);
    awaitingAnswer = false;

    if(!Number.isFinite(guess)){
      // treat empty/invalid as wrong
      setScore(-1);
    } else if(guess === correct && countdown >= 0){
      setScore(+1);
    } else {
      setScore(-1);
    }

    nextQuestion();
  });

  // Wire buttons
  openBtn.addEventListener("click", ()=>{
    if(typeof modal.showModal === 'function'){
      modal.showModal();
    } else {
      // fallback
      modal.setAttribute('open','');
    }
    startQuiz();
  });

  closeBtn.addEventListener("click", ()=>{
    clearInterval(intervalId);
    modal.close();
  });

  restartBtn.addEventListener("click", ()=>{
    document.querySelectorAll('.result').forEach(n=>n.remove());
    startQuiz();
  });

  // ESC closes dialog; restart state next open
  modal.addEventListener('close', ()=>{
    clearInterval(intervalId);
  });
})();


// 2 vs 2 quiz (30s, 10 questions, 2-digit +/-)
(function(){
  const startSeconds = 30;
  const totalQuestions = 10;

  const openBtn = document.getElementById("two2Btn");
  const modal = document.getElementById("two2Modal");
  const closeBtn = document.getElementById("closeBtn2");
  const restartBtn = document.getElementById("restartBtn2");

  const timerEl = document.getElementById("timer2");
  const scoreEl = document.getElementById("score2");
  const qEl = document.getElementById("question2");
  const progressEl = document.getElementById("progress2");
  const form = document.getElementById("quizSurface2");
  const answerInput = document.getElementById("answerInput2");
  const submitBtn = document.getElementById("submitBtn2");

  let questions = [];
  let qIndex = 0;
  let score = 0;
  let countdown = startSeconds;
  let intervalId = null;
  let awaitingAnswer = false;

  function randInt(min, max){ return Math.floor(Math.random()*(max-min+1)) + min; }
  function twoDigit(){ return randInt(10,99); }
  function oneDigit(){ return randInt(1,9); }

  function makeQuestions(){
    const qs = [];
    for(let i=0;i<totalQuestions;i++){
      const kind = randInt(0,3); // 0: xx+xx, 1: xx-xx, 2: xx+x, 3: xx-x
      let a,b,op,answer;
      if(kind===0){
        a = twoDigit(); b = twoDigit(); op = '+'; answer = a + b;
      } else if(kind===1){
        a = twoDigit(); b = twoDigit(); if(b>a){ const t=a; a=b; b=t; } op='-'; answer = a - b;
      } else if(kind===2){
        a = twoDigit(); b = oneDigit(); op = '+'; answer = a + b;
      } else {
        a = twoDigit(); b = oneDigit(); if(b>a){ b = a % 10 || 1; } op='-'; answer = a - b;
      }
      qs.push({text: `${a} ${op} ${b} = ?`, answer});
    }
    return qs;
  }

  function renderQuestion(){
    const q = questions[qIndex];
    qEl.textContent = q.text;
    progressEl.textContent = `Question ${qIndex+1} of ${totalQuestions}`;
    answerInput.value = "";
    answerInput.focus();
  }

  function setScore(delta){
    score += delta;
    scoreEl.textContent = String(score);
    const ok = getComputedStyle(document.documentElement).getPropertyValue("--ok");
    const bad = getComputedStyle(document.documentElement).getPropertyValue("--bad");
    scoreEl.style.color = delta>0 ? ok : bad;
    setTimeout(()=>{ scoreEl.style.color = score>=0 ? ok : bad; }, 350);
  }

  function startTimer(){
    clearInterval(intervalId);
    countdown = startSeconds;
    timerEl.textContent = String(countdown);
    awaitingAnswer = true;
    intervalId = setInterval(()=>{
      countdown -= 1;
      timerEl.textContent = String(countdown);
      if(countdown <= 0){
        clearInterval(intervalId);
        if(awaitingAnswer){
          awaitingAnswer = false;
          setScore(-1);
          nextQuestion();
        }
      }
    }, 1000);
  }

  function nextQuestion(){
    qIndex += 1;
    if(qIndex >= totalQuestions){ endQuiz(); return; }
    renderQuestion();
    startTimer();
  }

  function startQuiz(){
    questions = makeQuestions();
    qIndex = 0;
    score = 0;
    scoreEl.textContent = "0";
    renderQuestion();
    restartBtn.hidden = true;
    submitBtn.disabled = false;
    startTimer();
  }

  function endQuiz(){
    clearInterval(intervalId);
    awaitingAnswer = false;
    submitBtn.disabled = true;

    const minutes = Math.max(0, score) * 3;
    const result = document.createElement("div");
    result.className = "result";
    result.innerHTML = `
      <p><strong>All done!</strong></p>
      <p>Final score: <strong>${score}</strong></p>
      <p>Phone time earned: <strong>${minutes} minute${minutes===1?"":"s"}</strong></p>
    `;

    document.querySelectorAll('#two2Modal .result').forEach(n=>n.remove());
    form.querySelector('.quiz-content')?.insertAdjacentElement('afterend', result);

    restartBtn.hidden = false;
    restartBtn.focus();
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!awaitingAnswer) return;
    const raw = answerInput.value.trim();
    const guess = Number(raw);
    const correct = questions[qIndex].answer;
    clearInterval(intervalId);
    awaitingAnswer = false;
    if(!Number.isFinite(guess)){
      setScore(-1);
    } else if(guess === correct && countdown >= 0){
      setScore(+1);
    } else {
      setScore(-1);
    }
    nextQuestion();
  });

  openBtn.addEventListener("click", ()=>{
    if(typeof modal.showModal === 'function'){ modal.showModal(); } else { modal.setAttribute('open',''); }
    startQuiz();
  });

  closeBtn.addEventListener("click", ()=>{ clearInterval(intervalId); modal.close(); });

  restartBtn.addEventListener("click", ()=>{
    document.querySelectorAll('#two2Modal .result').forEach(n=>n.remove());
    startQuiz();
  });

  modal.addEventListener('close', ()=>{ clearInterval(intervalId); });
})();

// Multiplication +/- quiz (45s, 10 questions, (a*b) Â± c)
(function(){
  const startSeconds = 45;
  const totalQuestions = 10;

  const openBtn = document.getElementById("mixBtn");
  const modal = document.getElementById("mixModal");
  const closeBtn = document.getElementById("closeBtn3");
  const restartBtn = document.getElementById("restartBtn3");

  const timerEl = document.getElementById("timer3");
  const scoreEl = document.getElementById("score3");
  const qEl = document.getElementById("question3");
  const progressEl = document.getElementById("progress3");
  const form = document.getElementById("quizSurface3");
  const answerInput = document.getElementById("answerInput3");
  const submitBtn = document.getElementById("submitBtn3");

  let questions = [];
  let qIndex = 0;
  let score = 0;
  let countdown = startSeconds;
  let intervalId = null;
  let awaitingAnswer = false;

  function randInt(min, max){ return Math.floor(Math.random()*(max-min+1)) + min; }
  function oneDigit(){ return randInt(1,9); }

  function makeQuestions(){
    const qs = [];
    for(let i=0;i<totalQuestions;i++){
      const a = oneDigit();
      const b = oneDigit();
      const prod = a*b;
      const plus = Math.random() < 0.5;
      let c, text, answer;
      if(plus){
        c = randInt(1,99); // 1 or 2 digits
        text = `${a} * ${b} + ${c} = ?`;
        answer = prod + c;
      } else {
        const maxC = Math.min(99, prod); // avoid negatives
        c = randInt(1, Math.max(1, maxC));
        text = `${a} * ${b} - ${c} = ?`;
        answer = prod - c;
      }
      qs.push({text, answer});
    }
    return qs;
  }

  function renderQuestion(){
    const q = questions[qIndex];
    qEl.textContent = q.text;
    progressEl.textContent = `Question ${qIndex+1} of ${totalQuestions}`;
    answerInput.value = "";
    answerInput.focus();
  }

  function setScore(delta){
    score += delta;
    scoreEl.textContent = String(score);
    const ok = getComputedStyle(document.documentElement).getPropertyValue("--ok");
    const bad = getComputedStyle(document.documentElement).getPropertyValue("--bad");
    scoreEl.style.color = delta>0 ? ok : bad;
    setTimeout(()=>{ scoreEl.style.color = score>=0 ? ok : bad; }, 350);
  }

  function startTimer(){
    clearInterval(intervalId);
    countdown = startSeconds;
    timerEl.textContent = String(countdown);
    awaitingAnswer = true;
    intervalId = setInterval(()=>{
      countdown -= 1;
      timerEl.textContent = String(countdown);
      if(countdown <= 0){
        clearInterval(intervalId);
        if(awaitingAnswer){
          awaitingAnswer = false;
          setScore(-1);
          nextQuestion();
        }
      }
    }, 1000);
  }

  function nextQuestion(){
    qIndex += 1;
    if(qIndex >= totalQuestions){ endQuiz(); return; }
    renderQuestion();
    startTimer();
  }

  function startQuiz(){
    questions = makeQuestions();
    qIndex = 0;
    score = 0;
    scoreEl.textContent = "0";
    renderQuestion();
    restartBtn.hidden = true;
    submitBtn.disabled = false;
    startTimer();
  }

  function endQuiz(){
    clearInterval(intervalId);
    awaitingAnswer = false;
    submitBtn.disabled = true;

    const minutes = Math.max(0, score) * 3;
    const result = document.createElement("div");
    result.className = "result";
    result.innerHTML = `
      <p><strong>All done!</strong></p>
      <p>Final score: <strong>${score}</strong></p>
      <p>Phone time earned: <strong>${minutes} minute${minutes===1?"":"s"}</strong></p>
    `;

    document.querySelectorAll('#mixModal .result').forEach(n=>n.remove());
    form.querySelector('.quiz-content')?.insertAdjacentElement('afterend', result);

    restartBtn.hidden = false;
    restartBtn.focus();
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!awaitingAnswer) return;
    const raw = answerInput.value.trim();
    const guess = Number(raw);
    const correct = questions[qIndex].answer;
    clearInterval(intervalId);
    awaitingAnswer = false;
    if(!Number.isFinite(guess)){
      setScore(-1);
    } else if(guess === correct && countdown >= 0){
      setScore(+1);
    } else {
      setScore(-1);
    }
    nextQuestion();
  });

  openBtn.addEventListener("click", ()=>{
    if(typeof modal.showModal === 'function'){ modal.showModal(); } else { modal.setAttribute('open',''); }
    startQuiz();
  });

  closeBtn.addEventListener("click", ()=>{ clearInterval(intervalId); modal.close(); });

  restartBtn.addEventListener("click", ()=>{
    document.querySelectorAll('#mixModal .result').forEach(n=>n.remove());
    startQuiz();
  });

  modal.addEventListener('close', ()=>{ clearInterval(intervalId); });
})();
