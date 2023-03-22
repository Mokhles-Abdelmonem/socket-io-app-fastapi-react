import Square from "./Square";






export default function RPSBoard({handleClick}) {
  

    return (
      <>
        <div className="status"></div>
        <div className="board">
            <div className="board-row">
                <Square value="R" onSquareClick={() => handleClick(0)} />
                <Square value="P" onSquareClick={() => handleClick(1)} />
                <Square value="S" onSquareClick={() => handleClick(2)} />
            </div>
        </div>
      </>
    );
  }