# ChessMaster - Interactive Chess Game

A fully-featured, responsive chess game built with vanilla HTML, CSS, and JavaScript. Play chess online with a beautiful UI, complete chess rules, and accessibility features.

---

## 📁 Project Structure

```
chess/
├── app.js                    # Main JavaScript file with all game logic
├── styles.css                # All styling and themes
├── index.html                # Main chess game page
├── learn.html                # Chess learning resources page
├── puzzles.html              # Chess puzzles practice page
├── leaderboard.html          # Global leaderboard page
├── signup.html               # User registration page
├── forgot-password.html      # Password recovery page
├── IMPROVEMENTS.md           # Development roadmap and planned features
└── README.md                 # This file
```

---

## 📄 File Descriptions

### **app.js** (1,622 lines)
The core JavaScript file containing all game logic and functionality:

#### **Core Chess Engine**
- `createEmptyBoard()` - Initialize empty 8x8 board
- `loadFEN()` - Load chess position from FEN notation
- `generateLegalMoves()` - Calculate all legal moves for a piece
- `isKingInCheck()` - Detect if king is in check
- `applyMove()` - Execute a chess move on the board
- `undoMove()` - Take back the last move

#### **Special Chess Rules**
- `checkPawnPromotion()` - Detect when pawn reaches 8th rank
- `checkCastling()` - Validate castling legality
- `checkEnPassant()` - Handle en passant captures
- `openPromotionModal()` - Show piece selection UI for promotion

#### **Game Management**
- `startNewGame()` - Reset board to starting position
- `executeMove()` - Process move with validation
- `updateStatus()` - Update turn indicator and game status
- `trackGameEnd()` - Record game statistics
- `saveGame()` / `loadGame()` - Save/restore game state to localStorage

#### **Authentication & User Management**
- `handleLogin()` - Process user login
- `handleGuestLogin()` - Allow guest access
- `handleSignup()` - User registration
- `handleLogout()` - Sign out user
- `checkExistingSession()` - Restore saved user session

#### **UI & Interaction**
- `renderBoard()` - Draw the chess board and pieces
- `handleSquareClick()` - Process board clicks
- `highlightSelection()` - Show selected piece and legal moves
- `appendMoveToList()` - Add move to move history
- `updateCapturedDisplay()` - Show captured pieces

#### **Theme System**
- `applyTheme()` - Switch between light/dark themes
- `loadThemeFromStorage()` - Load saved theme preference
- `setupHeaderControls()` - Initialize theme toggle button

#### **Sound Effects**
- `playSound()` - Generate move/capture/check sounds using Web Audio API

#### **Keyboard Shortcuts**
- `Ctrl+Z` - Undo last move
- `Ctrl+N` - Start new game
- `Ctrl+S` - Save game
- `Ctrl+O` - Load saved game
- `Escape` - Close modals

#### **Accessibility**
- `trapFocus()` - Manage focus within modals
- ARIA attributes for screen readers
- Keyboard navigation support

#### **Puzzle System**
- `initPuzzlesPage()` - Set up puzzle page
- `filterPuzzles()` - Filter by difficulty level

---

### **styles.css** (3,031 lines)
Complete styling for all pages with responsive design:

#### **CSS Variables (Lines 1-110)**
- Light theme: `--bg`, `--text`, `--accent`, `--panel-bg`
- Dark theme: `.theme-dark` with slate color palette
- Transitions: `--transition-speed`, `--transition-easing`
- Shadows: `--shadow`, `--shadow-hover`, `--shadow-strong`

#### **Navigation (Lines 168-430)**
- Fixed navbar with blur effect
- Mobile hamburger menu
- Responsive navigation
- User bar with avatar

#### **Chess Board (Lines 712-850)**
- 8x8 grid layout
- Light/dark squares
- Piece styling with Unicode chess symbols
- Selected piece highlighting
- Legal move indicators
- Last move highlighting
- Coordinate labels (a-h, 1-8)

