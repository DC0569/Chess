const files = "abcdefgh";
const initialFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w";

// Function to get fresh element references
function getBoardEl() { return document.getElementById("board"); }
function getMoveListEl() { return document.getElementById("moveList"); }
function getTurnEl() { return document.getElementById("turn"); }
function getStatusEl() { return document.getElementById("status"); }
function getResetBtn() { return document.getElementById("resetBtn"); }
function getUndoBtn() { return document.getElementById("undoBtn"); }
function getCapturedWhiteEl() { return document.getElementById("capturedWhite"); }
function getCapturedBlackEl() { return document.getElementById("capturedBlack"); }

// Initial references (will be refreshed when needed)
let boardEl = getBoardEl();
let moveListEl = getMoveListEl();
let turnEl = getTurnEl();
let statusEl = getStatusEl();
let resetBtn = getResetBtn();
let undoBtn = getUndoBtn();
let capturedWhiteEl = getCapturedWhiteEl();
let capturedBlackEl = getCapturedBlackEl();

// Navigation and modal elements
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const modalOverlay = loginModal?.querySelector(".modal-overlay");
const loginForm = document.getElementById("loginForm");
const guestBtn = document.getElementById("guestBtn");
const userBar = document.getElementById("userBar");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userInitial = document.getElementById("userInitial");
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav-menu");

const UNICODE = {
  white: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  black: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟︎" }
};

let boardState = createEmptyBoard();
let currentPlayer = "white";
let selectedSquare = null;
let legalMoves = [];
let lastMove = null;
let moveHistory = [];
let gameOver = false;
let capturedPieces = { white: [], black: [] };
let currentUser = null;

// --- Theme support (light / dark / colorful) ---
let currentTheme = null;
const THEME_KEY = 'siteTheme';
const VALID_THEMES = ['light', 'dark'];

function applyTheme(theme) {
  try {
    if (!theme || VALID_THEMES.indexOf(theme) === -1) theme = 'light';
    // Remove existing theme-* classes from body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    currentTheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    // If a select exists, update its value
    const sel = document.getElementById('themeSelect');
    if (sel) sel.value = theme;
  } catch (err) {
    // ignore failures (e.g., missing document in some contexts)
    console.warn('applyTheme error', err);
  }
}

function loadThemeFromStorage() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && VALID_THEMES.indexOf(saved) !== -1) return saved;
    // Fallback to prefers-color-scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (e) { /* ignore */ }
  return 'light';
}

function setupThemeSelector() {
  const sel = document.getElementById('themeSelect');
  if (!sel) return;
  // initialize value
  const saved = loadThemeFromStorage();
  applyTheme(saved);
  sel.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

// Setup header controls: compact theme buttons
function setupHeaderControls() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Set initial icon
  themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

  // Theme toggle: cycles light <-> dark
  themeToggle.addEventListener('click', () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    // update icon
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  });

  // The paletteBtn listener is no longer needed
}


// Event listeners (will be attached after DOM is ready)
resetBtn?.addEventListener("click", startNewGame);
undoBtn?.addEventListener("click", undoMove);

// Navigation and modal event listeners
loginBtn?.addEventListener("click", () => openModal());
const signupBtnNav = document.getElementById("signupBtn");
signupBtnNav?.addEventListener("click", () => {
  window.location.href = "signup.html";
});
closeModal?.addEventListener("click", () => closeLoginModal());
modalOverlay?.addEventListener("click", () => closeLoginModal());
loginForm?.addEventListener("submit", handleLogin);
guestBtn?.addEventListener("click", handleGuestLogin);
logoutBtn?.addEventListener("click", handleLogout);
navToggle?.addEventListener("click", toggleMobileMenu);

// Signup form handler
const signupFormMain = document.getElementById("signupFormMain");
signupFormMain?.addEventListener("submit", handleSignup);

// Forgot password form handler
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
forgotPasswordForm?.addEventListener("submit", handleForgotPassword);

// Guest button on forgot password page
const guestBtnPage = document.getElementById("guestBtnPage");
guestBtnPage?.addEventListener("click", () => {
  handleGuestLogin();
  window.location.href = "index.html";
});

// Resend link
const resendLink = document.getElementById("resendLink");
resendLink?.addEventListener("click", (e) => {
  e.preventDefault();
  showNotification("Reset link resent! Check your email.", "success");
});

// Initialize when DOM is ready
function initializeApp() {
  // Check if user is already logged in
  checkExistingSession();

  // Theme: apply saved or preferred theme and wire up selector (if present)
  try {
    const savedTheme = loadThemeFromStorage();
    applyTheme(savedTheme);
    setupThemeSelector();
    // wire header controls (icon toggles, avatar dropdown)
    setupHeaderControls();
  } catch (e) {
    /* ignore theme errors */
  }

  // Setup promotion modal (if present on page)
  setupPromotionModal();

  // Initialize board first (only if board exists)
  if (boardEl) {
    initBoardSquares();
  }

  // Check if on index.html and require login
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/chess/') ||
                      window.location.pathname.endsWith('/chess');
  
  if (isIndexPage && boardEl) {
    if (!currentUser) {
      openModal();
      // Disable game interaction until logged in
      if (boardEl) {
        boardEl.addEventListener('click', function(e) {
          if (!currentUser) {
            e.stopPropagation();
            showNotification("Please login to play chess", "info");
          }
        }, true);
      }
    } else {
      // User is logged in, start the game
      startNewGame();
    }
  } else if (boardEl) {
    // Not on chess page but board exists, just start normally
    startNewGame();
  }
  
  // Initialize puzzles page if present
  if (window.location.pathname.includes('puzzles.html')) {
    initPuzzlesPage();
  }
  
  // Wire up save/load game buttons
  setupGameSaveLoad();
  
  // Setup board customization options
  setupBoardOptions();
}

