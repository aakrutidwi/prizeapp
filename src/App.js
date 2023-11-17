import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const apiUrl = "https://api.nobelprize.org/v1/prize.json";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const[isMultiOpen, setIsmultiopen] = useState(false)

  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl);
      setData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleJoinName = (fn, ln) => {
    return `${fn} ${ln}`;
  };

  const filteredData = data?.prizes?.filter(
    (item) =>
      (selectedYear === "All" || item.year === selectedYear) &&
      (selectedCategory === "All" || item.category === selectedCategory)
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const laureatesWithMultiplePrizes = data?.laureates?.filter((laureate) => {
    const laureatePrizes = data.prizes.filter((prize) =>
      prize.laureates.some((pLaureate) => pLaureate.id === laureate.id)
    );
    console.log(laureatePrizes)
    return laureatePrizes.length > 1;
  });

  return (
    <div className="AppWrapper">
    <div className='NavBarWrapper'>Nobel Prize Winners
    <button onClick={()=>setIsmultiopen(true)}>Mutli Winners</button>
    </div>

      {!isMultiOpen && <>
        {" "}
        <div className="filters">
          <label htmlFor="yearFilter">Select Year:</label>
          <select
            id="yearFilter"
            onChange={handleYearChange}
            value={selectedYear}
          >
            <option value="All">All</option>{" "}
            {[...new Set(data.prizes.map((item) => item.year))].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <label htmlFor="categoryFilter">Select Category:</label>
          <select
            id="categoryFilter"
            onChange={handleCategoryChange}
            value={selectedCategory}
          >
            <option value="All">All</option>
            {[...new Set(data.prizes.map((item) => item.category))].map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Category</th>
              <th>Laurates</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((item, index) => (
              <tr key={index}>
                <td>{item.year}</td>
                <td>{item.category}</td>
                <td>
                  {item?.laureates?.map((lauarate, lindex) => (
                    <span key={lindex}>
                      {handleJoinName(lauarate?.firstname, lauarate?.surname)}
                      {lindex < item?.laureates.length - 1 && ", "}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber >= currentPage - 1 &&
              pageNumber <= currentPage + 1 &&
              pageNumber <= totalPages
            ) {
              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={pageNumber === currentPage}
                >
                  {pageNumber}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </>}
      {isMultiOpen && (
        <div className="multiWinners">
          <span onClick={()=>setIsmultiopen(false)}>Back</span>
          <h2>Laureates with Multiple Prizes</h2>
          <ul>
            {laureatesWithMultiplePrizes?.map((laureate, index) => (
              <li key={index}>
                {handleJoinName(laureate?.firstname, laureate?.surname)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