#### **Modals (Lines 480-650)**
- Login modal
- Promotion choice modal
- Overlay backdrop
- Focus trap styling

#### **Responsive Design**
- **Tablet (768px)**: Single column layout, mobile menu
- **Mobile (480px)**: Optimized board size, compact controls

#### **Page-Specific Styles**
- Learn page (Lines 1820-2065)
- Puzzles page (Lines 1650-1819)
- Leaderboard page (Lines 2066-2400)
- Signup page (Lines 2401-2657)
- Forgot password page (Lines 2500-2657)

---

### **index.html** (210 lines)
Main chess game interface:

#### **Components**
- Navigation bar with theme toggle
- Chess board (8×8 grid)
- Game status panel
- Move history list
- Captured pieces display
- Control buttons (New Game, Undo, Save, Load)
- Board options (coordinates toggle, sound toggle)
- Login modal
- Promotion modal
- User info bar
- Keyboard shortcuts guide

#### **Key Elements**
- `#board` - Main chess board container
- `#moveList` - Move history display
- `#turn` - Current turn indicator
- `#status` - Game status messages
- `#capturedWhite` / `#capturedBlack` - Captured pieces
- `#promotionModal` - Piece selection for pawn promotion

---

### **learn.html** (420 lines)
Chess learning and tutorial page:

#### **Content Sections**
- Hero section with call-to-action
- Chess piece movements guide
- Opening principles
- Tactics and strategies
- Endgame fundamentals
- Practice exercises
- Resource links

#### **Interactive Elements**
- Category cards with hover effects
- Lesson navigation
- Visual piece movement diagrams

---

### **puzzles.html** (180 lines)
Chess puzzle practice page:

#### **Features**
- Difficulty filter buttons (All/Beginner/Intermediate/Advanced/Master)
- 6 puzzle cards with:
  - Puzzle preview boards
  - Difficulty badges
  - Rating indicators
  - Solve buttons
- Empty state for no puzzles

#### **JavaScript Integration**
- `filterPuzzles(difficulty)` - Filter by level
- Dynamic card showing/hiding

---

### **leaderboard.html** (140 lines)
Global rankings and leaderboard:

#### **Components**
- Tab filters (Overall/Blitz/Rapid/Classical/Puzzles)
- Top 3 podium display
- Leaderboard table
- Empty state with call-to-action
- Player statistics

#### **Features**
- Sort by rating
- Highlight current user rank
- Win/loss/draw statistics
- Rating changes

---

### **signup.html** (280 lines)
User registration page:

#### **Form Fields**
- Username
- Email
- Password
- Confirm password
- Terms acceptance checkbox

#### **Benefits Section**
- Feature highlights
- Benefits list
- Visual icons

#### **Validation**
- Client-side form validation
- Password strength requirements
- Email format checking

---

### **forgot-password.html** (160 lines)
Password recovery page:

#### **Components**
- Email input form
- Reset instructions
- Success message display
- Back to login link
- Guest login option

#### **Features**
- Email validation
- Resend link functionality
- Success/error notifications

---

### **IMPROVEMENTS.md**
Development roadmap and planned features:

#### **Completed Features** ✅
- Two-theme system (light/dark)
- Chess rules (promotion, castling, en passant)
- Accessibility (ARIA, keyboard navigation)
- Puzzles page
- Save/load game
- Sound effects
- Game statistics

#### **Planned Features** 🔄
- Draw conditions
- Time controls
- Online multiplayer
- Chess AI opponent
- Move analysis
- Opening database
- Endgame tablebase

---

## 🎮 Features

### **Complete Chess Rules**
- ✅ All piece movements (King, Queen, Rook, Bishop, Knight, Pawn)
- ✅ Pawn promotion with modal selection
- ✅ Castling (kingside & queenside)
- ✅ En passant capture
- ✅ Check detection
- ✅ Checkmate detection
- ✅ Stalemate detection