// Board Customization Options
function setupBoardOptions() {
  // Coordinates toggle
  const showCoords = document.getElementById('showCoords');
  showCoords?.addEventListener('change', (e) => {
    boardEl?.classList.toggle('hide-coords', !e.target.checked);
  });
  
  // Sound effects toggle
  const soundEnabled = document.getElementById('soundEnabled');
  soundEnabled?.addEventListener('change', (e) => {
    localStorage.setItem('soundEnabled', e.target.checked);
  });
  
  // Load saved sound preference
  const savedSound = localStorage.getItem('soundEnabled');
  if (soundEnabled && savedSound !== null) {
    soundEnabled.checked = savedSound === 'true';
  }
}

// Sound Effects
const sounds = {
  move: null, // Will be initialized on first use
  capture: null,
  check: null,
  gameOver: null
};

function playSound(type) {
  const soundEnabled = document.getElementById('soundEnabled');
  if (!soundEnabled || !soundEnabled.checked) return;
  
  // Simple beep sounds using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different sounds
    if (type === 'move') {
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
    } else if (type === 'capture') {
      oscillator.frequency.value = 330;
      gainNode.gain.value = 0.15;
    } else if (type === 'check') {
      oscillator.frequency.value = 550;
      gainNode.gain.value = 0.2;
    } else if (type === 'gameOver') {
      oscillator.frequency.value = 220;
      gainNode.gain.value = 0.15;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported, ignore
  }
}

// Performance: Debounce resize events
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const isIndexPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/chess/') ||
                        window.location.pathname.endsWith('/chess');
    if (boardEl && isIndexPage) {
      renderBoard();
    }
  }, 250);
});

// Keyboard shortcuts for chess game
document.addEventListener('keydown', (e) => {
  // Only on chess page
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/chess/') ||
                      window.location.pathname.endsWith('/chess');
  if (!isIndexPage) return;
  
  // Don't trigger if typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  // Ctrl/Cmd + Z for undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn && !undoBtn.disabled) {
      undoMove();
    }
  }
  
  // Ctrl/Cmd + N for new game
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      startNewGame();
    }
  }
  
  // Ctrl/Cmd + S for save game
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveGame();
  }
  
  // Ctrl/Cmd + O for load game
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    loadGame();
  }
});

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Navigation and Authentication Functions
function openModal() {
  loginModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Focus first input for accessibility
  setTimeout(() => {
    const firstInput = loginModal?.querySelector('input[type="text"]');
    firstInput?.focus();
  }, 100);
}

function closeLoginModal() {
  loginModal?.classList.remove("active");
  document.body.style.overflow = "";
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  // Simple validation (in real app, this would be server-side)
  if (username && password) {
    setUser(username, "user");
    closeLoginModal();
    showNotification("Welcome back, " + username + "!", "success");
  }
}

function handleGuestLogin() {
  const guestNumber = Math.floor(Math.random() * 9999) + 1;
  const guestName = `Guest_${guestNumber}`;
  
  // Store guest session first
  localStorage.setItem("guestSession", JSON.stringify({
    name: guestName,
    startTime: new Date().toISOString(),
    gamesPlayed: 0
  }));
  
  // Set user and close modal
  setUser(guestName, "guest");
  
  // Ensure modal closes
  if (loginModal) {
    loginModal.classList.remove("active");
    document.body.style.overflow = "";
  }
  
  showNotification(`Welcome ${guestName}! 🎮`, "info");
}

