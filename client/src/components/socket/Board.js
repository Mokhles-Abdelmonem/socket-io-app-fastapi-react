import Square from "./Square";






export default function Board() {
    function handleClick(i) {

    }

  
    return (
      <>
        <div className="status"></div>
        <div className="board">
            <div className="board-row">
                <Square value="" onSquareClick={() => handleClick(0)} />
                <Square value="X" onSquareClick={() => handleClick(1)} />
                <Square value="O" onSquareClick={() => handleClick(2)} />
            </div>
            <div className="board-row">
                <Square value="X" onSquareClick={() => handleClick(3)} />
                <Square value="O" onSquareClick={() => handleClick(4)} />
                <Square value="" onSquareClick={() => handleClick(5)} />
            </div>
            <div className="board-row">
                <Square value="O" onSquareClick={() => handleClick(6)} />
                <Square value="X" onSquareClick={() => handleClick(7)} />
                <Square value="" onSquareClick={() => handleClick(8)} />
            </div>
        </div>
      </>
    );
  }