### **User Interface**
- ✅ Beautiful gradient design
- ✅ Smooth animations
- ✅ Responsive layout (desktop/tablet/mobile)
- ✅ Two themes (light/dark)
- ✅ Move history display
- ✅ Captured pieces tracker
- ✅ Coordinate labels

### **Game Features**
- ✅ Save/Load games (localStorage)
- ✅ Undo moves (Ctrl+Z)
- ✅ New game (Ctrl+N)
- ✅ Sound effects (move/capture/check)
- ✅ Visual move indicators
- ✅ Last move highlighting
- ✅ Game statistics tracking

### **Accessibility**
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Keyboard shortcuts

### **Authentication**
- ✅ User login
- ✅ Guest mode
- ✅ Sign up
- ✅ Password recovery
- ✅ Session persistence

---

## 🎨 Themes

### **Light Theme**
- Background: White gradients
- Accent: Blue (#4F46E5)
- Chess squares: Cream (#F0D9B5) & Brown (#B58863)

### **Dark Theme**
- Background: Slate (#0F172A)
- Accent: Indigo (#6366F1)
- Chess squares: Dark brown & Darker brown

---

## 🎯 Usage

1. **Open `index.html`** in a modern web browser
2. **Click "Login"** or **"Continue as Guest"** to start
3. **Click pieces** to select and move them
4. **Use keyboard shortcuts** for quick actions:
   - `Ctrl+Z` - Undo
   - `Ctrl+N` - New Game
   - `Ctrl+S` - Save
   - `Ctrl+O` - Load

---

## 🔧 Technical Details

### **Technologies Used**
- Pure HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Web Audio API (for sounds)
- localStorage API (for persistence)

### **Browser Compatibility**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### **No Dependencies**
- No frameworks (React, Vue, etc.)
- No libraries (jQuery, etc.)
- No build tools required
- Just open and play!

---

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: 768px (single column)
- **Mobile**: 480px (optimized board size)

---

## 💾 Data Storage

### **localStorage Keys**
- `siteTheme` - Theme preference ('light' or 'dark')
- `chessUser` - Current user info (name, type)
- `savedGame` - Game state (board, moves, player)
- `gameStats` - Win/loss/draw statistics
- `soundEnabled` - Sound effects preference

---

## 🎵 Sound Effects

Generated using Web Audio API:
- **Move**: 440Hz tone (0.1s)
- **Capture**: 330Hz tone (0.15s)
- **Check**: 550Hz tone (0.2s)
- **Game Over**: Chord sequence

---

## 🚀 Future Enhancements

See `IMPROVEMENTS.md` for detailed roadmap including:
- Chess AI opponent
- Online multiplayer
- Time controls
- Move analysis
- Opening database
- Tournament mode

---

## 👨‍💻 Code Organization

### **Global Variables**
- `boardState` - 8x8 array representing the board
- `currentPlayer` - 'white' or 'black'
- `moveHistory` - Array of all moves
- `selectedSquare` - Currently selected piece
- `legalMoves` - Available moves for selected piece
- `gameOver` - Boolean game status

### **Data Structures**
```javascript
// Piece object
{ type: 'p', color: 'white' }

// Move object
{
  from: { file: 0, rank: 1 },
  to: { file: 0, rank: 3 },
  piece: { type: 'p', color: 'white' },
  capture: null | { type, color },
  promotion: null | 'q' | 'r' | 'b' | 'n',
  castling: null | 'kingside' | 'queenside',
  enPassant: boolean
}
```

---

## 🐛 Known Issues

All major bugs have been fixed! 🎉

---

## 📝 License

This is a personal project. Feel free to use and modify for learning purposes.

---

## 🙏 Credits

- Chess pieces: Unicode chess symbols
- Font: Google Fonts (Poppins)
- Icons: SVG graphics
- Design: Custom gradient theme

---

**Built with using JavaScript**

*Last updated: November 2, 2025*