function handleSignup(e) {
  e.preventDefault();
  
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const country = document.getElementById("country").value;
  const skillLevel = document.getElementById("skillLevel").value;
  const terms = document.getElementById("terms").checked;
  
  // Validation
  if (password !== confirmPassword) {
    showNotification("Passwords do not match!", "error");
    return;
  }
  
  if (!terms) {
    showNotification("Please accept the terms and conditions", "error");
    return;
  }
  
  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }
  
  if (username.length < 3) {
    showNotification("Username must be at least 3 characters", "error");
    return;
  }
  
  // Store user data (in a real app, this would be sent to a server)
  const userData = {
    firstName,
    lastName,
    username,
    email,
    password, // In real app, this would be hashed
    country,
    skillLevel,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem("chessUserData", JSON.stringify(userData));
  
  // Log the user in
  setUser(username, "registered");
  
  showNotification(`Welcome aboard, ${firstName}! 🎉`, "success");
  
  // Redirect to play page after 2 seconds
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById("resetEmail").value;
  
  // In a real app, this would send a request to the server
  // For now, we'll check if the email exists in localStorage
  const userData = localStorage.getItem("chessUserData");
  
  let tokenStored = false;
  if (userData) {
    const user = JSON.parse(userData);
    if (user.email === email) {
      // Store reset token ONLY if email was found (in real app, this would be done server-side)
      const resetToken = Math.random().toString(36).substring(7);
      localStorage.setItem("passwordResetToken", JSON.stringify({
        email,
        token: resetToken,
        expiry: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }));
      tokenStored = true;
    }
  }
  
  // Show success message regardless (for security - don't reveal if email exists)
  document.querySelector(".forgot-form").style.display = "none";
  document.querySelector(".forgot-header").style.display = "none";
  document.querySelector(".forgot-icon").style.display = "none";
  document.getElementById("successMessage").style.display = "block";
  
  showNotification(tokenStored ? "Reset link sent to your email!" : "If that email exists, we've sent reset instructions", "info");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("chessUser");
  localStorage.removeItem("guestSession");
  userBar.style.display = "none";
  loginBtn.style.display = "inline-flex";
  
  // Show signup button if it exists (not on all pages now)
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.style.display = "inline-flex";
  }
  
  showNotification("Logged out successfully", "info");
  
  // Redirect to home if on chess page
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/chess/') ||
                      window.location.pathname.endsWith('/chess');
  if (isIndexPage) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

function setUser(name, type) {
  currentUser = { name, type };
  localStorage.setItem("chessUser", JSON.stringify(currentUser));
  
  if (userName) userName.textContent = name;
  if (userInitial) userInitial.textContent = name.charAt(0).toUpperCase();
  if (userBar) userBar.style.display = "flex";
  if (loginBtn) loginBtn.style.display = "none";
  
  // Handle signup button/link
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.style.display = "none";
  }
  const signupLink = document.querySelector('a[href="signup.html"].btn-primary');
  if (signupLink) {
    signupLink.style.display = "none";
  }
  
  // Re-enable game if on chess page
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/chess/') ||
                      window.location.pathname.endsWith('/chess');
  if (isIndexPage) {
    const board = document.getElementById('board');
    if (board) {
      // Remove the blocking listener by cloning
      const newBoard = board.cloneNode(true);
      board.parentNode.replaceChild(newBoard, board);
      
      // FIX: Update the global boardEl reference to the new board
      boardEl = newBoard;
      
      // Reinitialize with updated reference
      setTimeout(() => {
        initBoardSquares();
        startNewGame();
      }, 0);
    }
  }
}

function checkExistingSession() {
  const savedUser = localStorage.getItem("chessUser");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    currentUser = { name: user.name, type: user.type };
    
    // Update UI elements
    if (userName) userName.textContent = user.name;
    if (userInitial) userInitial.textContent = user.name.charAt(0).toUpperCase();
    if (userBar) userBar.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "none";
    
    // Handle signup button/link
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
      signupBtn.style.display = "none";
    }
    const signupLink = document.querySelector('a[href="signup.html"].btn-primary');
    if (signupLink) {
      signupLink.style.display = "none";
    }
  }
}

function toggleMobileMenu() {
  navMenu?.classList.toggle("active");
  navToggle?.classList.toggle("active");
  
  // Update ARIA attribute for accessibility
  const isExpanded = navMenu?.classList.contains("active");
  navToggle?.setAttribute("aria-expanded", isExpanded);
}

// Close mobile menu when navigation link is clicked
function closeMobileMenuOnNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu?.classList.contains("active")) {
        toggleMobileMenu();
      }
    });
  });
}

// Initialize mobile menu close handler
closeMobileMenuOnNavigation();

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modal on escape key and handle focus trapping
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && loginModal?.classList.contains("active")) {
    closeLoginModal();
  }
  if (e.key === "Escape") {
    const promotionModal = document.getElementById("promotionModal");
    if (promotionModal?.classList.contains("active")) {
      closePromotionModal();
    }
  }
  if (e.key === "Escape" && navMenu?.classList.contains("active")) {
    toggleMobileMenu();
  }
  
  // Focus trap for Tab key
  if (e.key === "Tab") {
    // Trap focus in login modal
    if (loginModal?.classList.contains("active")) {
      trapFocus(e, loginModal);
    }
    // Trap focus in mobile menu
    else if (navMenu?.classList.contains("active")) {
      trapFocus(e, navMenu);
    }
  }
});

// Focus trap utility function
function trapFocus(e, container) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (!firstElement) return;
  
  if (e.shiftKey) {
    // Shift + Tab: going backwards
    if (document.activeElement === firstElement) {
      lastElement?.focus();
      e.preventDefault();
    }
  } else {
    // Tab: going forwards
    if (document.activeElement === lastElement) {
      firstElement?.focus();
      e.preventDefault();
    }
  }
}

// Promotion modal functions
function openPromotionModal(move) {
  const promotionModal = document.getElementById("promotionModal");
  if (!promotionModal) return;
  
  // Store the move for later
  promotionModal.dataset.pendingMove = JSON.stringify(move);
  
  // Show the modal
  promotionModal.classList.add("active");
}

