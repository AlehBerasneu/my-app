import "./App.css";
import React, { useState, useRef } from "react";
import Board from "./ui/Board";
import Interface from "./ui/Interface";
import { REST } from "./services/api.js";

function getGrid() {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid[i] = Array(9).fill(0);
  }
  return grid;
}

function copy2DArray(from, to) {
  for (let i = 0; i < from.length; i++) {
    to[i] = [...from[i]];
  }
}

function Sudoku() {
  const [grid, setGrid] = useState(getGrid);
  const [puzzleStatus, setPuzzleStatus] = useState("In Progress");
  const initialGrid = useRef(getGrid());

  function handleChange(row, col, e) {
    const re = /^[0-9\b]+$/;
    if (e.target.value === "" || re.test(e.target.value)) {
      if (Number(e.target.value) < 10 && initialGrid.current[row][col] === 0) {
        const newGrid = [...grid];
        newGrid[row][col] = Number(e.target.value);
        setGrid(newGrid);
      }
    }
  }

  async function handleInterface(action) {
    let newGrid;
    switch (action) {
      case "create":
        newGrid = await handleCreate();
        copy2DArray(newGrid, initialGrid.current);
        setPuzzleStatus("");
        setGrid(newGrid);
        setPuzzleStatus("In Progress");
        break;
      case "solve":
        newGrid = await handleSolve();
        setGrid(newGrid);
        break;
      case "clear":
        newGrid = getGrid();
        copy2DArray(newGrid, initialGrid.current);
        setGrid(newGrid);
        setPuzzleStatus("New Game");
        break;
      case "validate":
        const status = await handleValidate();
        const puzzStats = status ? "Complete" : "In Progress";
        setPuzzleStatus(puzzStats);
        break;
      default:
        throw new Error("Invalid action");
    }
  }

  async function handleCreate() {
    try {
      const response = await REST.getBoard();
      const data = await response.json();
      
      return data.game;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleValidate() {
    try {
      const response = await REST.validateBoard(grid);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSolve() {
    try {
      const response = await REST.solveBoard(grid);
      const data = await response.json();
      if (data.status) {
        setPuzzleStatus("Complete");
        return data.solution;
      } else {
        setPuzzleStatus("Unsolvable");
        return grid;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="Sudoku">
      <Board
        puzzle={initialGrid.current}
        grid={grid}
        handleChange={handleChange}
      />
      <Interface handleInterface={handleInterface} status={puzzleStatus} />
    </div>
  );
}

export default Sudoku;
