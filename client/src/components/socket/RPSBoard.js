import Square from "./Square";






export default function RPSBoard({Clicked, handleClick}) {
    const clickedSquare = (Clicked) => {
      if (Clicked === 0) return <Square value="R" /> 
      if (Clicked === 1) return <Square value="P" /> 
      if (Clicked === 2) return <Square value="S" /> 
    }
  

    return (
      <>
        <div className="status"></div>
        <div className="board">
            <div className="board-row">
              {
                Clicked ? (
                    <>
                    {clickedSquare(Clicked)}
                    </>
                  ):(
                    <>
                    <Square value="R" onSquareClick={() => handleClick(0)} />
                    <Square value="P" onSquareClick={() => handleClick(1)} />
                    <Square value="S" onSquareClick={() => handleClick(2)} />
                    </>
                    )
              }
            </div>
        </div>

      </>
    );
  }