import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const square_number = 3;

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ backgroundColor: props.isForcusedOn ? "#4CAF50" : "#FFFFFF" }}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isForcusedOn={this.props.winnerLine.includes(i)}
      />
    );
  }

  render() {
    let bordRowList = Array.from({ length: square_number }, (_, i) => i).map((i) => {
      return (
        <div
          key={i}
          className="board-row"
        >
          {Array.from({ length: square_number }, (_, j) => j).map((j) => {
            return this.renderSquare(i + j + (square_number - 1) * i);
          })}
        </div>
      );
    });
    return (
      <div>
        {bordRowList}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      movesOrderAsc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculatorWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  toggleMovesOrderAsc() {
    this.setState({
      movesOrderAsc: !this.state.movesOrderAsc,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner, winnerLine] = calculatorWinner(current.squares);
    let moves = history.map((step, move) => {
      let desc;
      if (move) {
        const [row, col] = calculatoColRow(history, move)
        desc = `Go to move #${move} (${row}, ${col})`;
      } else {
        desc = 'Go to game start';
      }
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            style={{ fontWeight: this.state.stepNumber === move ? "bold" : "normal" }}
          >{desc}</button>
        </li>
      )
    })
    if (!this.state.movesOrderAsc) {
      moves = moves.reverse()
    }

    let status;
    if (winner === 'draw') {
      status = `Draw`
    } else if (winner) {
      status = `Winner: ${winner}`
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerLine={winnerLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={!this.state.movesOrderAsc}>{moves}</ol>
          <div><button
            onClick={() => this.toggleMovesOrderAsc()}
          >{this.state.movesOrderAsc ? '↑' : '↓'}</button></div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculatorWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  let draw = null;
  if (!squares.some((ele) => ele === null)) {
    draw = 'draw'
  }
  return [draw, []];
}

function calculatoColRow(history, move) {
  let putIndex;
  if (move > 0) {
    putIndex = history[move].squares.findIndex((element, i) => {
      return element != history[move - 1].squares[i]
    });
  }
  const mapping = [...Array(square_number)].map((_, i) => {
    return [...Array(square_number)].map((_, j) => [i + 1, j + 1])
  }).flat();
  return mapping[putIndex];
}