function closePromotionModal() {
  const promotionModal = document.getElementById("promotionModal");
  if (promotionModal) {
    promotionModal.classList.remove("active");
    delete promotionModal.dataset.pendingMove;
  }
}

function setupPromotionModal() {
  const promotionChoices = document.querySelectorAll(".promotion-choice");
  
  promotionChoices.forEach(button => {
    button.addEventListener("click", () => {
      const pieceType = button.getAttribute("data-piece");
      const promotionModal = document.getElementById("promotionModal");
      
      if (promotionModal?.dataset.pendingMove) {
        const move = JSON.parse(promotionModal.dataset.pendingMove);
        move.promotion = pieceType;
        
        // Close modal and complete the move
        closePromotionModal();
        completeMoveExecution(move);
      }
    });
  });
}

// Puzzles Page Functions
function initPuzzlesPage() {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const difficulty = btn.getAttribute('data-difficulty');
      filterPuzzles(difficulty);
    });
  });
  
  // Solve buttons
  const solveBtns = document.querySelectorAll('.btn-solve');
  solveBtns?.forEach(btn => {
    btn.addEventListener('click', (e) => {
      showNotification('Puzzle solving feature coming soon!', 'info');
    });
  });
}

function filterPuzzles(difficulty) {
  const cards = document.querySelectorAll('.puzzle-card');
  cards.forEach(card => {
    if (difficulty === 'all' || card.getAttribute('data-difficulty') === difficulty) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Save/Load Game Functions
function setupGameSaveLoad() {
  const saveBtn = document.getElementById('saveGameBtn');
  const loadBtn = document.getElementById('loadGameBtn');
  
  saveBtn?.addEventListener('click', saveGame);
  loadBtn?.addEventListener('click', loadGame);
}

function saveGame() {
  if (!boardState || !currentUser) {
    showNotification('Please login and start a game first', 'info');
    return;
  }
  
  const gameState = {
    boardState,
    currentPlayer,
    moveHistory,
    lastMove,
    capturedPieces,
    timestamp: new Date().toISOString(),
    user: currentUser
  };
  
  localStorage.setItem('savedGame', JSON.stringify(gameState));
  showNotification('💾 Game saved successfully!', 'success');
  
  // Update save button visual feedback
  const saveBtn = document.getElementById('saveGameBtn');
  if (saveBtn) {
    saveBtn.textContent = '✓ Saved';
    setTimeout(() => {
      saveBtn.textContent = '💾 Save';
    }, 2000);
  }
}

function loadGame() {
  const saved = localStorage.getItem('savedGame');
  if (!saved) {
    showNotification('No saved game found', 'info');
    return;
  }
  
  try {
    const gameState = JSON.parse(saved);
    
    if (gameState.user !== currentUser) {
      showNotification('This save belongs to another user', 'error');
      return;
    }
    
    boardState = gameState.boardState;
    currentPlayer = gameState.currentPlayer;
    moveHistory = gameState.moveHistory || [];
    lastMove = gameState.lastMove || null;
    capturedPieces = gameState.capturedPieces || { white: [], black: [] };
    gameOver = false;
    
    renderBoard();
    updateCapturedDisplay();
    updateStatus();
    
    // Rebuild move list
    if (moveListEl) {
      moveListEl.innerHTML = "";
      moveHistory.forEach((move, index) => {
        const moveNotation = `${move.piece.type} ${files[move.from.file]}${move.from.rank + 1} → ${files[move.to.file]}${move.to.rank + 1}`;
        if (index % 2 === 0) {
          const li = document.createElement("li");
          li.textContent = `${Math.floor(index / 2) + 1}. ${moveNotation}`;
          moveListEl.appendChild(li);
        } else {
          const lastLi = moveListEl.lastElementChild;
          if (lastLi) lastLi.textContent += `    ${moveNotation}`;
        }
      });
    }
    
    showNotification('Game loaded successfully!', 'success');
  } catch (e) {
    showNotification('Failed to load game', 'error');
  }
}

function createEmptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function startNewGame() {
  // Refresh element references
  moveListEl = getMoveListEl();
  turnEl = getTurnEl();
  statusEl = getStatusEl();
  capturedWhiteEl = getCapturedWhiteEl();
  capturedBlackEl = getCapturedBlackEl();
  undoBtn = getUndoBtn();
  
  boardState = createEmptyBoard();
  loadFEN(initialFEN);
  currentPlayer = "white";
  selectedSquare = null;
  legalMoves = [];
  lastMove = null;
  moveHistory = [];
  gameOver = false;
  if (moveListEl) moveListEl.innerHTML = "";
  if (turnEl) turnEl.textContent = "White to move";
  if (statusEl) statusEl.textContent = "";
  capturedPieces = { white: [], black: [] };
  renderBoard();
  updateCapturedDisplay();
  updateUndoButton();
}

function initBoardSquares() {
  // Refresh board element reference
  boardEl = getBoardEl();
  if (!boardEl) return;
  
  boardEl.innerHTML = "";
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = `square ${(file + rank) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.file = file;
      square.dataset.rank = rank;
      square.dataset.rankLabel = file === 0 ? String(rank + 1) : "";
      square.dataset.fileLabel = rank === 0 ? files[file] : "";
      square.addEventListener("click", () => handleSquareClick(file, rank));
      boardEl.appendChild(square);
    }
  }
}

function handleSquareClick(file, rank) {
  if (gameOver) return;

  const piece = boardState[rank][file];
  
  // Deselect if clicking the same square
  if (selectedSquare && selectedSquare.file === file && selectedSquare.rank === rank) {
    clearSelection();
    return;
  }

  if (selectedSquare) {
    // Try to make a move
    const move = legalMoves.find(
      m => m.to.file === file && m.to.rank === rank
    );
    if (move) {
      executeMove(move);
      return;
    }
    // Select different piece of the same color
    if (piece && piece.color === currentPlayer) {
      selectSquare(file, rank);
      return;
    }
    // Clear selection if clicking empty or opponent square
    clearSelection();
    return;
  }

  // Select piece if it belongs to current player
  if (piece && piece.color === currentPlayer) {
    selectSquare(file, rank);
  }
}

function selectSquare(file, rank) {
  selectedSquare = { file, rank };
  legalMoves = generateLegalMoves(boardState, selectedSquare, currentPlayer);
  renderBoard();
  highlightSelection();
}

function clearSelection() {
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
}

function executeMove(move) {
  // Check if this move needs promotion
  if (move.needsPromotion) {
    openPromotionModal(move);
    return;
  }
  
  // Complete the move
  completeMoveExecution(move);
}

function completeMoveExecution(move) {
  if (move.capture) {
    capturedPieces[move.capture.color].push(move.capture.type);
    playSound('capture');
  } else {
    playSound('move');
  }
  
  applyMove(boardState, move);
  moveHistory.push(move);
  lastMove = move;
  currentPlayer = currentPlayer === "white" ? "black" : "white";
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
  appendMoveToList(move);
  updateStatus();
  updateCapturedDisplay();
  updateUndoButton();
}

function updateStatus() {
  const opponent = currentPlayer;
  const allMoves = collectAllMoves(boardState, opponent);
  const inCheck = isKingInCheck(boardState, opponent);

  turnEl.textContent = `${capitalize(opponent)} to move`;

  if (inCheck && allMoves.length === 0) {
    statusEl.textContent = `Checkmate — ${capitalize(opponent === "white" ? "black" : "white")} wins!`;
    gameOver = true;
    playSound('gameOver');
    trackGameEnd('checkmate', opponent === "white" ? "black" : "white");
    return;
  }
  if (!inCheck && allMoves.length === 0) {
    statusEl.textContent = "Stalemate — Draw";
    gameOver = true;
    playSound('gameOver');
    trackGameEnd('stalemate', 'draw');
    return;
  }
  
  if (inCheck) {
    statusEl.textContent = "Check!";
    playSound('check');
  } else {
    statusEl.textContent = "";
  }
}

// Game Statistics Tracking
function trackGameEnd(result, winner) {
  if (!currentUser) return;
  
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
  if (!stats[currentUser]) {
    stats[currentUser] = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      checkmates: 0,
      longestGame: 0
    };
  }
  
  stats[currentUser].gamesPlayed++;
  
  if (result === 'checkmate') {
    stats[currentUser].checkmates++;
    // Assuming user plays as white
    if (winner === 'white') {
      stats[currentUser].wins++;
    } else {
      stats[currentUser].losses++;
    }
  } else if (result === 'stalemate') {
    stats[currentUser].draws++;
  }
  
  // Track longest game
  if (moveHistory.length > stats[currentUser].longestGame) {
    stats[currentUser].longestGame = moveHistory.length;
  }
  
  localStorage.setItem('gameStats', JSON.stringify(stats));
}

function getGameStats() {
  if (!currentUser) return null;
  
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
  return stats[currentUser] || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    checkmates: 0,
    longestGame: 0
  };
}

function renderBoard() {
  const squares = boardEl.querySelectorAll(".square");
  if (!squares.length) return;

  squares.forEach(square => {
    const file = Number(square.dataset.file);
    const rank = Number(square.dataset.rank);
    const piece = boardState[rank]?.[file];

    square.textContent = piece ? UNICODE[piece.color][piece.type] : "";
    square.classList.remove(
      "selected",
      "legal-target",
      "capture-target",
      "last-move",
      "in-check"
    );

    if (lastMove) {
      const matchFrom =
        lastMove.from.file === file && lastMove.from.rank === rank;
      const matchTo =
        lastMove.to.file === file && lastMove.to.rank === rank;
      if (matchFrom || matchTo) square.classList.add("last-move");
    }
  });

  const kingSquare = findKing(boardState, currentPlayer);
  if (kingSquare && isKingInCheck(boardState, currentPlayer)) {
    const checkSquare = squareElement(kingSquare.file, kingSquare.rank);
    if (checkSquare) checkSquare.classList.add("in-check");
  }
}

function highlightSelection() {
  if (!selectedSquare) return;
  const selectedEl = squareElement(selectedSquare.file, selectedSquare.rank);
  if (selectedEl) selectedEl.classList.add("selected");
  
  legalMoves.forEach(move => {
    const target = squareElement(move.to.file, move.to.rank);
    if (target) {
      target.classList.add(move.capture ? "capture-target" : "legal-target");
    }
  });
}

function appendMoveToList(move) {
  const ply = moveHistory.length;
  const moveText = formatMoveText(move);
  const item = document.createElement("li");
  
  if (ply % 2 === 1) {
    item.textContent = `${Math.ceil(ply / 2)}. ${moveText}`;
    moveListEl.appendChild(item);
  } else {
    const prev = moveListEl.lastElementChild;
    if (prev) {
      prev.textContent += `   ${moveText}`;
    } else {
      item.textContent = moveText;
      moveListEl.appendChild(item);
    }
  }
  moveListEl.scrollTop = moveListEl.scrollHeight;
}

function formatMoveText(move) {
  const from = `${files[move.from.file]}${move.from.rank + 1}`;
  const to = `${files[move.to.file]}${move.to.rank + 1}`;
  const pieceChar = move.piece.type === "p" ? "" : move.piece.type.toUpperCase();
  const captureSymbol = move.capture ? "x" : "–";
  let suffix = "";
  const opponent = currentPlayer;
  const inCheck = isKingInCheck(boardState, opponent);
  const allMoves = collectAllMoves(boardState, opponent);
  if (inCheck && allMoves.length === 0) suffix = "#";
  else if (inCheck) suffix = "+";
  if (move.promotion) {
    suffix += `=${move.promotion.toUpperCase()}`;
  }
  return `${pieceChar}${from}${captureSymbol}${to}${suffix}`;
}

function loadFEN(fen) {
  const [placement] = fen.split(" ");
  const rows = placement.split("/");
  rows.forEach((row, rowIdx) => {
    let file = 0;
    for (const char of row) {
      if (Number.isInteger(Number(char))) {
        file += Number(char);
        continue;
      }
      const color = char === char.toUpperCase() ? "white" : "black";
      const type = char.toLowerCase();
      const rank = 7 - rowIdx;
      boardState[rank][file] = {
        type,
        color,
        hasMoved: false
      };
      file += 1;
    }
  });
}

function generateLegalMoves(board, from, color) {
  const piece = board[from.rank]?.[from.file];
  if (!piece || piece.color !== color) return [];
  const rawMoves = movesForPiece(board, from, piece);
  return rawMoves.filter(move => {
    const clone = cloneBoard(board);
    applyMove(clone, move, { dryRun: true });
    return !isKingInCheck(clone, color);
  });
}

function collectAllMoves(board, color) {
  const moves = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece || piece.color !== color) continue;
      const from = { file, rank };
      moves.push(...generateLegalMoves(board, from, color));
    }
  }
  return moves;
}

function movesForPiece(board, from, piece) {
  switch (piece.type) {
    case "p":
      return pawnMoves(board, from, piece);
    case "n":
      return knightMoves(board, from, piece);
    case "b":
      return slidingMoves(board, from, piece, [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ]);
    case "r":
      return slidingMoves(board, from, piece, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]);
    case "q":
      return slidingMoves(board, from, piece, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ]);
    case "k":
      return kingMoves(board, from, piece);
    default:
      return [];
  }
}

function pawnMoves(board, from, piece) {
  const moves = [];
  const direction = piece.color === "white" ? 1 : -1;
  const startRank = piece.color === "white" ? 1 : 6;
  const promotionRank = piece.color === "white" ? 7 : 0;

  // Forward moves
  const oneRank = from.rank + direction;
  if (isOnBoard(from.file, oneRank) && !board[oneRank][from.file]) {
    moves.push(buildMove(from, { file: from.file, rank: oneRank }, piece));
    const twoRank = from.rank + direction * 2;
    if (
      from.rank === startRank &&
      isOnBoard(from.file, twoRank) &&
      !board[twoRank][from.file]
    ) {
      moves.push(buildMove(from, { file: from.file, rank: twoRank }, piece, { isDoublePawnPush: true }));
    }
  }

  // Diagonal captures
  [-1, 1].forEach(offset => {
    const targetFile = from.file + offset;
    const targetRank = from.rank + direction;
    if (!isOnBoard(targetFile, targetRank)) return;
    const targetPiece = board[targetRank][targetFile];
    if (targetPiece && targetPiece.color !== piece.color) {
      moves.push(
        buildMove(
          from,
          { file: targetFile, rank: targetRank },
          piece,
          { capture: targetPiece }
        )
      );
    }
  });

  // En passant
  if (lastMove && lastMove.piece.type === 'p' && lastMove.isDoublePawnPush) {
    const enPassantRank = piece.color === "white" ? 4 : 3;
    if (from.rank === enPassantRank) {
      [-1, 1].forEach(offset => {
        if (lastMove.to.file === from.file + offset && lastMove.to.rank === from.rank) {
          const captureSquare = { file: lastMove.to.file, rank: from.rank + direction };
          const capturedPawn = board[lastMove.to.rank][lastMove.to.file];
          moves.push(
            buildMove(from, captureSquare, piece, { 
              capture: capturedPawn, 
              isEnPassant: true,
              enPassantSquare: { file: lastMove.to.file, rank: lastMove.to.rank }
            })
          );
        }
      });
    }
  }

  // Mark promotion moves (will be handled by modal)
  return moves.map(move => {
    if (move.to.rank === promotionRank) {
      move.needsPromotion = true;
    }
    return move;
  });
}

function knightMoves(board, from, piece) {
  const deltas = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2]
  ];
  return deltas
    .map(([df, dr]) => {
      const file = from.file + df;
      const rank = from.rank + dr;
      if (!isOnBoard(file, rank)) return null;
      const target = board[rank][file];
      if (!target || target.color !== piece.color) {
        return buildMove(from, { file, rank }, piece, {
          capture: target || null
        });
      }
      return null;
    })
    .filter(Boolean);
}

function slidingMoves(board, from, piece, directions) {
  const moves = [];
  directions.forEach(([df, dr]) => {
    let file = from.file + df;
    let rank = from.rank + dr;
    while (isOnBoard(file, rank)) {
      const target = board[rank][file];
      if (!target) {
        moves.push(buildMove(from, { file, rank }, piece));
      } else {
        if (target.color !== piece.color) {
          moves.push(
            buildMove(from, { file, rank }, piece, { capture: target })
          );
        }
        break;
      }
      file += df;
      rank += dr;
    }
  });
  return moves;
}

function kingMoves(board, from, piece) {
  const moves = [];
  
  // Normal king moves (one square in any direction)
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const file = from.file + df;
      const rank = from.rank + dr;
      if (!isOnBoard(file, rank)) continue;
      const target = board[rank][file];
      if (!target || target.color !== piece.color) {
        moves.push(
          buildMove(from, { file, rank }, piece, {
            capture: target || null
          })
        );
      }
    }
  }
  
  // Castling
  if (!piece.hasMoved && !isKingInCheck(board, piece.color)) {
    const rank = piece.color === "white" ? 0 : 7;
    
    // Kingside castling (O-O)
    const kingsideRook = board[rank][7];
    if (kingsideRook && kingsideRook.type === 'r' && !kingsideRook.hasMoved) {
      // Check if squares between king and rook are empty
      if (!board[rank][5] && !board[rank][6]) {
        // Check if king doesn't move through check
        const f5Safe = !isSquareAttacked(board, { file: 5, rank }, piece.color === "white" ? "black" : "white");
        const f6Safe = !isSquareAttacked(board, { file: 6, rank }, piece.color === "white" ? "black" : "white");
        if (f5Safe && f6Safe) {
          moves.push(buildMove(from, { file: 6, rank }, piece, { isCastling: true, rookFrom: { file: 7, rank }, rookTo: { file: 5, rank } }));
        }
      }
    }
    
    // Queenside castling (O-O-O)
    const queensideRook = board[rank][0];
    if (queensideRook && queensideRook.type === 'r' && !queensideRook.hasMoved) {
      // Check if squares between king and rook are empty
      if (!board[rank][1] && !board[rank][2] && !board[rank][3]) {
        // Check if king doesn't move through check
        const f3Safe = !isSquareAttacked(board, { file: 3, rank }, piece.color === "white" ? "black" : "white");
        const f2Safe = !isSquareAttacked(board, { file: 2, rank }, piece.color === "white" ? "black" : "white");
        if (f3Safe && f2Safe) {
          moves.push(buildMove(from, { file: 2, rank }, piece, { isCastling: true, rookFrom: { file: 0, rank }, rookTo: { file: 3, rank } }));
        }
      }
    }
  }
  
  return moves;
}

function buildMove(from, to, piece, extras = {}) {
  return {
    from: { ...from },
    to: { ...to },
    piece: { ...piece },
    capture: extras.capture || null,
    promotion: extras.promotion || null,
    needsPromotion: extras.needsPromotion || false,
    isCastling: extras.isCastling || false,
    rookFrom: extras.rookFrom || null,
    rookTo: extras.rookTo || null,
    isEnPassant: extras.isEnPassant || false,
    enPassantSquare: extras.enPassantSquare || null,
    isDoublePawnPush: extras.isDoublePawnPush || false
  };
}

function applyMove(board, move, options = {}) {
  const { from, to } = move;
  const movingPiece = {
    ...board[from.rank][from.file],
    hasMoved: true
  };

  // Apply the main move
  board[to.rank][to.file] = {
    ...movingPiece,
    type: move.promotion ? move.promotion : movingPiece.type
  };
  board[from.rank][from.file] = null;

  // Handle castling - move the rook
  if (move.isCastling && move.rookFrom && move.rookTo) {
    const rook = board[move.rookFrom.rank][move.rookFrom.file];
    board[move.rookTo.rank][move.rookTo.file] = { ...rook, hasMoved: true };
    board[move.rookFrom.rank][move.rookFrom.file] = null;
  }

  // Handle en passant - remove the captured pawn
  if (move.isEnPassant && move.enPassantSquare) {
    board[move.enPassantSquare.rank][move.enPassantSquare.file] = null;
  }

  return board;
}

function cloneBoard(board) {
  return board.map(row =>
    row.map(cell => (cell ? { ...cell } : null))
  );
}

function isOnBoard(file, rank) {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

function squareElement(file, rank) {
  return boardEl.querySelector(
    `.square[data-file="${file}"][data-rank="${rank}"]`
  );
}

function isKingInCheck(board, color) {
  const kingSquare = findKing(board, color);
  if (!kingSquare) return false;
  return isSquareAttacked(board, kingSquare, color === "white" ? "black" : "white");
}

function findKing(board, color) {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === "k" && piece.color === color) {
        return { file, rank };
      }
    }
  }
  return null;
}

function isSquareAttacked(board, target, attackerColor) {
  const pawnDir = attackerColor === "white" ? -1 : 1;
  for (const offset of [-1, 1]) {
    const file = target.file + offset;
    const rank = target.rank + pawnDir;
    if (!isOnBoard(file, rank)) continue;
    const piece = board[rank][file];
    if (piece && piece.color === attackerColor && piece.type === "p") {
      return true;
    }
  }

  const knightOffsets = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2]
  ];
  for (const [df, dr] of knightOffsets) {
    const file = target.file + df;
    const rank = target.rank + dr;
    if (!isOnBoard(file, rank)) continue;
    const piece = board[rank][file];
    if (piece && piece.color === attackerColor && piece.type === "n") {
      return true;
    }
  }

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];
  for (const [df, dr] of directions) {
    let file = target.file + df;
    let rank = target.rank + dr;
    while (isOnBoard(file, rank)) {
      const piece = board[rank][file];
      if (!piece) {
        file += df;
        rank += dr;
        continue;
      }
      if (piece.color !== attackerColor) break;
      const diagonal = Math.abs(df) === Math.abs(dr);
      const straight = df === 0 || dr === 0;
      if (
        piece.type === "q" ||
        (piece.type === "b" && diagonal) ||
        (piece.type === "r" && straight)
      ) {
        return true;
      }
      break;
    }
  }

  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const file = target.file + df;
      const rank = target.rank + dr;
      if (!isOnBoard(file, rank)) continue;
      const piece = board[rank][file];
      if (piece && piece.color === attackerColor && piece.type === "k") {
        return true;
      }
    }
  }

  return false;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateUndoButton() {
  undoBtn.disabled = moveHistory.length === 0 || gameOver;
}

function undoMove() {
  if (moveHistory.length === 0 || gameOver) return;
  
  const undoingMove = moveHistory.pop();
  
  // Handle captures
  if (undoingMove.capture) {
    capturedPieces[undoingMove.capture.color].pop();
  }
  
  // Handle castling - move the rook back
  if (undoingMove.isCastling && undoingMove.rookFrom && undoingMove.rookTo) {
    const rook = boardState[undoingMove.rookTo.rank][undoingMove.rookTo.file];
    boardState[undoingMove.rookFrom.rank][undoingMove.rookFrom.file] = {
      ...rook,
      hasMoved: false // Rook hadn't moved before castling
    };
    boardState[undoingMove.rookTo.rank][undoingMove.rookTo.file] = null;
  }
  
  // Handle en passant - restore the captured pawn
  if (undoingMove.isEnPassant && undoingMove.enPassantSquare) {
    const capturedPawn = {
      type: 'pawn',
      color: currentPlayer, // opponent's pawn
      hasMoved: true
    };
    boardState[undoingMove.enPassantSquare.rank][undoingMove.enPassantSquare.file] = capturedPawn;
    // Add back to captured display
    if (undoingMove.capture) {
      capturedPieces[capturedPawn.color].push('pawn');
    }
  }
  
  // Restore the moved piece with its original hasMoved state
  boardState[undoingMove.from.rank][undoingMove.from.file] = {
    ...undoingMove.piece
  };
  
  // Restore destination square (for en passant, this is empty, not the captured pawn)
  if (undoingMove.isEnPassant) {
    boardState[undoingMove.to.rank][undoingMove.to.file] = null;
  } else {
    boardState[undoingMove.to.rank][undoingMove.to.file] = undoingMove.capture;
  }
  
  currentPlayer = currentPlayer === "white" ? "black" : "white";
  lastMove = moveHistory[moveHistory.length - 1] || null;
  
  const lastLi = moveListEl.lastElementChild;
  if (lastLi) {
    if (moveHistory.length % 2 === 1) {
      const text = lastLi.textContent;
      const parts = text.split(/\s{3,}/);
      if (parts.length > 1) {
        lastLi.textContent = parts[0];
      } else {
        lastLi.remove();
      }
    } else {
      lastLi.remove();
    }
  }
  
  renderBoard();
  updateCapturedDisplay();
  updateUndoButton();
  updateStatus();
}

function updateCapturedDisplay() {
  capturedWhiteEl.innerHTML = capturedPieces.white
    .map(type => UNICODE.white[type])
    .join(" ");
  capturedBlackEl.innerHTML = capturedPieces.black
    .map(type => UNICODE.black[type])
    .join(" ");
}
